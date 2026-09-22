import client from '../client';
import { ENDPOINTS } from '../endpoints';
import { useSessionStore } from '../../stores/useSessionStore';

/**
 * Executes an agent with SSE streaming via the NestJS AI proxy.
 * Calls POST /api/ai/agents/:agentId/stream
 *
 * @param {string} agentId - ID of the agent in Mastra
 * @param {string} prompt - User input topic / message content
 * @param {Object} callbacks
 * @param {function(string): void} callbacks.onToken - Called for each text fragment streamed back
 * @param {function(Object): void} callbacks.onEvent - Called for structured SSE event payloads
 * @param {function(Object): void} callbacks.onDone - Called when stream completes with usage/finish details
 * @param {function(Error): void} callbacks.onError - Called if stream fails
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel stream
 */
export async function streamAgentRun(agentId, prompt, callbacks, signal) {
  const { onToken, onEvent, onDone, onError } = callbacks;
  const token = useSessionStore.getState().token;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const url = `${baseUrl}/ai/agents/${encodeURIComponent(agentId)}/stream`;

  const payload = {
    messages: [
      {
        role: 'user',
        content: prompt || 'Execute default workflow task with optimal output.',
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errMessage = `HTTP error ${response.status}`;
      try {
        const errJson = await response.json();
        errMessage = errJson.error || errJson.message || errMessage;
      } catch {}
      throw new Error(errMessage);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    let accumulatedText = '';
    let usageMetrics = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();

        // Standard Mastra / AI SDK SSE prefixes:
        // 0:"text chunk" -> text token
        // e:{usage payload} -> event / end usage
        // d:{finishReason} -> done
        // 3:"error message" -> error
        if (dataStr.startsWith('0:')) {
          try {
            const tokenText = JSON.parse(dataStr.slice(2));
            accumulatedText += tokenText;
            if (onToken) onToken(tokenText);
          } catch {
            const tokenText = dataStr.slice(2);
            accumulatedText += tokenText;
            if (onToken) onToken(tokenText);
          }
        } else if (dataStr.startsWith('e:')) {
          try {
            const eventPayload = JSON.parse(dataStr.slice(2));
            usageMetrics = eventPayload.usage || usageMetrics;
            if (onEvent) onEvent(eventPayload);
          } catch {}
        } else if (dataStr.startsWith('d:')) {
          try {
            const donePayload = JSON.parse(dataStr.slice(2));
            if (onEvent) onEvent({ type: 'done', payload: donePayload });
          } catch {}
        } else if (dataStr.startsWith('3:')) {
          try {
            const errMsg = JSON.parse(dataStr.slice(2));
            throw new Error(errMsg);
          } catch (e) {
            throw e instanceof Error ? e : new Error(dataStr.slice(2));
          }
        } else {
          // Direct JSON event fallback
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              accumulatedText += parsed.text;
              if (onToken) onToken(parsed.text);
            }
            if (onEvent) onEvent(parsed);
          } catch {}
        }
      }
    }

    if (onDone) {
      onDone({
        fullText: accumulatedText,
        usage: usageMetrics,
      });
    }

    return { fullText: accumulatedText, usage: usageMetrics };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('[runService] Stream aborted by user');
      return;
    }
    console.error('[runService] Agent stream execution error:', err);
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Executes a Mastra workflow directly via POST /api/ai/workflows/:workflowId/run
 *
 * @param {string} workflowId
 * @param {Object} input
 * @returns {Promise<Object>}
 */
export async function runMastraWorkflow(workflowId, input = {}) {
  return client.post(ENDPOINTS.WORKFLOW_RUN(workflowId), input);
}

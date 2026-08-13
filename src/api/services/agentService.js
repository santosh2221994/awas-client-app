import client from '../client';
import { ENDPOINTS } from '../endpoints';
import { useSessionStore } from '../../stores/useSessionStore';

// Static price overrides for specific marketplace agents
const AGENT_PRICE_MAP = {
  'deep-search-agent': '$19',
  'browser-agent': '$29',
};

function getLocalAgents() {
  const custom = localStorage.getItem('custom_agents');
  const customList = custom ? JSON.parse(custom) : [];
  return customList.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    type: agent.type || 'Custom Agent',
    model: agent.model || 'gpt-4o',
    tools: agent.tools || [],
    price: agent.price || 'Free',
    username: agent.username || 'creator',
    sellOnMarketplace: agent.sellOnMarketplace
  }));
}

export function listAgents() {
  return client.get(ENDPOINTS.AGENTS)
    .then((data) => {
      const agentList = Array.isArray(data) ? data : Object.values(data ?? {});

      const apiAgents = agentList.map((agent) => {
        const id = agent.id || agent.name;
        const rawPrice = agent.metadata?.price ?? agent.price;
        const formattedPrice = (rawPrice !== undefined && rawPrice !== null && rawPrice !== 'Free' && rawPrice !== 0)
          ? `$${rawPrice}`
          : (AGENT_PRICE_MAP[id] ?? 'Free');

        return {
          id,
          name: agent.name,
          description: agent.description,
          model: agent.modelId || agent.model || agent.modelName,
          type: agent.provider || agent.type,
          tools: Object.values(agent.tools || {}).map((t) => ({ name: (t.name || t.description || '').slice(0, 40), id: t.id })),
          price: formattedPrice,
          username: agent.metadata?.username || agent.username || 'creator',
        };
      });

      return [...getLocalAgents(), ...apiAgents];
    })
    .catch((err) => {
      console.warn('[listAgents] failed, falling back to local agents', err);
      return getLocalAgents();
    });
}

export function getAgentById(agentId) {
  if (agentId.startsWith('custom-')) {
    const custom = localStorage.getItem('custom_agents');
    const customList = custom ? JSON.parse(custom) : [];
    const matched = customList.find(a => a.id === agentId);
    return Promise.resolve({
      id: agentId,
      name: matched?.name || 'Unknown Agent',
      description: matched?.description || 'No description provided.',
      model: matched?.model || 'gpt-4o',
      type: matched?.type || 'Agent',
      provider: 'openai',
      instructions: 'You are a helpful assistant specialized in this workflow.',
      tools: matched?.tools || [],
      workspaceTools: [],
      browserTools: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return client.get(ENDPOINTS.AGENT_BY_ID(agentId))
    .then((agent) => ({
      id: agent.id || agent.name,
      name: agent.name,
      description: agent.description,
      model: agent.modelId || agent.model || agent.modelName,
      type: agent.provider || agent.type,
      provider: agent.provider,
      instructions: agent.instructions || agent.initialInstructions || '',
      tools: Object.values(agent.tools || {}).map((t) => ({
        id: t.id,
        name: t.name || t.description,
        description: t.description || '',
      })),
      workspaceTools: agent.workspaceTools || [],
      browserTools: agent.browserTools || [],
      status: agent.status || 'active',
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }))
    .catch((err) => {
      console.warn(`API getAgentById(${agentId}) failed`, err);
      throw err;
    });
}

/**
 * Blocking JSON generate — kept for backward compatibility.
 */
export function generateAgentResponse(agentId, messages, threadId) {
  return client.post(
    ENDPOINTS.AGENT_GENERATE(agentId),
    {
      messages,
      memory: {
        thread: threadId,
        resource: 'default-user',
      },
    },
    { timeout: 120000 }
  );
}

/**
 * Streaming generate — uses fetch with `Accept: text/event-stream`.
 *
 * Parses the Vercel AI SDK wire protocol emitted by Mastra:
 *   0:"token"          → text delta
 *   8:[{reasoning}]    → reasoning/thinking steps
 *   e:{usage:{...}}   → step finish with token usage
 *   d:{...}            → done / stream end
 *
 * @param {string} agentId
 * @param {Array}  messages
 * @param {string} threadId
 * @param {{
 *   onToken: (text: string) => void,
 *   onReasoning: (text: string) => void,
 *   onUsage: (usage: {promptTokens: number, completionTokens: number}) => void,
 *   onDone: () => void,
 *   onError: (err: Error) => void,
 * }} callbacks
 */
export async function streamAgentGenerate(agentId, messages, threadId, callbacks = {}) {
  const { onToken, onReasoning, onUsage, onDone, onError } = callbacks;
  const startTime = Date.now();

  const token = useSessionStore.getState().token;
  // Bypass Vite proxy for streaming — call NestJS backend directly so SSE
  // chunks are not buffered by the proxy before reaching the browser.
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  let response;
  try {
    response = await fetch(`${backendURL}/ai/agents/${agentId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages,
        memory: {
          thread: threadId,
          resource: 'default-user',
        },
      }),
    });
  } catch (err) {
    onError?.(err);
    return;
  }

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try { const j = await response.json(); msg = j?.error || msg; } catch {}
    onError?.(new Error(msg));
    return;
  }

  const responseContentType = response.headers.get('content-type') ?? '';

  // If backend returned JSON instead of SSE (e.g. fallback path), handle inline
  if (!responseContentType.includes('event-stream') && !responseContentType.includes('text/plain')) {
    try {
      const json = await response.json();
      const text = json?.text || json?.content?.[0]?.text || json?.steps?.[0]?.text || json?.message || '';
      if (text) onToken?.(text);
      const usage = json?.usage || json?.totalUsage;
      if (usage) {
        onUsage?.({
          promptTokens: usage.inputTokens ?? usage.promptTokens ?? 0,
          completionTokens: usage.outputTokens ?? usage.completionTokens ?? 0,
          duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
        });
      }
      onDone?.();
    } catch { onError?.(new Error('Failed to parse response')); }
    return;
  }

  if (!response.body) {
    onError?.(new Error('No response body'));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let doneEmitted = false;

  const emitDone = () => {
    if (!doneEmitted) {
      doneEmitted = true;
      onDone?.();
    }
  };

  /**
   * ThinkTagParser — stateful parser for streaming `<think>…</think>` tags.
   *
   * GLM-4 / ZhipuAI thinking models emit reasoning inside `<think>` tags
   * in the regular text stream (prefix `0:`). This parser routes content
   * between those tags to onReasoning, and everything else to onToken.
   *
   * State machine:
   *   NORMAL  → accumulates regular text until "<think>" is seen
   *   THINKING → accumulates reasoning text until "</think>" is seen
   *
   * Works across chunk boundaries (partial tags are buffered).
   */
  const thinkParser = (() => {
    let state = 'NORMAL'; // 'NORMAL' | 'THINKING'
    let partial = '';     // incomplete tag fragment at chunk boundary

    return {
      feed(chunk) {
        let input = partial + chunk;
        partial = '';

        while (input.length > 0) {
          if (state === 'NORMAL') {
            const openIdx = input.indexOf('<think>');
            if (openIdx === -1) {
              // No opening tag — check if input ends with a partial tag prefix
              const tagStart = ['<', '<t', '<th', '<thi', '<thin', '<think'].findIndex(
                p => input.endsWith(p)
              );
              if (tagStart !== -1) {
                const safeText = input.slice(0, input.length - ['<', '<t', '<th', '<thi', '<thin', '<think'][tagStart].length);
                if (safeText) onToken?.(safeText);
                partial = input.slice(input.length - ['<', '<t', '<th', '<thi', '<thin', '<think'][tagStart].length);
              } else {
                if (input) onToken?.(input);
              }
              break;
            } else {
              // Flush text before the tag
              if (openIdx > 0) onToken?.(input.slice(0, openIdx));
              state = 'THINKING';
              input = input.slice(openIdx + '<think>'.length);
            }
          } else {
            // state === 'THINKING'
            const closeIdx = input.indexOf('</think>');
            if (closeIdx === -1) {
              // Check for partial closing tag at end
              const closing = '</think>';
              let partialMatch = '';
              for (let i = closing.length - 1; i >= 1; i--) {
                if (input.endsWith(closing.slice(0, i))) {
                  partialMatch = closing.slice(0, i);
                  break;
                }
              }
              const safeReasoning = input.slice(0, input.length - partialMatch.length);
              if (safeReasoning) onReasoning?.(safeReasoning);
              partial = partialMatch;
              break;
            } else {
              // Flush reasoning up to closing tag
              if (closeIdx > 0) onReasoning?.(input.slice(0, closeIdx));
              state = 'NORMAL';
              input = input.slice(closeIdx + '</think>'.length);
            }
          }
        }
      },
    };
  })();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Stream fully consumed — always fire onDone
        emitDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process all complete lines in the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // Keep the last partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // skip empty lines / SSE comments

        // Strip standard SSE 'data: ' prefix that Mastra adds
        const dataLine = trimmed.startsWith('data: ')
          ? trimmed.slice(6)
          : trimmed.startsWith('data:')
            ? trimmed.slice(5)
            : trimmed;

        if (!dataLine || dataLine === '[DONE]') continue;

        // 1. Try parsing as JSON (Mastra EventStream format e.g. {"type":"text-delta","textDelta":"..."})
        let parsedJson = null;
        try {
          parsedJson = JSON.parse(dataLine);
        } catch {
          parsedJson = null;
        }

        if (parsedJson !== null && typeof parsedJson === 'object') {
          const evtType = parsedJson.type;
          const p = parsedJson.payload ?? {};

          if (evtType === 'text-delta' || evtType === 'text' || evtType === 'text-start') {
            const text = p.text ?? p.textDelta ?? p.delta ?? p.content ?? parsedJson.textDelta ?? parsedJson.text ?? parsedJson.delta ?? parsedJson.content ?? '';
            if (text) thinkParser.feed(text);
          } else if (evtType === 'reasoning-delta' || evtType === 'reasoning' || evtType === 'thinking') {
            const reasoning = p.text ?? p.reasoning ?? p.textDelta ?? p.delta ?? parsedJson.reasoning ?? parsedJson.textDelta ?? parsedJson.text ?? '';
            if (reasoning) onReasoning?.(reasoning);
          } else if (evtType === 'finish' || evtType === 'done' || evtType === 'complete' || evtType === 'step-finish') {
            const usage = p.usage ?? parsedJson.usage ?? parsedJson.totalUsage;
            const finishReason = p.finishReason ?? parsedJson.finishReason ?? 'stop';
            if (usage) {
              onUsage?.({
                promptTokens: usage.promptTokens ?? usage.inputTokens ?? usage.prompt_tokens ?? 0,
                completionTokens: usage.completionTokens ?? usage.outputTokens ?? usage.completion_tokens ?? 0,
                finishReason,
                time: Date.now(),
                duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
              });
            }
            if (evtType === 'finish' || evtType === 'done' || evtType === 'complete') {
              emitDone();
            }
          } else {
            // Generic object chunk
            const text = p.text ?? p.textDelta ?? p.delta ?? parsedJson.textDelta ?? parsedJson.delta ?? (typeof parsedJson.text === 'string' ? parsedJson.text : '');
            if (text) {
              thinkParser.feed(text);
            }
            const reasoning = p.reasoning ?? p.reasoningDelta ?? parsedJson.reasoningDelta ?? (typeof parsedJson.reasoning === 'string' ? parsedJson.reasoning : '');
            if (reasoning) {
              onReasoning?.(reasoning);
            }
            const usage = p.usage ?? parsedJson.usage;
            const finishReason = p.finishReason ?? parsedJson.finishReason ?? 'stop';
            if (usage) {
              onUsage?.({
                promptTokens: usage.promptTokens ?? usage.inputTokens ?? usage.prompt_tokens ?? 0,
                completionTokens: usage.completionTokens ?? usage.outputTokens ?? usage.completion_tokens ?? 0,
                finishReason,
                time: Date.now(),
                duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
              });
            }
          }
          continue;
        }


        if (typeof parsedJson === 'string') {
          thinkParser.feed(parsedJson);
          continue;
        }

        // 2. Vercel AI SDK wire protocol format: PREFIX:PAYLOAD (e.g. 0:"text", 8:[...], e:{...}, d:{...})
        const colonIdx = dataLine.indexOf(':');
        if (colonIdx !== -1) {
          const prefix = dataLine.slice(0, colonIdx);
          const payload = dataLine.slice(colonIdx + 1);

          if (['0', '1', '2', '8', 'e', 'd'].includes(prefix)) {
            try {
              if (prefix === '0') {
                const text = JSON.parse(payload);
                if (typeof text === 'string' && text) {
                  thinkParser.feed(text);
                }
              } else if (prefix === '8') {
                const steps = JSON.parse(payload);
                if (Array.isArray(steps)) {
                  for (const step of steps) {
                    const reasoning =
                      step?.details?.find?.(d => d.type === 'text')?.text ??
                      step?.reasoning ??
                      step?.text ??
                      '';
                    if (reasoning) onReasoning?.(reasoning);
                  }
                }
              } else if (prefix === 'e') {
                const data = JSON.parse(payload);
                if (data?.usage) {
                  onUsage?.({
                    promptTokens: data.usage.promptTokens ?? data.usage.prompt_tokens ?? 0,
                    completionTokens: data.usage.completionTokens ?? data.usage.completion_tokens ?? 0,
                    finishReason: data.finishReason ?? 'stop',
                    time: Date.now(),
                    duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                  });
                }
              } else if (prefix === 'd') {
                try {
                  const data = JSON.parse(payload);
                  if (data?.usage) {
                    onUsage?.({
                      promptTokens: data.usage.promptTokens ?? data.usage.prompt_tokens ?? 0,
                      completionTokens: data.usage.completionTokens ?? data.usage.completion_tokens ?? 0,
                      finishReason: data.finishReason ?? 'stop',
                      time: Date.now(),
                      duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                    });
                  }
                } catch {}
                emitDone();
              }
            } catch {
              // Ignore parse errors
            }
            continue;
          }
        }

        // 3. Fallback raw text string
        thinkParser.feed(dataLine);

      }
    }
  } catch (err) {
    onError?.(err);
  } finally {
    reader.releaseLock();
  }
}

export function getAgentThreads(agentId) {
  return client.get(`${ENDPOINTS.MEMORY_THREADS}?resourceId=${agentId}`).then((data) => data.threads || []);
}

export function getThreadMessages(threadId) {
  return client.get(ENDPOINTS.MEMORY_THREAD_MESSAGES(threadId)).then((data) => data.messages || []);
}

export function getLogs() {
  return client.get(`${ENDPOINTS.LOGS}?transportId=default`).then((data) => data.logs || []);
}

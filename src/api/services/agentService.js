import client from '../client';
import { ENDPOINTS } from '../endpoints';
import { useSessionStore } from '../../stores/useSessionStore';

// Static price overrides for specific marketplace agents
const AGENT_PRICE_MAP = {
  'deep-search-agent': '$19',
  'browser-agent': '$29',
};

function getLocalAgents() {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
  let customList = custom ? JSON.parse(custom) : [];

  // Clean up any accidental agentbuilder duplicates from custom_agents in localStorage
  const cleanedCustom = customList.filter(agent => {
    const nameLower = (agent.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const idLower = (agent.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return !nameLower.includes('agentbuild') && !idLower.includes('agentbuild');
  });

  if (cleanedCustom.length !== customList.length && typeof window !== 'undefined') {
    try {
      localStorage.setItem('custom_agents', JSON.stringify(cleanedCustom));
    } catch {}
    customList = cleanedCustom;
  }

  const defaultSystemAgents = [
    {
      id: 'agent-builder-agent',
      name: 'Agent Builder Co-Pilot',
      description: 'Conversational AI Co-Pilot for designing, tuning system prompts, selecting tools, and creating autonomous AI agents via chat.',
      type: 'Co-Pilot',
      model: 'gpt-4o',
      tools: [{ name: 'Skill List' }, { name: 'Exa Search' }],
      price: 'Free',
      username: 'AWAS Platform'
    }
  ];

  const formattedCustom = customList.map(agent => ({
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

  const customIds = new Set(formattedCustom.map(a => a.id));
  const missingDefaults = defaultSystemAgents.filter(d => !customIds.has(d.id));

  return [...missingDefaults, ...formattedCustom];
}

function normalizeAgentKey(agent) {
  const idStr = String(agent?.id || '').toLowerCase();
  const nameStr = String(agent?.name || '').toLowerCase();
  if (idStr.includes('agentbuild') || nameStr.includes('agentbuild')) {
    return 'agent-builder-agent';
  }
  return (idStr || nameStr).replace(/[^a-z0-9]/g, '');
}

function dedupeAgents(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const key = normalizeAgentKey(item);
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

export function listAgents() {
  return client.get(ENDPOINTS.AGENTS)
    .then((data) => {
      const agentList = Array.isArray(data) ? data : Object.values(data ?? {});

      const apiAgents = agentList.map((agent) => {
        const rawId = agent.id || agent.name;
        const normKey = normalizeAgentKey({ id: rawId, name: agent.name });
        const id = normKey === 'agent-builder-agent' ? 'agent-builder-agent' : rawId;
        const rawPrice = agent.metadata?.price ?? agent.price;
        const formattedPrice = (rawPrice !== undefined && rawPrice !== null && rawPrice !== 'Free' && rawPrice !== 0)
          ? `$${rawPrice}`
          : (AGENT_PRICE_MAP[id] ?? 'Free');

        return {
          id,
          name: normKey === 'agent-builder-agent' ? 'Agent Builder Co-Pilot' : agent.name,
          description: agent.description,
          model: agent.modelId || agent.model || agent.modelName,
          type: normKey === 'agent-builder-agent' ? 'Co-Pilot' : (agent.provider || agent.type),
          tools: Object.values(agent.tools || {}).map((t) => ({ name: (t.name || t.description || '').slice(0, 40), id: t.id })),
          price: formattedPrice,
          username: agent.metadata?.username || agent.username || 'AWAS Platform',
        };
      });

      return dedupeAgents([...getLocalAgents(), ...apiAgents]);
    })
    .catch((err) => {
      console.warn('[listAgents] failed, falling back to local agents', err);
      return dedupeAgents(getLocalAgents());
    });
}

export function getAgentById(agentId) {
  if (agentId === 'agent-builder-agent') {
    return Promise.resolve({
      id: 'agent-builder-agent',
      name: 'Agent Builder Co-Pilot',
      description: 'Conversational AI Co-Pilot for designing, tuning system prompts, selecting tools, and creating autonomous AI agents via chat.',
      model: 'gpt-4o',
      type: 'Co-Pilot',
      provider: 'openai',
      instructions: `You are the AWAS Agent Builder Co-Pilot, an expert AI Agent Architect and Prompt Engineer embedded within AWAS Studio.

Your mission is to conversationally guide users in building, drafting system instructions for, and configuring standalone AI Agents.`,
      tools: [{ id: 'skillListTool', name: 'Skill List' }, { id: 'exaSearchTool', name: 'Exa Search' }],
      workspaceTools: [],
      browserTools: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (agentId.startsWith('custom-')) {
    const custom = localStorage.getItem('custom_agents');
    const customList = custom ? JSON.parse(custom) : [];
    const matched = customList.find(a => a.id === agentId);
    
    const name = matched?.name || 'Custom Agent';
    const role = matched?.type || matched?.role || name;
    const desc = matched?.description || 'No description provided.';
    const systemPromptText = matched?.instructions || 
      `You are ${name}, an autonomous AI specialist for ${role}.\n\n` +
      `Role & Primary Goal:\n` +
      `${desc}\n\n` +
      `Task Execution & Rules:\n` +
      `- Analyze workflow inputs carefully.\n` +
      `- Execute node tasks accurately.\n` +
      `- Return clear, structured, and high quality responses.`;

    return Promise.resolve({
      id: agentId,
      name,
      description: desc,
      model: matched?.model || 'gpt-4o',
      type: role,
      provider: 'openai',
      instructions: systemPromptText,
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
/**
 * Creates a stateful parser for streaming `<think>…</think>` reasoning tags.
 */
function createThinkTagParser(onToken, onReasoning) {
  let isThinking = false;
  let buffer = '';

  return {
    feed(chunk) {
      if (!chunk) return;
      let text = buffer + chunk;
      buffer = '';

      while (text.length > 0) {
        if (!isThinking) {
          const openIdx = text.indexOf('<think>');
          if (openIdx === -1) {
            // Check for partial opening tag at the end
            const match = text.match(/<t?(?:h(?:i(?:n(?:k)?)?)?)?$/i);
            if (match) {
              const safeText = text.slice(0, match.index);
              if (safeText) onToken?.(safeText);
              buffer = text.slice(match.index);
            } else {
              onToken?.(text);
            }
            break;
          } else {
            if (openIdx > 0) onToken?.(text.slice(0, openIdx));
            isThinking = true;
            text = text.slice(openIdx + 7);
          }
        } else {
          const closeIdx = text.indexOf('</think>');
          if (closeIdx === -1) {
            // Check for partial closing tag at the end
            const match = text.match(/<\/?t?(?:h(?:i(?:n(?:k)?)?)?)?$/i);
            if (match) {
              const safeReasoning = text.slice(0, match.index);
              if (safeReasoning) onReasoning?.(safeReasoning);
              buffer = text.slice(match.index);
            } else {
              onReasoning?.(text);
            }
            break;
          } else {
            if (closeIdx > 0) onReasoning?.(text.slice(0, closeIdx));
            isThinking = false;
            text = text.slice(closeIdx + 8);
          }
        }
      }
    },
    flush() {
      if (buffer) {
        if (isThinking) {
          onReasoning?.(buffer);
        } else {
          onToken?.(buffer);
        }
        buffer = '';
      }
    },
  };
}

/**
 * Dispatches a single decoded SSE data line to the appropriate callback.
 * Returns true if the stream was marked completed or errored.
 */
function dispatchSSELine(dataLine, thinkParser, callbacks, startTime) {
  const { onToken, onReasoning, onUsage, onError, onDone } = callbacks;

  // 1. Mastra JSON event format (e.g. {"type":"text-delta","payload":{"textDelta":"..."}})
  if (dataLine.startsWith('{') && dataLine.endsWith('}')) {
    try {
      const parsed = JSON.parse(dataLine);
      const evtType = parsed.type;
      const p = parsed.payload ?? parsed;

      if (evtType === 'text-delta' || evtType === 'text' || evtType === 'text-start') {
        const text = p.textDelta ?? p.text ?? p.delta ?? p.content ?? '';
        if (text) thinkParser.feed(text);
        return false;
      }
      if (evtType === 'reasoning-delta' || evtType === 'reasoning' || evtType === 'thinking' || evtType === 'reasoning_content') {
        const reasoning = p.reasoning_content ?? p.reasoningContent ?? p.reasoningDelta ?? p.reasoning ?? '';
        if (reasoning) onReasoning?.(reasoning);
        return false;
      }
      if (evtType === 'finish' || evtType === 'done' || evtType === 'complete' || evtType === 'step-finish') {
        const usage = p.usage ?? parsed.usage ?? parsed.totalUsage;
        if (usage) {
          onUsage?.({
            promptTokens: usage.promptTokens ?? usage.inputTokens ?? usage.prompt_tokens ?? 0,
            completionTokens: usage.completionTokens ?? usage.outputTokens ?? usage.completion_tokens ?? 0,
            finishReason: p.finishReason ?? parsed.finishReason ?? 'stop',
            duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
          });
        }
        if (evtType !== 'step-finish') {
          onDone?.();
          return true;
        }
        return false;
      }

      // Generic object fallback
      const reasoning = p.reasoning_content ?? p.reasoningContent ?? p.reasoningDelta ?? p.reasoning ?? p.thinking;
      if (reasoning) onReasoning?.(reasoning);
      const text = p.textDelta ?? p.text ?? p.delta ?? p.content;
      if (text && !reasoning) thinkParser.feed(text);
      return false;
    } catch {}
  }

  // 2. Vercel AI SDK wire protocol format: PREFIX:PAYLOAD
  const colonIdx = dataLine.indexOf(':');
  if (colonIdx === 1) {
    const prefix = dataLine[0];
    const payload = dataLine.slice(2);

    try {
      if (prefix === '0') {
        const text = JSON.parse(payload);
        if (typeof text === 'string' && text) thinkParser.feed(text);
      } else if (prefix === 'g' || prefix === 'r') {
        const text = JSON.parse(payload);
        if (typeof text === 'string' && text) onReasoning?.(text);
      } else if (prefix === '8') {
        const steps = JSON.parse(payload);
        if (Array.isArray(steps)) {
          for (const step of steps) {
            const reasoning = step?.details?.find?.((d) => d.type === 'text')?.text ?? step?.reasoning ?? step?.text;
            if (reasoning) onReasoning?.(reasoning);
          }
        }
      } else if (prefix === 'e' || prefix === 'd') {
        const data = JSON.parse(payload);
        if (data?.usage) {
          onUsage?.({
            promptTokens: data.usage.promptTokens ?? data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completionTokens ?? data.usage.completion_tokens ?? 0,
            finishReason: data.finishReason ?? 'stop',
            duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
          });
        }
        if (prefix === 'd') {
          onDone?.();
          return true;
        }
      } else if (prefix === '3') {
        let errMsg = payload;
        try {
          const parsed = JSON.parse(payload);
          errMsg = typeof parsed === 'string' ? parsed : parsed?.message || payload;
        } catch {
          if (errMsg.startsWith('"') && errMsg.endsWith('"')) errMsg = errMsg.slice(1, -1);
        }
        onError?.(new Error(errMsg));
        onDone?.();
        return true;
      }
    } catch {}
    return false;
  }

  // 3. Fallback raw text line (if not an alphanumeric prefix code)
  if (!/^[0-9a-z]:/i.test(dataLine)) {
    thinkParser.feed(dataLine);
  }
  return false;
}

/**
 * Streaming generate — uses fetch with `Accept: text/event-stream`.
 *
 * Efficiently decodes SSE lines, thinking tags (`<think>…</think>`),
 * Vercel AI SDK wire protocol prefixes, and Mastra event stream payloads.
 *
 * @param {string} agentId
 * @param {Array}  messages
 * @param {string} threadId
 * @param {{
 *   onToken?: (text: string) => void,
 *   onReasoning?: (text: string) => void,
 *   onUsage?: (usage: {promptTokens: number, completionTokens: number, duration: string}) => void,
 *   onDone?: () => void,
 *   onError?: (err: Error) => void,
 * }} callbacks
 */
export async function streamAgentGenerate(agentId, messages, threadId, callbacks = {}) {
  const { onToken, onReasoning, onUsage, onDone, onError } = callbacks;
  const startTime = Date.now();

  const token = useSessionStore.getState().token;
  const rawBackendURL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || '/api';
  const backendURL = rawBackendURL.startsWith('http') ? '/api' : rawBackendURL.replace(/\/+$/, '');

  const selectedModel = (await import('../../stores/useUIStore')).useUIStore.getState().selectedModel;

  const payload = JSON.stringify({
    messages,
    memory: {
      thread: threadId,
      resource: 'default-user',
    },
    modelId: selectedModel,
  });

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'x-model-id': selectedModel || '',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response;
  try {
    response = await fetch(`${backendURL}/ai/agents/${agentId}/stream`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (response.status === 404) {
      // Fallback for older backend route
      response = await fetch(`${backendURL}/ai/agents/${agentId}/generate`, {
        method: 'POST',
        headers,
        body: payload,
      });
    }
  } catch (err) {
    onError?.(err);
    return;
  }

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const j = await response.json();
      msg = j?.error || j?.message || msg;
    } catch {}
    onError?.(new Error(msg));
    return;
  }

  const responseContentType = response.headers.get('content-type') ?? '';

  // Non-streaming JSON fallback
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
    } catch {
      onError?.(new Error('Failed to parse response'));
    }
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

  const thinkParser = createThinkTagParser(onToken, onReasoning);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        thinkParser.flush();
        emitDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        const dataLine = trimmed.startsWith('data: ')
          ? trimmed.slice(6)
          : trimmed.startsWith('data:')
            ? trimmed.slice(5)
            : trimmed;

        if (!dataLine || dataLine === '[DONE]') continue;

        const isFinished = dispatchSSELine(dataLine, thinkParser, callbacks, startTime);
        if (isFinished) {
          doneEmitted = true;
          try { reader.cancel(); } catch {}
          return;
        }
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

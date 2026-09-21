/**
 * llmConnectionService.js
 * Centralized utility for managing and fetching LLM provider connections.
 * Shares LLM connections between LLMConnectionsPage and model selector dropdowns.
 */

export const INITIAL_CONNECTIONS = [
  { id: 'openai', name: 'OpenAI', provider: 'OpenAI', model: 'gpt-4o', status: 'Connected', apiKey: 'sk-...aX92', type: 'LLM', lastTested: '10 min ago' },
  { id: 'anthropic', name: 'Anthropic Claude', provider: 'Anthropic', model: 'claude-3-5-sonnet', status: 'Connected', apiKey: 'sk-ant-...bZ14', type: 'LLM', lastTested: '1 hour ago' },
  { id: 'gemini', name: 'Google Gemini', provider: 'Google', model: 'gemini-1.5-pro', status: 'Connected', apiKey: 'AIza...P3kQ', type: 'LLM', lastTested: '3 hours ago' },
  { id: 'groq', name: 'Groq', provider: 'Groq', model: 'llama3-70b-8192', status: 'Connected', apiKey: 'gsk_...x91L', type: 'LLM', lastTested: 'Never' },
  { id: 'azure-oai', name: 'Azure OpenAI', provider: 'Microsoft Azure', model: 'gpt-4o (azure)', status: 'Disconnected', apiKey: '—', type: 'LLM', lastTested: 'Never' },
  { id: 'bedrock', name: 'AWS Bedrock', provider: 'Amazon', model: 'titan-text-v2', status: 'Connected', apiKey: 'AKIA...R9cL', type: 'Embedding', lastTested: '2 hours ago' },
];

export function getLLMConnections() {
  if (typeof window === 'undefined') return INITIAL_CONNECTIONS;
  try {
    const saved = localStorage.getItem('llm_connections');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[llmConnectionService] Failed to read llm_connections', err);
  }
  return INITIAL_CONNECTIONS;
}

export function saveLLMConnections(connections) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('llm_connections', JSON.stringify(connections));
  } catch (err) {
    console.warn('[llmConnectionService] Failed to save llm_connections', err);
  }
}

export function getConnectedLLMModels() {
  const connections = getLLMConnections();
  const llmConns = connections.filter((c) => c.type === 'LLM');
  if (llmConns.length === 0) {
    return [
      { id: 'gpt-4o', label: 'OpenAI (gpt-4o)' },
      { id: 'claude-3-5-sonnet', label: 'Anthropic (claude-3-5-sonnet)' },
      { id: 'gemini-1.5-pro', label: 'Google Gemini (gemini-1.5-pro)' },
      { id: 'llama3-70b-8192', label: 'Groq (llama3-70b-8192)' },
    ];
  }
  return llmConns.map((c) => ({
    id: c.model,
    label: `${c.name} (${c.model})`,
    provider: c.provider,
    status: c.status,
  }));
}

import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function listAgents() {
  return client.get(ENDPOINTS.AGENTS).then((data) =>
    Object.values(data).map((agent) => ({
      id: agent.id || agent.name,
      name: agent.name,
      description: agent.description,
      model: agent.modelId,
      type: agent.provider,
      tools: Object.values(agent.tools || {}).map((t) => ({ name: t.description?.slice(0, 40), id: t.id })),
    }))
  );
}

export function getAgentById(agentId) {
  return client.get(ENDPOINTS.AGENT_BY_ID(agentId)).then((agent) => ({
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
  }));
}

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

export function streamAgentResponse(agentId, messages, requestOptions = {}) {
  return client.post(ENDPOINTS.AGENT_STREAM(agentId), {
    messages,
    ...requestOptions,
  });
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

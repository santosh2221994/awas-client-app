import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function listAgents() {
  return client.get(ENDPOINTS.AGENTS).then((data) =>
    Object.values(data).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      model: agent.modelId,
      type: agent.provider,
      tools: Object.values(agent.tools || {}).map((t) => ({ name: t.description?.slice(0, 40), id: t.id })),
    }))
  );
}

export function generateAgentResponse(agentId, messages) {
  return client.post(ENDPOINTS.AGENT_GENERATE(agentId), { messages });
}

export function streamAgentResponse(agentId, messages) {
  return client.post(ENDPOINTS.AGENT_STREAM(agentId), { messages });
}

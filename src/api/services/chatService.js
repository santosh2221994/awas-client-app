import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function generateAgentResponse(agentId, messages) {
  return client.post(ENDPOINTS.AGENT_GENERATE(agentId), { messages });
}

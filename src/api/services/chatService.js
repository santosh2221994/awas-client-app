import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function generateAgentResponse(agentId, messages, threadId) {
  const resolvedAgentId = agentId || 'studio-chat-agent';
  const resolvedThreadId = threadId || crypto.randomUUID();

  return client.post(
    ENDPOINTS.AGENT_GENERATE(resolvedAgentId),
    {
      messages,
      memory: {
        thread: resolvedThreadId,
        resource: 'default-user',
      },
    }
  );
}

export function getMemoryThreads() {
  return client.get(ENDPOINTS.MEMORY_THREADS);
}

import { streamAgentGenerate } from './agentService';
import client from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * Streaming chat service entry point.
 * Delegates to streamAgentGenerate with caller-provided callbacks.
 */
export function streamChatResponse(agentId, messages, threadId, callbacks = {}) {
  const resolvedAgentId = agentId || 'studio-chat-agent';
  const resolvedThreadId = threadId || crypto.randomUUID();
  return streamAgentGenerate(resolvedAgentId, messages, resolvedThreadId, callbacks);
}

export function getMemoryThreads() {
  return client.get(ENDPOINTS.MEMORY_THREADS);
}

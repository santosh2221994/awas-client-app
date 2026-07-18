export const ENDPOINTS = {
  AGENTS: '/agents',
  AGENT_BY_ID: (agentId) => `/agents/${agentId}`,
  AGENT_GENERATE: (agentId) => `/agents/${agentId}/generate`,
  AGENT_STREAM: (agentId) => `/agents/${agentId}/stream`,
  WORKFLOWS: '/workflows',
  WORKFLOW_RUN: (workflowId) => `/workflows/${workflowId}/run`,
  MEMORY_THREADS: '/memory/threads',
  MEMORY_THREAD_MESSAGES: (threadId) => `/memory/threads/${threadId}/messages`,
  LOGS: '/logs',
};

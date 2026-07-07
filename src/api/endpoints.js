export const ENDPOINTS = {
  AGENTS: '/agents',
  AGENT_GENERATE: (agentId) => `/agents/${agentId}/generate`,
  AGENT_STREAM: (agentId) => `/agents/${agentId}/stream`,
  WORKFLOWS: '/workflows',
  WORKFLOW_RUN: (workflowId) => `/workflows/${workflowId}/run`,
};

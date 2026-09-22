export const ENDPOINTS = {
  // ── AI Proxy (Mastra) ─────────────────────────────────────────────────────
  AGENTS: '/ai/agents',
  AGENT_BY_ID: (agentId) => `/ai/agents/${agentId}`,
  AGENT_GENERATE: (agentId) => `/ai/agents/${agentId}/generate`,
  AGENT_STREAM: (agentId) => `/ai/agents/${agentId}/stream`,
  WORKFLOWS: '/ai/workflows',
  WORKFLOW_RUN: (workflowId) => `/ai/workflows/${workflowId}/run`,
  MEMORY_THREADS: '/ai/memory/threads',
  MEMORY_THREAD_MESSAGES: (threadId) => `/ai/memory/threads/${threadId}/messages`,
  LOGS: '/ai/logs',

  // ── LLM Model Management (Page 14) ────────────────────────────────────────
  /** GET — returns full provider catalogue enriched with user configs + Mastra active status */
  LLM_MODELS: '/ai/models',
  /** GET — returns only user's saved model configs */
  LLM_MODELS_CONFIG: '/ai/models/config',
  /** POST — save / update a provider config */
  LLM_MODELS_CONFIG_SAVE: '/ai/models/config',
  /** DELETE — remove a provider config */
  LLM_MODELS_CONFIG_DELETE: (providerId) => `/ai/models/config/${providerId}`,
  /** POST — test a provider connection */
  LLM_MODELS_TEST: '/ai/models/test',

  // ── LLM Connections Module (Dedicated Endpoints) ──────────────────────────
  LLM_CONNECTIONS: '/llm-connection',
  LLM_CONNECTION_BY_ID: (providerId) => `/llm-connection/${providerId}`,
  LLM_CONNECTION_SAVE: '/llm-connection',
  LLM_CONNECTION_DELETE: (providerId) => `/llm-connection/${providerId}`,
  LLM_CONNECTION_TEST: '/llm-connection/test',
  LLM_CONNECTION_SYNC_MODELS: '/llm-connection/sync-models',
  LLM_STUDIO_LIVE_MODELS: '/llm-connection/lm-studio/live-models',

  // ── Tools ─────────────────────────────────────────────────────────────────
  TOOLS: '/tools',

  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGIN: '/auth/login',
  AUTH_PROFILE: '/auth/profile',
  // Crew Studio Workflows (MongoDB collection)
  CREW_WORKFLOWS: '/workflows',
  CREW_WORKFLOW_BY_ID: (workflowId) => `/workflows/${workflowId}`,

  // ── Settings Module (MongoDB Collections) ─────────────────────────────────
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_ORGANIZATION: '/settings/organization',
  SETTINGS_EXECUTION: '/settings/execution',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_REGION: '/settings/region',
  SETTINGS_SECURITY_PASSWORD: '/settings/security/password',
  SETTINGS_SECURITY_2FA_TOGGLE: '/settings/security/2fa/toggle',
  SETTINGS_SECURITY_TOKENS: '/settings/security/tokens',
  SETTINGS_SECURITY_TOKEN_DELETE: (tokenId) => `/settings/security/tokens/${tokenId}`,
  SETTINGS_EXPORT: '/settings/export',
  SETTINGS_RESET: '/settings/reset',
};


export const ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',
  AUTOMATIONS: '/automations',
  AGENTS: '/agents',
  TOOLS: '/tools',
  CHAT_MESSAGES: (automationId) => `/automations/${automationId}/messages`,
};

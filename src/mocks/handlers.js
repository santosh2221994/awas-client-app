import { initialNodes } from './nodes.js';
import { initialEdges } from './edges.js';
import { initialMessages, initialWarnings, initialSuggestions } from './chatMessages.js';
import { toolCategories } from './tools.js';

export const mockHandlers = {
  getAutomation: () => ({
    nodes: initialNodes,
    edges: initialEdges,
  }),

  getMessages: () => initialMessages,

  getWarnings: () => initialWarnings,

  getSuggestions: () => initialSuggestions,

  getTools: () => toolCategories,

  getCurrentUser: () => ({
    id: 'user-1',
    name: 'Santosh Kumar',
    email: 'santosh@example.com',
    avatar: null,
    role: 'admin',
  }),
};

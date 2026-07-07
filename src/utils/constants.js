export const APP_NAME = 'CrewAI Studio';

export const NAV_GROUPS = [
  {
    title: 'Build',
    items: [
      { id: 'automations', label: 'Automations', icon: 'Workflow' },
      { id: 'crew-studio', label: 'Crew Studio', icon: 'Users' },
      { id: 'agents', label: 'Agents Repository', icon: 'Bot' },
      { id: 'tools', label: 'Tools & Integrations', icon: 'Wrench' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { id: 'traces', label: 'Traces', icon: 'Activity' },
      { id: 'llm-connections', label: 'LLM Connections', icon: 'Cpu' },
      { id: 'env-vars', label: 'Environment Variables', icon: 'Variable' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { id: 'usage', label: 'Usage', icon: 'BarChart3' },
      { id: 'billing', label: 'Billing', icon: 'CreditCard' },
      { id: 'settings', label: 'Settings', icon: 'Settings' },
    ],
  },
];

export const TOOL_CATEGORIES = [
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'Brain' },
  { id: 'automation', name: 'Automation & Integration', icon: 'Zap' },
  { id: 'database', name: 'Database & Data', icon: 'Database' },
  { id: 'file-doc', name: 'File & Document', icon: 'FileText' },
  { id: 'communication', name: 'Communication', icon: 'MessageSquare' },
  { id: 'dev-tools', name: 'Developer Tools', icon: 'Code' },
];

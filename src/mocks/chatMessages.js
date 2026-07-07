export const initialMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content:
      'Create a storyboard automation that reads a screenplay scene file and generates storyboard frames with DALL·E.',
    timestamp: '10:24 AM',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      "I've set up a two-agent pipeline for your storyboard automation:\n\n1. **Scene Reader** — parses the screenplay file and extracts visual elements.\n2. **Storyboard Director** — generates frames using DALL·E based on the parsed scene data.\n\nHere's the task configuration:",
    timestamp: '10:24 AM',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content:
      '```yaml\nagents:\n  - name: Scene Reader\n    model: gpt-4o-mini\n    tools: [file_reader]\n    task: Extract visual elements from {file_path}\n\n  - name: Storyboard Director\n    model: gpt-4o\n    tools: [dalle_gen, google_docs]\n    task: Generate frames from {scene_data}\n```',
    timestamp: '10:24 AM',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content:
      'The automation is ready to run. You can trigger it with an event, on a schedule, or manually. Would you like to connect Google Docs for the Scene Reader agent as well?',
    timestamp: '10:25 AM',
  },
];

export const initialWarnings = [
  {
    id: 'warn-1',
    type: 'warning',
    message: 'Google Docs is not connected for the Scene Reader agent.',
    agentId: 'agent-1',
    toolName: 'Google Docs',
  },
];

export const initialSuggestions = [
  {
    id: 'sug-1',
    label: 'Run Automation',
    icon: 'Play',
    action: 'run',
  },
];

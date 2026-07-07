export const initialNodes = [
  {
    id: 'trigger-1',
    type: 'triggerNode',
    position: { x: 50, y: 250 },
    data: {
      triggers: [
        { type: 'Event', icon: 'Zap', active: true },
        { type: 'Schedule', icon: 'Clock', active: false },
        { type: 'Manual', icon: 'Hand', active: false },
      ],
    },
  },
  {
    id: 'process-1',
    type: 'processNode',
    position: { x: 380, y: 260 },
    data: {
      version: 'Version 1',
      processType: 'Sequential',
      options: ['Sequential', 'Parallel', 'Hierarchical'],
    },
  },
  {
    id: 'agent-1',
    type: 'agentNode',
    position: { x: 680, y: 80 },
    data: {
      name: 'Scene Reader',
      model: 'gpt-4o-mini',
      tools: [
        { name: "Read a file's content", icon: 'FileText', connected: true },
        { name: 'Google Docs', icon: 'FileSpreadsheet', connected: false },
      ],
    },
  },
  {
    id: 'task-1',
    type: 'taskNode',
    position: { x: 1050, y: 80 },
    data: {
      name: 'Read Scene',
      description:
        'Read the screenplay scene from the provided file path ({file_path}) and extract all visual elements including characters, locations, props, and camera directions.',
    },
  },
  {
    id: 'agent-2',
    type: 'agentNode',
    position: { x: 680, y: 420 },
    data: {
      name: 'Storyboard Director',
      model: 'gpt-4o',
      tools: [
        { name: 'DALL·E Image Gen', icon: 'Image', connected: true },
        { name: 'Google Docs', icon: 'FileSpreadsheet', connected: true },
      ],
    },
  },
  {
    id: 'task-2',
    type: 'taskNode',
    position: { x: 1050, y: 420 },
    data: {
      name: 'Generate Storyboard',
      description:
        'Using the extracted scene data ({scene_data}), generate storyboard frames with the specified camera style ({camera_style}). Each frame should include shot composition, character positions, and lighting notes.',
    },
  },
];

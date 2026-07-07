export const toolCategories = [
  {
    category: 'AI & ML',
    tools: [
      {
        id: 'tool-dalle',
        name: 'DALL·E Image Gen',
        description: 'Generate images from text prompts using OpenAI DALL·E.',
        icon: 'Image',
      },
      {
        id: 'tool-whisper',
        name: 'Whisper Transcription',
        description: 'Transcribe audio files to text using OpenAI Whisper.',
        icon: 'Mic',
      },
      {
        id: 'tool-embeddings',
        name: 'Text Embeddings',
        description: 'Generate vector embeddings for semantic search and similarity.',
        icon: 'Cpu',
      },
      {
        id: 'tool-vision',
        name: 'Vision Analysis',
        description: 'Analyze images and extract visual information with GPT-4 Vision.',
        icon: 'Eye',
      },
    ],
  },
  {
    category: 'Automation',
    tools: [
      {
        id: 'tool-webhook',
        name: 'Webhook Trigger',
        description: 'Listen for incoming webhook events to trigger workflows.',
        icon: 'Zap',
      },
      {
        id: 'tool-scheduler',
        name: 'Cron Scheduler',
        description: 'Schedule tasks with cron expressions for recurring execution.',
        icon: 'Clock',
      },
      {
        id: 'tool-http',
        name: 'HTTP Request',
        description: 'Make HTTP requests to external APIs and services.',
        icon: 'Globe',
      },
    ],
  },
  {
    category: 'Database',
    tools: [
      {
        id: 'tool-postgres',
        name: 'PostgreSQL',
        description: 'Query and manage PostgreSQL databases.',
        icon: 'Database',
      },
      {
        id: 'tool-redis',
        name: 'Redis Cache',
        description: 'Read and write data to Redis for fast caching.',
        icon: 'HardDrive',
      },
      {
        id: 'tool-vector-db',
        name: 'Vector Store',
        description: 'Store and query vector embeddings for RAG pipelines.',
        icon: 'Box',
      },
    ],
  },
  {
    category: 'File & Document',
    tools: [
      {
        id: 'tool-file-reader',
        name: "Read a file's content",
        description: 'Read and parse file contents from local or cloud storage.',
        icon: 'FileText',
      },
      {
        id: 'tool-google-docs',
        name: 'Google Docs',
        description: 'Create, read, and edit Google Docs documents.',
        icon: 'FileSpreadsheet',
      },
      {
        id: 'tool-pdf-parser',
        name: 'PDF Parser',
        description: 'Extract text and metadata from PDF documents.',
        icon: 'FileText',
      },
      {
        id: 'tool-csv',
        name: 'CSV Processor',
        description: 'Read, transform, and write CSV files.',
        icon: 'Table',
      },
    ],
  },
  {
    category: 'Communication',
    tools: [
      {
        id: 'tool-slack',
        name: 'Slack',
        description: 'Send messages and notifications to Slack channels.',
        icon: 'MessageSquare',
      },
      {
        id: 'tool-email',
        name: 'Email Sender',
        description: 'Send emails via SMTP or transactional email services.',
        icon: 'Mail',
      },
      {
        id: 'tool-discord',
        name: 'Discord Bot',
        description: 'Send messages and manage Discord server interactions.',
        icon: 'MessageCircle',
      },
    ],
  },
  {
    category: 'Developer Tools',
    tools: [
      {
        id: 'tool-github',
        name: 'GitHub',
        description: 'Interact with GitHub repos, issues, and pull requests.',
        icon: 'Github',
      },
      {
        id: 'tool-terminal',
        name: 'Shell Command',
        description: 'Execute shell commands in a sandboxed environment.',
        icon: 'Terminal',
      },
      {
        id: 'tool-code-exec',
        name: 'Code Interpreter',
        description: 'Execute Python code snippets in a secure runtime.',
        icon: 'Code',
      },
    ],
  },
];

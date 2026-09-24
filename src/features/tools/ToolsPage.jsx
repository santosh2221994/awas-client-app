import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Wrench,
  Globe,
  Check,
  PowerOff,
  Shield,
  RefreshCw,
  Key,
  X,
  Lock,
  ExternalLink,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Play,
  FileCode,
  Terminal,
  Database,
  CloudSun,
  FileSpreadsheet,
  GitPullRequest,
  MessageSquare,
  Video,
  FileText,
  Calculator,
  Cpu,
  Copy,
  Clock,
  Sparkles,
  Sliders,
  Code2,
  Table,
  LayoutGrid,
  List,
  ArrowUpDown,
  Zap,
  Code,
  ChevronRight,
  Tag,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { useToolStore } from '../../stores/useToolStore';
import {
  listTools,
  executeTool,
  testToolConnection,
  saveToolConnection,
  deleteToolConnection,
} from '../../api/services/toolService';
import Button from '../../components/Button';

// Icon map helper for categories and tools
const TOOL_ICONS = {
  CloudSun,
  Search,
  Globe,
  Database,
  FileSpreadsheet,
  Github: GitPullRequest,
  GitPullRequest,
  MessageSquare,
  Video,
  FileText,
  Calculator,
  Cpu,
  Wrench,
  Table,
};

// Smart icon resolver for tools
const getToolIcon = (tool) => {
  if (tool.icon && TOOL_ICONS[tool.icon] && tool.icon !== 'Wrench') {
    return TOOL_ICONS[tool.icon];
  }
  const id = (tool.id || '').toLowerCase();
  const cat = (tool.category || '').toLowerCase();
  if (id.includes('sql') || cat.includes('database')) return Database;
  if (id.includes('sheet') || id.includes('csv') || cat.includes('sheets')) return FileSpreadsheet;
  if (id.includes('github') || cat.includes('code') || cat.includes('repositor')) return GitPullRequest;
  if (id.includes('slack') || cat.includes('communication')) return MessageSquare;
  if (id.includes('youtube') || id.includes('video') || cat.includes('media')) return Video;
  if (id.includes('pdf') || cat.includes('document')) return FileText;
  if (id.includes('weather') || cat.includes('weather')) return CloudSun;
  if (id.includes('browser') || id.includes('web') || cat.includes('browser') || cat.includes('search')) return Globe;
  if (id.includes('calc') || cat.includes('math')) return Calculator;
  return TOOL_ICONS[tool.icon] || Wrench;
};

// Curated Category Style mappings
const CATEGORY_STYLES = {
  'Browser Automation': {
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-150 dark:border-emerald-900/40',
    accentDot: 'bg-emerald-500',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-800/80',
  },
  'Web Search': {
    badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    iconBg: 'bg-sky-50/80 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-150 dark:border-sky-900/40',
    accentDot: 'bg-sky-500',
    hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-800/80',
  },
  'Code & Repositories': {
    badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    iconBg: 'bg-purple-50/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-150 dark:border-purple-900/40',
    accentDot: 'bg-purple-500',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-800/80',
  },
  'Communication': {
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    iconBg: 'bg-amber-50/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-150 dark:border-amber-900/40',
    accentDot: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-800/80',
  },
  'Math & Utilities': {
    badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
    iconBg: 'bg-cyan-50/80 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-150 dark:border-cyan-900/40',
    accentDot: 'bg-cyan-500',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-800/80',
  },
  'Weather': {
    badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    iconBg: 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-150 dark:border-blue-900/40',
    accentDot: 'bg-blue-500',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-800/80',
  },
  'Productivity & Sheets': {
    badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
    iconBg: 'bg-teal-50/80 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-150 dark:border-teal-900/40',
    accentDot: 'bg-teal-500',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-800/80',
  },
  'Document Analysis': {
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    iconBg: 'bg-rose-50/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-150 dark:border-rose-900/40',
    accentDot: 'bg-rose-500',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-800/80',
  },
  'Media & Video': {
    badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
    iconBg: 'bg-red-50/80 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-150 dark:border-red-900/40',
    accentDot: 'bg-red-500',
    hoverBorder: 'hover:border-red-300 dark:hover:border-red-800/80',
  },
  'General': {
    badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    iconBg: 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/40',
    accentDot: 'bg-indigo-500',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-800/80',
  },
};

const getCategoryStyle = (category) => {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES['General'];
};



export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('Internal Tools'); // default to rich internal tools view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [connectionTypeFilter, setConnectionTypeFilter] = useState('All');
  const [connectionStatusFilter, setConnectionStatusFilter] = useState('All');

  // Zustand persistent credential & tools store
  const {
    credentials,
    saveCredentials,
    removeCredentials,
    toolsList,
    isToolsLoading,
    fetchTools,
    syncBackendConnections,
  } = useToolStore();

  // Local state for tools
  const [localTools, setLocalTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);

  // Selected tool for credential config modal
  const [selectedToolConfig, setSelectedToolConfig] = useState(null);
  const [configFormData, setConfigFormData] = useState({
    token: '',
    apiKey: '',
    repoOwner: '',
    repoName: '',
    orgId: '',
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // View mode, filtering & sorting for Internal Tools Registry
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [authFilter, setAuthFilter] = useState('all'); // 'all' | 'zero-config' | 'requires-auth'
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'category' | 'params-desc' | 'params-asc'
  const [copiedToolId, setCopiedToolId] = useState(null);
  const [schemaTab, setSchemaTab] = useState('table'); // 'table' | 'json' | 'code'

  const handleCopyToolId = (e, toolId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(toolId);
    setCopiedToolId(toolId);
    setTimeout(() => setCopiedToolId(null), 2000);
  };

  // Schema Viewer Modal State
  const [schemaModalTool, setSchemaModalTool] = useState(null);

  // Interactive Sandbox Modal State
  const [sandboxModalTool, setSandboxModalTool] = useState(null);
  const [sandboxInputs, setSandboxInputs] = useState({});
  const [sandboxRawJson, setSandboxRawJson] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [isExecutingSandbox, setIsExecutingSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Initial load
  useEffect(() => {
    loadTools();
    syncBackendConnections();
  }, []);

  const loadTools = async () => {
    setLoadingTools(true);
    try {
      const data = await fetchTools();
      if (Array.isArray(data) && data.length > 0) {
        setLocalTools(data);
      } else {
        const fallback = await listTools();
        if (Array.isArray(fallback) && fallback.length > 0) {
          setLocalTools(fallback);
        }
      }
    } catch (err) {
      console.warn('Could not load live tools from API, using store cache:', err);
    } finally {
      setLoadingTools(false);
    }
  };

  // Connection App Items
  const defaultConnections = [
    { id: 'github', name: 'GitHub', count: 13, type: 'Agent App', creator: 'GitHub', iconColor: 'bg-zinc-800 text-white font-bold' },
    { id: 'slack', name: 'Slack', count: 8, type: 'Agent App', creator: 'Slack Technologies', iconColor: 'bg-emerald-100 text-emerald-700 font-bold' },
    { id: 'google-sheets', name: 'Google Sheets', count: 6, type: 'Agent App', creator: 'Google', iconColor: 'bg-emerald-50 text-emerald-700 font-bold' },
    { id: 'exa', name: 'Exa AI', count: 4, type: 'Agent App', creator: 'Exa.ai', iconColor: 'bg-indigo-100 text-indigo-600 font-bold' },
    { id: 'asana', name: 'Asana', count: 12, type: 'Agent App', creator: 'Asana', iconColor: 'bg-orange-100 text-orange-600 font-bold' },
    { id: 'box', name: 'Box', count: 10, type: 'Agent App', creator: 'Box', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
    { id: 'clickup', name: 'ClickUp', count: 11, type: 'Agent App', creator: 'ClickUp', iconColor: 'bg-purple-100 text-purple-600 font-bold' },
    { id: 'confluence', name: 'Confluence', count: 10, type: 'Agent App', creator: 'Confluence', iconColor: 'bg-sky-100 text-sky-600 font-bold' },
    { id: 'databricks', name: 'Databricks', count: 0, type: 'MCP', creator: 'Databricks', iconColor: 'bg-red-100 text-red-650 font-bold' },
    { id: 'google-calendar', name: 'Google Calendar', count: 6, type: 'Agent App', creator: 'Google', iconColor: 'bg-blue-50 text-blue-500 font-bold' },
    { id: 'google-docs', name: 'Google Docs', count: 33, type: 'Agent App', creator: 'Google', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
  ];

  // Integration LLM Providers & Engines
  const defaultIntegrations = [
    { id: 'openai', name: 'OpenAI API', category: 'LLM Provider', description: 'Enable GPT-4o, GPT-4, and GPT-3.5 models.' },
    { id: 'gemini', name: 'Google Gemini', category: 'LLM Provider', description: 'Enable Gemini 2.0 Flash & Gemini 1.5 Pro models.' },
    { id: 'anthropic', name: 'Anthropic Claude', category: 'LLM Provider', description: 'Enable Claude 3.5 Sonnet & Opus models.' },
    { id: 'mastra', name: 'Mastra Engine (:4111)', category: 'Backend Host', description: 'Power local agent state, tool execution, and telemetry.' },
  ];

  const maskSecret = (secret) => {
    if (!secret || secret.length < 8) return secret ? '••••••••' : '';
    return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
  };

  const handleOpenConfigModal = (tool) => {
    const saved = credentials[tool.id] || {};
    setSelectedToolConfig(tool);
    setConfigFormData({
      token: saved.token || '',
      apiKey: saved.apiKey || '',
      repoOwner: saved.repoOwner || 'devansh18',
      repoName: saved.repoName || 'awas',
      orgId: saved.orgId || '',
    });
    setTestResult(null);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!selectedToolConfig) return;

    const credPayload = {
      ...configFormData,
      name: selectedToolConfig.name,
      type: selectedToolConfig.type || 'Agent App',
      status: (configFormData.token || configFormData.apiKey) ? 'Configured' : 'Not Configured',
    };

    saveCredentials(selectedToolConfig.id, credPayload);

    try {
      await saveToolConnection(selectedToolConfig.id, {
        name: selectedToolConfig.name,
        type: selectedToolConfig.type || 'Agent App',
        token: configFormData.token,
        apiKey: configFormData.apiKey,
        config: {
          repoOwner: configFormData.repoOwner,
          repoName: configFormData.repoName,
          orgId: configFormData.orgId,
        },
      });
      await syncBackendConnections();
    } catch (err) {
      console.warn('Note saving credentials to MongoDB:', err);
    }

    setSelectedToolConfig(null);
  };

  const handleDisconnectTool = async (toolId) => {
    removeCredentials(toolId);
    try {
      await deleteToolConnection(toolId);
      await syncBackendConnections();
    } catch (err) {
      console.warn('Note deleting credentials from MongoDB:', err);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedToolConfig) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testToolConnection(selectedToolConfig.id, configFormData);
      const isSuccess = res && res.success !== false;
      const latency = res?.latencyMs ? ` (${res.latencyMs}ms)` : '';
      setTestResult({
        success: isSuccess,
        message: res?.message || (isSuccess
          ? `Connection test successful! Valid credentials for ${selectedToolConfig.name}.${latency}`
          : 'Connection test failed.'),
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Connection test failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Open Schema Viewer
  const handleOpenSchema = (tool) => {
    setSchemaModalTool(tool);
    setSchemaTab('table');
  };

  // Open Sandbox Modal
  const handleOpenSandbox = (tool) => {
    setSandboxModalTool(tool);
    const initial = tool.sampleInput || {};
    setSandboxInputs(initial);
    setSandboxRawJson(JSON.stringify(initial, null, 2));
    setSandboxResult(null);
    setIsJsonMode(false);
  };

  const toggleJsonMode = () => {
    if (!isJsonMode) {
      setSandboxRawJson(JSON.stringify(sandboxInputs, null, 2));
    } else {
      try {
        const parsed = JSON.parse(sandboxRawJson);
        if (parsed && typeof parsed === 'object') {
          setSandboxInputs(parsed);
        }
      } catch {}
    }
    setIsJsonMode(!isJsonMode);
  };

  const handleRunSandbox = async () => {
    if (!sandboxModalTool) return;
    setIsExecutingSandbox(true);
    setSandboxResult(null);

    let payload = sandboxInputs;
    if (isJsonMode) {
      try {
        payload = JSON.parse(sandboxRawJson);
      } catch (err) {
        setSandboxResult({
          success: false,
          error: `Invalid JSON payload: ${err.message}`,
          latencyMs: 0,
        });
        setIsExecutingSandbox(false);
        return;
      }
    }

    try {
      const res = await executeTool(sandboxModalTool.id, payload);
      setSandboxResult(res);
    } catch (err) {
      setSandboxResult({
        success: false,
        error: err.response?.data?.error || err.response?.data?.message || err.message || 'Execution failed',
        latencyMs: 0,
      });
    } finally {
      setIsExecutingSandbox(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Filter connections
  const filteredConnections = defaultConnections.filter((conn) => {
    const saved = credentials[conn.id];
    const isConfigured = saved && (saved.status === 'Configured' || saved.token || saved.apiKey);

    const matchesSearch =
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = connectionTypeFilter === 'All' || conn.type === connectionTypeFilter;
    const matchesStatus =
      connectionStatusFilter === 'All' ||
      (connectionStatusFilter === 'Configured' && isConfigured) ||
      (connectionStatusFilter === 'Not Configured' && !isConfigured);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Effective tools list (from live local state or store)
  const currentTools = localTools.length > 0 ? localTools : toolsList;

  // Zero config vs requires-auth counts
  const zeroConfigCount = useMemo(() => {
    return currentTools.filter((t) => !t.requiresCredentials).length;
  }, [currentTools]);

  const authRequiredCount = useMemo(() => {
    return currentTools.filter((t) => t.requiresCredentials).length;
  }, [currentTools]);

  // Filter tools
  const categoriesList = useMemo(() => {
    const set = new Set();
    currentTools.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ['All', ...Array.from(set)];
  }, [currentTools]);

  const filteredTools = useMemo(() => {
    const result = currentTools.filter((tool) => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q) ||
        (tool.category && tool.category.toLowerCase().includes(q)) ||
        (tool.parameters && tool.parameters.some((p) => p.name.toLowerCase().includes(q)));

      let matchesAuth = true;
      if (authFilter === 'zero-config') {
        matchesAuth = !tool.requiresCredentials;
      } else if (authFilter === 'requires-auth') {
        matchesAuth = !!tool.requiresCredentials;
      }

      return matchesCategory && matchesSearch && matchesAuth;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      if (sortBy === 'params-desc') return (b.parameters?.length || 0) - (a.parameters?.length || 0);
      if (sortBy === 'params-asc') return (a.parameters?.length || 0) - (b.parameters?.length || 0);
      return 0;
    });
  }, [currentTools, selectedCategory, searchQuery, authFilter, sortBy]);

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto select-none font-sans">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Wrench className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Tools & Integrations</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                {currentTools.length} Available
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Discover registered agent capabilities, inspect parameter schemas, test execution in sandbox, and manage credentials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadTools}
              disabled={loadingTools}
              className="gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border-gray-250 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTools ? 'animate-spin text-indigo-600' : ''}`} />
              {loadingTools ? 'Syncing...' : 'Reload Catalogue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {[
            { id: 'Internal Tools', label: 'Internal Tools Registry', count: currentTools.length },
            { id: 'Connections', label: 'Application Connections', count: defaultConnections.length },
            { id: 'Integrations', label: 'LLM & Provider Engines', count: defaultIntegrations.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-0 py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-6">

        {/* ── TAB 1: INTERNAL TOOLS REGISTRY ────────────────────────────── */}
        {activeTab === 'Internal Tools' && (
          <div className="space-y-6">
            {/* Top Telemetry / Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-3xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Registered Tools
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-950 dark:text-slate-100">
                      {currentTools.length}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                      across {Math.max(1, categoriesList.length - 1)} categories
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-150 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-3xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Instant Run (Zero-Config)
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {zeroConfigCount}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                      ready without API keys
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-150 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-3xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Mastra Engine Status
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active :4111
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                      Live schemas
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-150 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter & Controls Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-3.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tools by name, description, parameter, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right controls: Auth Filter, Sort By, View Mode */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Auth Requirement Filter Pills */}
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/80 text-[11px] font-semibold">
                    <button
                      onClick={() => setAuthFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        authFilter === 'all'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs font-bold'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                      }`}
                    >
                      All ({currentTools.length})
                    </button>
                    <button
                      onClick={() => setAuthFilter('zero-config')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        authFilter === 'zero-config'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-3xs font-bold'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Instant Run ({zeroConfigCount})
                    </button>
                    <button
                      onClick={() => setAuthFilter('requires-auth')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        authFilter === 'requires-auth'
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-3xs font-bold'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Key className="w-2.5 h-2.5" />
                      Key Req. ({authRequiredCount})
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-[11px] font-semibold text-gray-700 dark:text-slate-300 outline-none cursor-pointer pr-1"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="category">Category</option>
                      <option value="params-desc">Most Params</option>
                      <option value="params-asc">Fewest Params</option>
                    </select>
                  </div>

                  {/* Grid / List Mode Toggle */}
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/80">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs'
                          : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-200'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs'
                          : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-200'
                      }`}
                      title="Compact Table List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 max-w-full">
                {categoriesList.map((cat) => {
                  const catCount =
                    cat === 'All'
                      ? currentTools.length
                      : currentTools.filter((t) => t.category === cat).length;
                  const isSelected = selectedCategory === cat;
                  const catStyle = cat !== 'All' ? getCategoryStyle(cat) : null;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-3xs scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-gray-600 dark:text-slate-300 border border-gray-200/80 dark:border-slate-700/70 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat !== 'All' && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : catStyle?.accentDot || 'bg-indigo-500'
                          }`}
                        />
                      )}
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected
                            ? 'bg-indigo-700/80 text-white'
                            : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-200/60 dark:border-slate-750'
                        }`}
                      >
                        {catCount}
                      </span>
                    </button>
                  );
                })}

                {(selectedCategory !== 'All' || searchQuery || authFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setAuthFilter('all');
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 ml-2 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Counter & Active Filter Badge */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-1">
              <span className="font-medium">
                Showing <strong className="text-gray-900 dark:text-slate-100">{filteredTools.length}</strong> of{' '}
                {currentTools.length} tools
                {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
                {authFilter === 'zero-config' && <span> (Zero-Config only)</span>}
                {authFilter === 'requires-auth' && <span> (Requires API Key)</span>}
              </span>

              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                Mode: <span className="font-semibold capitalize text-gray-600 dark:text-slate-300">{viewMode}</span>
              </span>
            </div>

            {/* ── VIEW 1: GRID MODE ── */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTools.map((tool) => {
                  const IconComponent = getToolIcon(tool);
                  const paramCount = tool.parameters?.length || 0;
                  const catStyle = getCategoryStyle(tool.category);
                  const isCopied = copiedToolId === tool.id;

                  return (
                    <div
                      key={tool.id}
                      className={`border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${catStyle.hoverBorder} transition-all duration-200 group relative hover:shadow-md`}
                    >
                      <div className="space-y-3.5">
                        {/* Card Header: Icon + Name + Category + Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-11 w-11 rounded-xl ${catStyle.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-3xs`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-950 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {tool.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${catStyle.badge}`}
                                >
                                  {tool.category}
                                </span>
                                {tool.requiresCredentials ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                                    <Key className="w-2.5 h-2.5" /> API Key Req.
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5" /> Instant Run
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-gray-200/80 dark:border-slate-700 shrink-0">
                            {paramCount} {paramCount === 1 ? 'param' : 'params'}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed min-h-[38px] line-clamp-2">
                          {tool.description}
                        </p>

                        {/* Parameter Chips Preview */}
                        {paramCount > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mr-1">
                              Inputs:
                            </span>
                            {tool.parameters.slice(0, 3).map((p) => (
                              <span
                                key={p.name}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                              >
                                {p.name}
                                {p.required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
                              </span>
                            ))}
                            {paramCount > 3 && (
                              <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
                                +{paramCount - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Tool ID + Action Buttons */}
                      <div className="pt-3.5 mt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        {/* Copyable Tool ID */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyToolId(e, tool.id)}
                          className="group/id inline-flex items-center gap-1.5 font-mono text-[10px] text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2 py-1 rounded-md border border-gray-200/60 dark:border-slate-750 transition"
                          title="Click to copy Tool ID"
                        >
                          <span className="truncate max-w-[130px]">{tool.id}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400 group-hover/id:text-indigo-500 shrink-0" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenSchema(tool)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750 transition shadow-3xs"
                            title="Inspect parameter schema"
                          >
                            <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                            Schema
                          </button>
                          <button
                            onClick={() => handleOpenSandbox(tool)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-3xs hover:shadow-xs transition"
                            title="Run interactive sandbox test"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Test Sandbox
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── VIEW 2: DENSE TABLE / LIST MODE ── */}
            {viewMode === 'list' && (
              <div className="overflow-hidden border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                        <th className="px-5 py-3.5">Tool & Description</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Parameters</th>
                        <th className="px-4 py-3.5">Auth Requirement</th>
                        <th className="px-4 py-3.5">Tool ID</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                      {filteredTools.map((tool) => {
                        const IconComponent = getToolIcon(tool);
                        const paramCount = tool.parameters?.length || 0;
                        const catStyle = getCategoryStyle(tool.category);
                        const isCopied = copiedToolId === tool.id;

                        return (
                          <tr
                            key={tool.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors"
                          >
                            {/* Tool info */}
                            <td className="px-5 py-3.5 max-w-sm">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-9 w-9 rounded-xl ${catStyle.iconBg} border flex items-center justify-center shrink-0`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 dark:text-slate-100 truncate">
                                    {tool.name}
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-xs">
                                    {tool.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${catStyle.badge}`}
                              >
                                {tool.category}
                              </span>
                            </td>

                            {/* Parameters Chips */}
                            <td className="px-4 py-3.5">
                              {paramCount > 0 ? (
                                <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                  {tool.parameters.slice(0, 2).map((p) => (
                                    <span
                                      key={p.name}
                                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                                    >
                                      {p.name}
                                      {p.required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
                                    </span>
                                  ))}
                                  {paramCount > 2 && (
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      +{paramCount - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">None</span>
                              )}
                            </td>

                            {/* Auth */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {tool.requiresCredentials ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 inline-flex items-center gap-1">
                                  <Key className="w-2.5 h-2.5" /> API Key Req.
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 inline-flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5" /> Instant Run
                                </span>
                              )}
                            </td>

                            {/* Tool ID */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => handleCopyToolId(e, tool.id)}
                                className="group/id inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 transition"
                                title="Click to copy Tool ID"
                              >
                                <span>{tool.id}</span>
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-400 group-hover/id:text-indigo-500" />
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenSchema(tool)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750 transition"
                                  title="Inspect Schema"
                                >
                                  <FileCode className="w-3 h-3 text-indigo-500" />
                                  Schema
                                </button>
                                <button
                                  onClick={() => handleOpenSandbox(tool)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-3xs"
                                  title="Test Sandbox"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  Test
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-3xs p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-150 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                  No tools match your criteria
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  No tools found for the current query, category, or authentication filter. Try adjusting your parameters.
                </p>
                <div className="mt-5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setAuthFilter('all');
                    }}
                    className="text-xs font-semibold px-4 py-2"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: APPLICATION CONNECTIONS ────────────────────────────── */}
        {activeTab === 'Connections' && (
          <div className="space-y-6">
            {/* Top description card */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-400">
                  <Globe className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Application Connections</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Configure real Personal Access Tokens (PAT), Webhooks, and API keys persisted securely in MongoDB Atlas.
                  </p>
                </div>
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={() => handleOpenConfigModal({ id: 'github', name: 'GitHub', type: 'Agent App' })}
                className="whitespace-nowrap font-semibold gap-1.5 shadow-none pb-2 pt-2.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Connection
              </Button>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center py-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={connectionTypeFilter}
                  onChange={(e) => setConnectionTypeFilter(e.target.value)}
                  className="border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 dark:text-slate-300 outline-none hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <option value="All">Type: All</option>
                  <option value="Agent App">Agent App</option>
                  <option value="MCP">MCP</option>
                </select>
                <select
                  value={connectionStatusFilter}
                  onChange={(e) => setConnectionStatusFilter(e.target.value)}
                  className="border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 dark:text-slate-300 outline-none hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  <option value="Configured">Configured</option>
                  <option value="Not Configured">Not Configured</option>
                </select>
              </div>
            </div>

            {/* Connections Table */}
            <div className="overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">Applications</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Real Credential Key</th>
                    <th className="px-6 py-3.5">Created by</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs text-gray-700 dark:text-slate-300">
                  {filteredConnections.map((conn) => {
                    const saved = credentials[conn.id];
                    const isConfigured = saved && (saved.status === 'Configured' || saved.status === 'Active' || saved.token || saved.apiKey);
                    const savedKeyDisplay = saved ? (saved.token || saved.apiKey) : null;

                    return (
                      <tr key={conn.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4.5 font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center ${conn.iconColor} shadow-3xs border border-gray-200/40 dark:border-slate-700 text-xs`}
                          >
                            {conn.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{conn.name}</span>
                            {conn.count > 0 && (
                              <span className="font-medium text-gray-400 dark:text-slate-500 text-[11px] ml-1.5">
                                ({conn.count} tools)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                              conn.type === 'MCP'
                                ? 'bg-purple-100/60 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/40 dark:border-purple-800/40'
                                : 'bg-pink-100/60 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/40 dark:border-pink-800/40'
                            }`}
                          >
                            {conn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isConfigured
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 font-bold'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-150 dark:border-slate-700'
                            }`}
                          >
                            {isConfigured ? 'Configured' : 'Not Configured'}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-mono text-[11px] text-gray-600 dark:text-slate-400">
                          {savedKeyDisplay ? (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                              {maskSecret(savedKeyDisplay)}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500 italic">No Key Saved</span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-gray-500 dark:text-slate-400 font-medium">{conn.creator}</td>
                        <td className="px-6 py-4.5 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenConfigModal(conn)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                          >
                            <Key className="w-3 h-3" />
                            {isConfigured ? 'Edit Credentials' : 'Configure'}
                          </button>

                          {isConfigured && (
                            <button
                              onClick={() => handleDisconnectTool(conn.id)}
                              className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              title="Disconnect & Clear Credentials"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredConnections.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-450 dark:text-slate-500 italic">
                        No connections match query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: LLM & PROVIDER INTEGRATIONS ────────────────────────── */}
        {activeTab === 'Integrations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultIntegrations.map((integ) => {
                const saved = credentials[integ.id];
                const isActive = saved && (saved.status === 'Active' || saved.apiKey);
                const savedKey = saved?.apiKey;

                return (
                  <div
                    key={integ.id}
                    className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-3xs flex justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-950 dark:text-slate-100">{integ.name}</h4>
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500">{integ.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{integ.description}</p>
                      {savedKey && (
                        <div className="pt-2 text-[11px] font-mono text-gray-500 dark:text-slate-400">
                          Saved Key: <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-indigo-600 dark:text-indigo-400">{maskSecret(savedKey)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between min-h-[75px] shrink-0">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-zinc-100 dark:bg-slate-800 text-zinc-400 dark:text-slate-400 border border-zinc-200 dark:border-slate-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleOpenConfigModal(integ)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                      >
                        Configure Key
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL 1: TOOL PARAMETER SCHEMA VIEWER ───────────────────────── */}
      {schemaModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                    Parameter Schema — {schemaModalTool.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyToolId(e, schemaModalTool.id)}
                      className="group/id inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                      title="Click to copy Tool ID"
                    >
                      <span>{schemaModalTool.id}</span>
                      {copiedToolId === schemaModalTool.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-indigo-400" />
                      )}
                    </button>
                    <span className="text-[11px] text-gray-400">·</span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                      {schemaModalTool.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSchemaModalTool(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setSchemaTab('table')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  schemaTab === 'table'
                    ? 'bg-indigo-600 text-white shadow-3xs'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Parameters Table ({schemaModalTool.parameters?.length || 0})
              </button>
              <button
                onClick={() => setSchemaTab('json')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  schemaTab === 'json'
                    ? 'bg-indigo-600 text-white shadow-3xs'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Sample JSON
              </button>
              <button
                onClick={() => setSchemaTab('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  schemaTab === 'code'
                    ? 'bg-indigo-600 text-white shadow-3xs'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Mastra Agent Code
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {schemaTab === 'table' && (
                <div>
                  {schemaModalTool.parameters && schemaModalTool.parameters.length > 0 ? (
                    <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">
                          <tr>
                            <th className="px-4 py-2.5">Field</th>
                            <th className="px-3 py-2.5">Type</th>
                            <th className="px-3 py-2.5">Requirement</th>
                            <th className="px-4 py-2.5">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {schemaModalTool.parameters.map((param) => (
                            <tr key={param.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {param.name}
                              </td>
                              <td className="px-3 py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold">
                                  {param.type}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                {param.required ? (
                                  <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    Optional
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-slate-400 text-xs">
                                <div>{param.description}</div>
                                {param.options && (
                                  <div className="text-[10px] text-gray-400 mt-1 font-mono">
                                    Options: {param.options.join(', ')}
                                  </div>
                                )}
                                {param.defaultValue !== undefined && (
                                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                    Default: {String(param.defaultValue)}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400">
                      No input parameters required for this tool. It executes without any arguments.
                    </div>
                  )}
                </div>
              )}

              {schemaTab === 'json' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Standard JSON payload expected by the Mastra tool execution endpoint:
                    </p>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(schemaModalTool.sampleInput || {}, null, 2))}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedSnippet ? 'Copied!' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 text-xs font-mono p-4 rounded-2xl overflow-x-auto border border-slate-800">
                    {JSON.stringify(schemaModalTool.sampleInput || {}, null, 2)}
                  </pre>
                </div>
              )}

              {schemaTab === 'code' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      TypeScript agent integration snippet:
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(`import { mastra } from '@/mastra';

// 1. Direct tool execution
const tool = mastra.getTool('${schemaModalTool.id}');
const result = await tool.execute(${JSON.stringify(schemaModalTool.sampleInput || {}, null, 2)});

// 2. Attach to AWAS autonomous agent
const agent = mastra.createAgent({
  name: '${schemaModalTool.name.replace(/\\s+/g, '')}Agent',
  instructions: 'Use ${schemaModalTool.name} to fulfill tasks accurately.',
  tools: { '${schemaModalTool.id}': tool },
});`)
                      }
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedSnippet ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-indigo-300 text-xs font-mono p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
{`import { mastra } from '@/mastra';

// 1. Direct tool execution
const tool = mastra.getTool('${schemaModalTool.id}');
const result = await tool.execute(${JSON.stringify(schemaModalTool.sampleInput || {}, null, 2)});

// 2. Attach to AWAS autonomous agent
const agent = mastra.createAgent({
  name: '${schemaModalTool.name.replace(/\\s+/g, '')}Agent',
  instructions: 'Use ${schemaModalTool.name} to fulfill tasks accurately.',
  tools: { '${schemaModalTool.id}': tool },
});`}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const tool = schemaModalTool;
                  setSchemaModalTool(null);
                  handleOpenSandbox(tool);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                <Play className="w-3 h-3 fill-current" />
                Open in Interactive Sandbox
              </button>

              <button
                type="button"
                onClick={() => setSchemaModalTool(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INTERACTIVE TOOL EXECUTION SANDBOX ──────────────────── */}
      {sandboxModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-3xs">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                      Sandbox Execution — {sandboxModalTool.name}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      Live Test
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Execute real queries against this tool and observe runtime output and latency.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSandboxModalTool(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Mode switch */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  Input Parameters
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = sandboxModalTool.sampleInput || {};
                      setSandboxInputs(sample);
                      setSandboxRawJson(JSON.stringify(sample, null, 2));
                    }}
                    className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Reset to Sample
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={toggleJsonMode}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {isJsonMode ? 'Form View' : 'Raw JSON'}
                  </button>
                </div>
              </div>

              {isJsonMode ? (
                <div>
                  <textarea
                    rows={8}
                    value={sandboxRawJson}
                    onChange={(e) => setSandboxRawJson(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-3 outline-none focus:border-indigo-500"
                    placeholder="Enter JSON input..."
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  {sandboxModalTool.parameters && sandboxModalTool.parameters.length > 0 ? (
                    sandboxModalTool.parameters.map((param) => {
                      const isTextarea = ['query', 'csvdata', 'body', 'text', 'message', 'values', 'content'].includes(param.name.toLowerCase());

                      return (
                        <div key={param.name}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span>{param.name}</span>
                              {param.required && <span className="text-red-500 text-[10px]">*</span>}
                            </label>
                            <span className="text-[10px] font-mono text-gray-400">{param.type}</span>
                          </div>
                          {param.type === 'enum' && param.options ? (
                            <select
                              value={sandboxInputs[param.name] ?? param.defaultValue ?? param.options[0]}
                              onChange={(e) => setSandboxInputs({ ...sandboxInputs, [param.name]: e.target.value })}
                              className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-gray-900 dark:text-slate-100"
                            >
                              {param.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : isTextarea ? (
                            <textarea
                              rows={3}
                              value={sandboxInputs[param.name] ?? ''}
                              onChange={(e) => setSandboxInputs({ ...sandboxInputs, [param.name]: e.target.value })}
                              placeholder={param.description || `Enter ${param.name}...`}
                              className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-indigo-500 font-mono text-gray-900 dark:text-slate-100"
                            />
                          ) : (
                            <input
                              type={param.type === 'number' ? 'number' : 'text'}
                              value={sandboxInputs[param.name] ?? ''}
                              onChange={(e) => {
                                const val = param.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
                                setSandboxInputs({ ...sandboxInputs, [param.name]: val });
                              }}
                              placeholder={param.description || `Enter ${param.name}...`}
                              className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-slate-100"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic">No parameters required for this tool.</p>
                  )}
                </div>
              )}

              {/* Execution Action Button */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleRunSandbox}
                  disabled={isExecutingSandbox}
                  className="gap-2 font-bold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  {isExecutingSandbox ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing Tool...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run Tool Test
                    </>
                  )}
                </Button>

                {sandboxResult && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {sandboxResult.latencyMs}ms
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sandboxResult.success !== false
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      {sandboxResult.success !== false ? 'Success' : 'Execution Error'}
                    </span>
                  </div>
                )}
              </div>

              {/* Result Console Display */}
              {sandboxResult && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Execution Result Output
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(sandboxResult, null, 2))}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedSnippet ? 'Copied!' : 'Copy Result'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-slate-200 text-xs font-mono p-4 rounded-xl max-h-56 overflow-y-auto border border-slate-800 shadow-inner">
                    {JSON.stringify(sandboxResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSandboxModalTool(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CREDENTIALS CONFIGURATION MODAL ────────────────────── */}
      {selectedToolConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    Configure Real Credentials — {selectedToolConfig.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Input your real API tokens or PAT for runtime execution</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedToolConfig(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* GitHub Specific Fields */}
              {selectedToolConfig.id === 'github' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      GitHub Personal Access Token (PAT)
                    </label>
                    <input
                      type="password"
                      value={configFormData.token}
                      onChange={(e) => setConfigFormData({ ...configFormData, token: e.target.value })}
                      placeholder="ghp_1234567890abcdef..."
                      className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 font-mono text-gray-900 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 block">
                      Requires <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded">repo</code> and <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded">issues</code> scopes.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Default Repo Owner</label>
                      <input
                        type="text"
                        value={configFormData.repoOwner}
                        onChange={(e) => setConfigFormData({ ...configFormData, repoOwner: e.target.value })}
                        placeholder="e.g. devansh18"
                        className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 font-medium text-gray-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Default Repo Name</label>
                      <input
                        type="text"
                        value={configFormData.repoName}
                        onChange={(e) => setConfigFormData({ ...configFormData, repoName: e.target.value })}
                        placeholder="e.g. awas"
                        className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 font-medium text-gray-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Generic API Key / Secret Token input */
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {selectedToolConfig.name} API Key / Secret Token
                  </label>
                  <input
                    type="password"
                    value={configFormData.apiKey || configFormData.token}
                    onChange={(e) => setConfigFormData({ ...configFormData, apiKey: e.target.value, token: e.target.value })}
                    placeholder={`Enter real API Key for ${selectedToolConfig.name}...`}
                    className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 font-mono text-gray-900 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 block">
                    Credentials are saved in your workspace session and decrypted locally during workflow runs.
                  </span>
                </div>
              )}

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-slate-300 border border-gray-250 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {isTesting ? 'Testing Key...' : 'Test Connection'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedToolConfig(null)}
                    className="px-3.5 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

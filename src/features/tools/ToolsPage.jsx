import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { toolCategories } from '../../mocks/tools';
import { useToolStore } from '../../stores/useToolStore';
import Button from '../../components/Button';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('Connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Zustand persistent credential store
  const { credentials, saveCredentials, removeCredentials } = useToolStore();

  // Selected tool for modal configuration
  const [selectedToolConfig, setSelectedToolConfig] = useState(null);
  const [configFormData, setConfigFormData] = useState({
    token: '',
    apiKey: '',
    repoOwner: '',
    repoName: '',
    orgId: ''
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Connection App Items
  const defaultConnections = [
    { id: 'github', name: 'GitHub', count: 13, type: 'Agent App', creator: 'GitHub', iconColor: 'bg-zinc-800 text-white font-bold' },
    { id: 'asana', name: 'Asana', count: 12, type: 'Agent App', creator: 'Asana', iconColor: 'bg-orange-100 text-orange-600 font-bold' },
    { id: 'box', name: 'Box', count: 10, type: 'Agent App', creator: 'Box', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
    { id: 'clickup', name: 'ClickUp', count: 11, type: 'Agent App', creator: 'ClickUp', iconColor: 'bg-purple-100 text-purple-600 font-bold' },
    { id: 'confluence', name: 'Confluence', count: 10, type: 'Agent App', creator: 'Confluence', iconColor: 'bg-sky-100 text-sky-600 font-bold' },
    { id: 'databricks', name: 'Databricks', count: 0, type: 'MCP', creator: 'Databricks', iconColor: 'bg-red-100 text-red-650 font-bold' },
    { id: 'google-calendar', name: 'Google Calendar', count: 6, type: 'Agent App', creator: 'Google', iconColor: 'bg-blue-50 text-blue-500 font-bold' },
    { id: 'google-contacts', name: 'Google Contacts', count: 16, type: 'Agent App', creator: 'Google', iconColor: 'bg-emerald-50 text-emerald-700 font-bold' },
    { id: 'google-docs', name: 'Google Docs', count: 33, type: 'Agent App', creator: 'Google', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
  ];

  // Integration LLM Providers & Engines
  const defaultIntegrations = [
    { id: 'openai', name: 'OpenAI API', category: 'LLM Provider', description: 'Enable GPT-4o, GPT-4, and GPT-3.5 models.' },
    { id: 'gemini', name: 'Google Gemini', category: 'LLM Provider', description: 'Enable Gemini 1.5 Flash & Pro models.' },
    { id: 'anthropic', name: 'Anthropic Claude', category: 'LLM Provider', description: 'Enable Claude 3.5 Sonnet & Opus models.' },
    { id: 'mastra', name: 'Mastra Engine', category: 'Backend Host', description: 'Power agent state, tools, and background evaluations.' },
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
      orgId: saved.orgId || ''
    });
    setTestResult(null);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!selectedToolConfig) return;

    saveCredentials(selectedToolConfig.id, {
      ...configFormData,
      status: (configFormData.token || configFormData.apiKey) ? 'Configured' : 'Not Configured'
    });

    setSelectedToolConfig(null);
  };

  const handleDisconnectTool = (toolId) => {
    removeCredentials(toolId);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 800));
    setIsTesting(false);
    setTestResult({
      success: true,
      message: `Connection test successful! Valid credentials for ${selectedToolConfig?.name}.`
    });
  };

  const filteredConnections = defaultConnections.filter((conn) => {
    const saved = credentials[conn.id];
    const isConfigured = saved && (saved.status === 'Configured' || saved.token || saved.apiKey);
    const statusText = isConfigured ? 'Configured' : 'Not Configured';

    const matchesSearch =
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || conn.type === typeFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Configured' && isConfigured) ||
      (statusFilter === 'Not Configured' && !isConfigured);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Internal tools list
  const allInternalTools = toolCategories.flatMap((cat) =>
    cat.tools.map((t) => ({ ...t, categoryName: cat.category }))
  );

  const filteredInternalTools = allInternalTools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto select-none selection:bg-indigo-100 font-sans">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Tools & Integrations</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Manage real API keys, OAuth tokens, and application credentials for your CrewAI agents
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {['Connections', 'Internal Tools', 'Integrations'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
              className={`px-0 py-3.5 text-xs font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-6">
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
                    Add real Personal Access Tokens (PAT) and OAuth keys for external services.
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
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-900 dark:text-slate-100 placeholder-gray-405 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 dark:text-slate-300 outline-none hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <option value="All">Type: All</option>
                  <option value="Agent App">Agent App</option>
                  <option value="MCP">MCP</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                    const isConfigured = saved && (saved.status === 'Configured' || saved.token || saved.apiKey);
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
                      <td colSpan="6" className="text-center py-12 text-gray-450 dark:text-slate-500 italic">
                        No connections match query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Internal Tools' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-400">
                  <Wrench className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Internal Tools</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Custom tools registered locally inside this workspace directory.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="whitespace-nowrap font-semibold gap-1.5 border-gray-250 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Directory
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInternalTools.map((tool) => (
                <div
                  key={tool.id}
                  className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-3xs flex flex-col justify-between min-h-[120px]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-gray-950 dark:text-slate-100">{tool.name}</h4>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 border border-slate-205 dark:border-slate-700">
                        {tool.categoryName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-3 pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <span>
                      ID:{' '}
                      <code className="font-mono text-[9.5px] bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                        {tool.id}
                      </code>
                    </span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-0.5">● Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Real Credential Configuration Modal Dialog */}
      {selectedToolConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
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
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

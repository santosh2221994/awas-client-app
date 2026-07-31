import React, { useState } from 'react';
import { Search, Plus, Cpu, CheckCircle2, XCircle, MoreHorizontal, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Button from '../../components/Button';

const INITIAL_CONNECTIONS = [
  { id: 'openai', name: 'OpenAI', provider: 'OpenAI', model: 'gpt-4o', status: 'Connected', apiKey: 'sk-...aX92', type: 'LLM', lastTested: '10 min ago' },
  { id: 'anthropic', name: 'Anthropic Claude', provider: 'Anthropic', model: 'claude-3-5-sonnet', status: 'Connected', apiKey: 'sk-ant-...bZ14', type: 'LLM', lastTested: '1 hour ago' },
  { id: 'gemini', name: 'Google Gemini', provider: 'Google', model: 'gemini-1.5-pro', status: 'Error', apiKey: 'AIza...P3kQ', type: 'LLM', lastTested: '3 hours ago' },
  { id: 'groq', name: 'Groq', provider: 'Groq', model: 'llama3-70b-8192', status: 'Disconnected', apiKey: '—', type: 'LLM', lastTested: 'Never' },
  { id: 'azure-oai', name: 'Azure OpenAI', provider: 'Microsoft Azure', model: 'gpt-4o (azure)', status: 'Disconnected', apiKey: '—', type: 'LLM', lastTested: 'Never' },
  { id: 'bedrock', name: 'AWS Bedrock', provider: 'Amazon', model: 'titan-text-v2', status: 'Connected', apiKey: 'AKIA...R9cL', type: 'Embedding', lastTested: '2 hours ago' },
];

const PROVIDER_COLORS = {
  OpenAI: 'bg-emerald-100/60 text-emerald-700',
  Anthropic: 'bg-orange-100/60 text-orange-700',
  Google: 'bg-blue-100/60 text-blue-700',
  Groq: 'bg-violet-100/60 text-violet-700',
  'Microsoft Azure': 'bg-sky-100/60 text-sky-700',
  Amazon: 'bg-amber-100/60 text-amber-700',
};

const STATUS_META = {
  Connected: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: <CheckCircle2 className="w-3 h-3" /> },
  Disconnected: { cls: 'bg-gray-100 text-gray-500 border border-gray-150', icon: <XCircle className="w-3 h-3" /> },
  Error: { cls: 'bg-red-50 text-red-500 border border-red-100', icon: <XCircle className="w-3 h-3" /> },
};

function MaskedKey({ apiKey }) {
  const [visible, setVisible] = useState(false);
  if (apiKey === '—') return <span className="text-gray-300">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <code className="font-mono text-[11px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
        {visible ? apiKey : apiKey.replace(/[^-\.]/g, (c, i) => i < 5 ? c : '•')}
      </code>
      <button
        onClick={() => setVisible(v => !v)}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function LLMConnectionsPage() {
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = connections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleTest = (id) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, lastTested: 'Just now', status: 'Connected' } : c));
  };

  const connectedCount = connections.filter(c => c.status === 'Connected').length;

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LLM Connections</h1>
            <p className="text-xs text-gray-500 mt-0.5">Configure API keys and model endpoints for your language model providers</p>
          </div>
          <Button variant="brand" size="sm" className="whitespace-nowrap font-semibold gap-1.5 self-start">
            <Plus className="w-3.5 h-3.5" />
            Add Provider
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Providers', value: connections.length },
            { label: 'Connected', value: connectedCount, cls: 'text-emerald-600' },
            { label: 'With Errors', value: connections.filter(c => c.status === 'Error').length, cls: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className={`text-2xl font-bold ${s.cls || 'text-gray-900'}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <Cpu className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-indigo-800">Default model routing</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">
              Agents without an explicit model assigned will use the first Connected LLM provider in this list. Drag to reorder priority.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer"
          >
            <option value="All">Type: All</option>
            <option value="LLM">LLM</option>
            <option value="Embedding">Embedding</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 bg-slate-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="px-6 py-3.5">Provider</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Default Model</th>
                <th className="px-6 py-3.5">API Key</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Tested</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filtered.map((conn) => {
                const meta = STATUS_META[conn.status];
                return (
                  <tr key={conn.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 text-xs font-bold">
                          {conn.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{conn.name}</div>
                          <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${PROVIDER_COLORS[conn.provider] || 'bg-gray-100 text-gray-600'}`}>
                            {conn.provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/40">
                        {conn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-gray-600">{conn.model}</td>
                    <td className="px-6 py-4"><MaskedKey apiKey={conn.apiKey} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
                        {meta.icon}
                        {conn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-[11px]">{conn.lastTested}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTest(conn.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Test
                        </button>
                        <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 italic">
                    No providers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

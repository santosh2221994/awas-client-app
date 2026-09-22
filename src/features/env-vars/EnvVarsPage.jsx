import React, { useState } from 'react';
import { Search, Plus, Variable, Eye, EyeOff, Pencil, Trash2, Copy, Check } from 'lucide-react';
import Button from '../../components/Button';

const INITIAL_VARS = [
  { id: 'ev-1', key: 'OPENAI_API_KEY', value: 'sk-proj-xR92bTLmK7...', scope: 'Global', tags: ['LLM'], lastUpdated: '2 days ago' },
  { id: 'ev-2', key: 'ANTHROPIC_API_KEY', value: 'sk-ant-api03-yZ14...', scope: 'Global', tags: ['LLM'], lastUpdated: '5 days ago' },
  { id: 'ev-3', key: 'POSTGRES_URL', value: 'postgresql://user:pass@host:5432/db', scope: 'Production', tags: ['Database'], lastUpdated: '1 week ago' },
  { id: 'ev-4', key: 'SLACK_BOT_TOKEN', value: 'xoxb-123456-abcde...', scope: 'Global', tags: ['Integration'], lastUpdated: '3 days ago' },
  { id: 'ev-5', key: 'SENDGRID_API_KEY', value: 'SG.T7kPq...', scope: 'Production', tags: ['Email'], lastUpdated: '10 days ago' },
  { id: 'ev-6', key: 'REDIS_URL', value: 'redis://localhost:6379', scope: 'Development', tags: ['Database'], lastUpdated: 'Today' },
  { id: 'ev-7', key: 'WEBHOOK_SECRET', value: 'whsec_xPw8mT...', scope: 'Global', tags: ['Security'], lastUpdated: '1 day ago' },
];

const SCOPE_STYLES = {
  Global: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40',
  Production: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40',
  Development: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40',
};

const TAG_STYLES = {
  LLM: 'bg-purple-100/60 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
  Database: 'bg-sky-100/60 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
  Integration: 'bg-orange-100/60 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300',
  Email: 'bg-pink-100/60 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300',
  Security: 'bg-red-100/60 dark:bg-red-950/60 text-red-700 dark:text-red-300',
};

function VarRow({ variable, onDelete }) {
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors group">
      <td className="px-6 py-4">
        <code className="font-mono text-xs font-bold text-gray-800 dark:text-slate-100">{variable.key}</code>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <code className="font-mono text-[11px] text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700 max-w-[240px] truncate">
            {masked ? '•'.repeat(Math.min(variable.value.length, 20)) : variable.value}
          </code>
          <button onClick={() => setMasked(m => !m)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition">
            {masked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition">
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SCOPE_STYLES[variable.scope] || 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
          {variable.scope}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {variable.tags.map(tag => (
            <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[tag] || 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'}`}>
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-[11px] text-gray-400 dark:text-slate-500">{variable.lastUpdated}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition">
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(variable.id)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/60 transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function EnvVarsPage() {
  const [vars, setVars] = useState(INITIAL_VARS);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('All');

  const filtered = vars.filter((v) => {
    const matchesSearch = v.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'All' || v.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const handleDelete = (id) => {
    setVars(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Environment Variables</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Securely store secrets, API keys, and configuration values used by your agents</p>
          </div>
          <Button variant="brand" size="sm" className="whitespace-nowrap font-semibold gap-1.5 self-start">
            <Plus className="w-3.5 h-3.5" />
            New Variable
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
          <Variable className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Variables are encrypted at rest</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              All values are AES-256 encrypted. Reference them in automations using <code className="font-mono bg-amber-100/60 dark:bg-amber-900/60 px-1 rounded">{'{{env.VARIABLE_NAME}}'}</code>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Variables', value: vars.length },
            { label: 'Global', value: vars.filter(v => v.scope === 'Global').length, cls: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Production', value: vars.filter(v => v.scope === 'Production').length, cls: 'text-emerald-600 dark:text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className={`text-2xl font-bold ${s.cls || 'text-gray-900 dark:text-slate-100'}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 dark:text-slate-300 outline-none hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <option value="All">Scope: All</option>
            <option value="Global">Global</option>
            <option value="Production">Production</option>
            <option value="Development">Development</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                <th className="px-6 py-3.5">Key</th>
                <th className="px-6 py-3.5">Value</th>
                <th className="px-6 py-3.5">Scope</th>
                <th className="px-6 py-3.5">Tags</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs text-gray-700 dark:text-slate-300">
              {filtered.map((variable) => (
                <VarRow key={variable.id} variable={variable} onDelete={handleDelete} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-slate-500 italic">
                    No environment variables found.
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

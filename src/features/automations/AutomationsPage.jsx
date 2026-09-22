import React, { useState } from 'react';
import { Search, Plus, Workflow, Play, Pause, MoreHorizontal, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import Button from '../../components/Button';

const MOCK_AUTOMATIONS = [
  { id: 'auto-1', name: 'Lead Enrichment Pipeline', description: 'Automatically enrich incoming leads with company data and assign to sales reps.', status: 'Active', trigger: 'Webhook', lastRun: '2 min ago', runs: 1482, successRate: 98.2 },
  { id: 'auto-2', name: 'Support Ticket Triage', description: 'Classify and route support tickets to the appropriate team using AI agents.', status: 'Active', trigger: 'Schedule', lastRun: '15 min ago', runs: 893, successRate: 99.5 },
  { id: 'auto-3', name: 'Invoice Processing', description: 'Extract and validate invoice fields, then post to accounting system.', status: 'Paused', trigger: 'Email', lastRun: '3 hours ago', runs: 340, successRate: 94.1 },
  { id: 'auto-4', name: 'Content Moderation', description: 'Review user-generated content and flag policy violations for human review.', status: 'Active', trigger: 'Queue', lastRun: '8 min ago', runs: 5210, successRate: 97.8 },
  { id: 'auto-5', name: 'Daily Report Generator', description: 'Compile metrics from multiple sources and email a daily digest to stakeholders.', status: 'Active', trigger: 'Schedule', lastRun: '6 hours ago', runs: 182, successRate: 100 },
  { id: 'auto-6', name: 'Onboarding Email Sequence', description: 'Send personalized onboarding emails based on new user actions and profile.', status: 'Draft', trigger: 'Event', lastRun: 'Never', runs: 0, successRate: 0 },
];

const STATUS_STYLES = {
  Active: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900',
  Paused: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900',
  Draft: 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-150 dark:border-slate-700',
  Error: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900',
};

const STATUS_ICONS = {
  Active: <CheckCircle2 className="w-3 h-3" />,
  Paused: <Pause className="w-3 h-3" />,
  Draft: <Circle className="w-3 h-3" />,
  Error: <AlertCircle className="w-3 h-3" />,
};

const TRIGGER_STYLES = {
  Webhook: 'bg-purple-100/60 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800',
  Schedule: 'bg-blue-100/60 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/40 dark:border-blue-800',
  Email: 'bg-pink-100/60 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-200/40 dark:border-pink-800',
  Queue: 'bg-orange-100/60 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 border border-orange-200/40 dark:border-orange-800',
  Event: 'bg-teal-100/60 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 border border-teal-200/40 dark:border-teal-800',
};

export default function AutomationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  const filtered = automations.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Automations', value: automations.length, sub: `${automations.filter(a => a.status === 'Active').length} active` },
    { label: 'Total Runs (30d)', value: automations.reduce((s, a) => s + a.runs, 0).toLocaleString(), sub: 'Across all workflows' },
    { label: 'Avg Success Rate', value: `${(automations.filter(a => a.runs > 0).reduce((s, a) => s + a.successRate, 0) / automations.filter(a => a.runs > 0).length).toFixed(1)}%`, sub: 'Last 30 days' },
  ];

  const handleToggle = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id !== id) return a;
      return { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' };
    }));
  };

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto select-none selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-8 py-6 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Automations</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Build and manage agentic workflow automations</p>
          </div>
          <Button variant="brand" size="sm" className="whitespace-nowrap font-semibold gap-1.5 self-start">
            <Plus className="w-3.5 h-3.5" />
            New Automation
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{s.value}</div>
              <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-1">{s.label}</div>
              <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400 dark:placeholder-slate-500 text-gray-800 dark:text-slate-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 dark:text-slate-200 outline-none hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                <th className="px-6 py-3.5">Automation</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Trigger</th>
                <th className="px-6 py-3.5">Last Run</th>
                <th className="px-6 py-3.5">Runs (30d)</th>
                <th className="px-6 py-3.5">Success</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs text-gray-700 dark:text-slate-300">
              {filtered.map((auto) => (
                <tr key={auto.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-slate-100">{auto.name}</div>
                        <div className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 max-w-xs truncate">{auto.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[auto.status]}`}>
                      {STATUS_ICONS[auto.status]}
                      {auto.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${TRIGGER_STYLES[auto.trigger]}`}>
                      {auto.trigger}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {auto.lastRun}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">{auto.runs.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {auto.runs > 0 ? (
                      <span className={`font-semibold ${auto.successRate >= 98 ? 'text-emerald-600 dark:text-emerald-400' : auto.successRate >= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                        {auto.successRate}%
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {auto.status !== 'Draft' && (
                        <button
                          onClick={() => handleToggle(auto.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${auto.status === 'Active'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/60'
                            }`}
                        >
                          {auto.status === 'Active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {auto.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 italic">
                    No automations match the current filters.
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

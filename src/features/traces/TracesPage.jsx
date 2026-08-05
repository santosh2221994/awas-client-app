import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown, Clock, Activity, CheckCircle2, XCircle, Filter } from 'lucide-react';

const MOCK_TRACES = [
  { id: 'tr-0001', name: 'Lead Enrichment Pipeline', agent: 'SalesAgent', status: 'Success', duration: '1.24s', tokens: 3120, cost: '$0.0042', timestamp: '2 min ago', steps: 8 },
  { id: 'tr-0002', name: 'Support Ticket Triage', agent: 'SupportAgent', status: 'Success', duration: '0.87s', tokens: 1850, cost: '$0.0021', timestamp: '15 min ago', steps: 5 },
  { id: 'tr-0003', name: 'Invoice Processing', agent: 'FinanceAgent', status: 'Failed', duration: '3.52s', tokens: 5400, cost: '$0.0074', timestamp: '1 hour ago', steps: 12 },
  { id: 'tr-0004', name: 'Content Moderation', agent: 'ModerationAgent', status: 'Success', duration: '0.61s', tokens: 920, cost: '$0.0011', timestamp: '8 min ago', steps: 4 },
  { id: 'tr-0005', name: 'Daily Report Generator', agent: 'ReportAgent', status: 'Success', duration: '4.18s', tokens: 8740, cost: '$0.0142', timestamp: '6 hours ago', steps: 18 },
  { id: 'tr-0006', name: 'Onboarding Email', agent: 'MarketingAgent', status: 'Running', duration: '—', tokens: 1200, cost: '$0.0016', timestamp: 'Just now', steps: 3 },
  { id: 'tr-0007', name: 'Lead Enrichment Pipeline', agent: 'SalesAgent', status: 'Failed', duration: '2.01s', tokens: 2400, cost: '$0.0033', timestamp: '3 hours ago', steps: 7 },
  { id: 'tr-0008', name: 'Support Ticket Triage', agent: 'SupportAgent', status: 'Success', duration: '0.92s', tokens: 2100, cost: '$0.0024', timestamp: '22 min ago', steps: 5 },
];

const STATUS_META = {
  Success: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: <CheckCircle2 className="w-3 h-3" /> },
  Failed: { cls: 'bg-red-50 text-red-500 border border-red-100', icon: <XCircle className="w-3 h-3" /> },
  Running: { cls: 'bg-blue-50 text-blue-600 border border-blue-100', icon: <Activity className="w-3 h-3" /> },
};

const MOCK_STEPS = [
  { step: 1, name: 'Trigger fired', type: 'Trigger', duration: '12ms', status: 'Success' },
  { step: 2, name: 'Fetch CRM record', type: 'Tool Call', duration: '340ms', status: 'Success' },
  { step: 3, name: 'Enrich via Clearbit', type: 'Tool Call', duration: '620ms', status: 'Success' },
  { step: 4, name: 'Classify lead intent', type: 'LLM Call', duration: '780ms', status: 'Success' },
  { step: 5, name: 'Write summary to CRM', type: 'Tool Call', duration: '290ms', status: 'Success' },
];

function TraceRow({ trace }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[trace.status] || STATUS_META.Success;

  return (
    <>
      <tr
        className="hover:bg-slate-50/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            <span className="font-mono text-[11px] text-gray-400">{trace.id}</span>
          </div>
        </td>
        <td className="px-6 py-4 font-semibold text-gray-900">{trace.name}</td>
        <td className="px-6 py-4 text-gray-500">{trace.agent}</td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
            {meta.icon}
            {trace.status}
          </span>
        </td>
        <td className="px-6 py-4 font-mono text-gray-700">{trace.duration}</td>
        <td className="px-6 py-4 text-gray-500">{trace.tokens.toLocaleString()}</td>
        <td className="px-6 py-4 text-gray-500">{trace.cost}</td>
        <td className="px-6 py-4">
          <span className="flex items-center gap-1 text-gray-400 text-[11px]">
            <Clock className="w-3 h-3" />
            {trace.timestamp}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/60">
          <td colSpan="8" className="px-8 pb-4 pt-2">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-gray-700">Execution Steps</span>
                <span className="ml-auto text-[11px] text-gray-400">{trace.steps} steps total</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Step Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_STEPS.slice(0, trace.steps > 5 ? 5 : trace.steps).map((s) => (
                    <tr key={s.step} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 text-gray-400 font-mono">{s.step}</td>
                      <td className="px-4 py-2 text-gray-800 font-medium">{s.name}</td>
                      <td className="px-4 py-2">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100/60 text-indigo-600 border border-indigo-200/40">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-gray-600">{s.duration}</td>
                      <td className="px-4 py-2">
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {trace.steps > 5 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-center text-[11px] text-gray-400 italic">
                        +{trace.steps - 5} more steps
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function TracesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = MOCK_TRACES.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.agent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const successCount = MOCK_TRACES.filter(t => t.status === 'Success').length;
  const failedCount = MOCK_TRACES.filter(t => t.status === 'Failed').length;

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Traces</h1>
          <p className="text-xs text-gray-500">Inspect execution logs, token usage, and step-by-step agent traces</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Traces', value: MOCK_TRACES.length, color: 'text-gray-900' },
            { label: 'Successful', value: successCount, color: 'text-emerald-600' },
            { label: 'Failed', value: failedCount, color: 'text-red-500' },
            { label: 'Total Tokens', value: MOCK_TRACES.reduce((s, t) => s + t.tokens, 0).toLocaleString(), color: 'text-indigo-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Running">Running</option>
          </select>
          <button className="flex items-center gap-1.5 border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer">
            <Filter className="w-3 h-3" />
            More Filters
          </button>
        </div>

        {/* Traces Table */}
        <div className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 bg-slate-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="px-6 py-3.5">Trace ID</th>
                <th className="px-6 py-3.5">Automation</th>
                <th className="px-6 py-3.5">Agent</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Tokens</th>
                <th className="px-6 py-3.5">Cost</th>
                <th className="px-6 py-3.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filtered.map((trace) => (
                <TraceRow key={trace.id} trace={trace} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 italic">
                    No traces match the current filters.
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

import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Zap, MessageSquare, Clock } from 'lucide-react';

const PERIODS = ['7d', '30d', '90d'];

const USAGE_SUMMARY = {
  '7d': { runs: 1820, tokens: 284500, avgLatency: '1.4s', topAgent: 'SalesAgent', cost: '$3.82' },
  '30d': { runs: 8140, tokens: 1340000, avgLatency: '1.6s', topAgent: 'SupportAgent', cost: '$18.22' },
  '90d': { runs: 22800, tokens: 3980000, avgLatency: '1.5s', topAgent: 'SalesAgent', cost: '$54.67' },
};

const DAILY_DATA_30D = [
  { day: 'Dec 01', runs: 210, tokens: 38000 },
  { day: 'Dec 02', runs: 185, tokens: 32000 },
  { day: 'Dec 03', runs: 310, tokens: 55000 },
  { day: 'Dec 04', runs: 270, tokens: 48000 },
  { day: 'Dec 05', runs: 340, tokens: 62000 },
  { day: 'Dec 06', runs: 290, tokens: 51000 },
  { day: 'Dec 07', runs: 380, tokens: 70000 },
  { day: 'Dec 08', runs: 420, tokens: 76000 },
  { day: 'Dec 09', runs: 360, tokens: 65000 },
  { day: 'Dec 10', runs: 410, tokens: 74000 },
  { day: 'Dec 11', runs: 350, tokens: 63000 },
  { day: 'Dec 12', runs: 430, tokens: 78000 },
  { day: 'Dec 13', runs: 395, tokens: 71000 },
  { day: 'Dec 14', runs: 460, tokens: 83000 },
];

const TOP_AGENTS_DATA = [
  { agent: 'SalesAgent', runs: 2180, tokens: 342000, pct: 88 },
  { agent: 'SupportAgent', runs: 1920, tokens: 298000, pct: 77 },
  { agent: 'ModerationAgent', runs: 1650, tokens: 196000, pct: 66 },
  { agent: 'ReportAgent', runs: 890, tokens: 278000, pct: 45 },
  { agent: 'FinanceAgent', runs: 650, tokens: 182000, pct: 33 },
];

function MiniBarChart({ data, valueKey, color = 'bg-indigo-500' }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
          style={{ height: `${Math.max(4, (d[valueKey] / max) * 100)}%` }}
          title={`${d.day}: ${d[valueKey].toLocaleString()}`}
        />
      ))}
    </div>
  );
}

export default function UsagePage() {
  const [period, setPeriod] = useState('30d');
  const summary = USAGE_SUMMARY[period];

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Usage</h1>
            <p className="text-xs text-gray-500 mt-0.5">Monitor automation runs, token consumption, and agent performance</p>
          </div>
          {/* Period Selector */}
          <div className="flex bg-gray-200/65 p-0.5 rounded-lg border border-gray-200 self-start">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${period === p ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Runs', value: summary.runs.toLocaleString(), icon: <Zap className="w-4 h-4" />, trend: +12, iconBg: 'bg-indigo-50 text-indigo-500' },
            { label: 'Tokens Used', value: (summary.tokens / 1000).toFixed(0) + 'K', icon: <MessageSquare className="w-4 h-4" />, trend: +8, iconBg: 'bg-purple-50 text-purple-500' },
            { label: 'Avg Latency', value: summary.avgLatency, icon: <Clock className="w-4 h-4" />, trend: -3, iconBg: 'bg-blue-50 text-blue-500' },
            { label: 'Est. Cost', value: summary.cost, icon: <BarChart3 className="w-4 h-4" />, trend: +6, iconBg: 'bg-emerald-50 text-emerald-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  {card.icon}
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${card.trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(card.trend)}%
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900">{card.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Runs Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Daily Runs</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Automation executions over time</p>
              </div>
            </div>
            <MiniBarChart data={DAILY_DATA_30D} valueKey="runs" color="bg-indigo-500" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400">{DAILY_DATA_30D[0].day}</span>
              <span className="text-[10px] text-gray-400">{DAILY_DATA_30D[DAILY_DATA_30D.length - 1].day}</span>
            </div>
          </div>

          {/* Token Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Daily Token Usage</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Tokens consumed per day</p>
              </div>
            </div>
            <MiniBarChart data={DAILY_DATA_30D} valueKey="tokens" color="bg-purple-500" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400">{DAILY_DATA_30D[0].day}</span>
              <span className="text-[10px] text-gray-400">{DAILY_DATA_30D[DAILY_DATA_30D.length - 1].day}</span>
            </div>
          </div>
        </div>

        {/* Top Agents Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Top Agents by Usage</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Ranked by total automation runs in the selected period</p>
          </div>
          <div className="divide-y divide-gray-100">
            {TOP_AGENTS_DATA.map((agent, idx) => (
              <div key={agent.agent} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/30 transition-colors">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 text-xs font-bold flex-shrink-0">
                  {agent.agent.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{agent.agent}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${agent.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium w-6 text-right">{agent.pct}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs font-bold text-gray-900">{agent.runs.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400">{(agent.tokens / 1000).toFixed(0)}K tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

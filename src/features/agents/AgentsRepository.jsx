import React, { useEffect, useState } from 'react';
import { Search, Plus, Bot, Sparkles, Cpu, Wrench, Grid, List, ArrowUpRight, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { listAgents } from '../../api/services/agentService';
import Button from '../../components/Button';
import { useUIStore } from '../../stores/useUIStore';
import { cn } from '../../utils/cn';

function AgentCard({ agent, viewMode }) {
  const { setActiveNavItem, setSelectedAgentId } = useUIStore();

  function handleSelectAgent() {
    setActiveNavItem('agents');
    setSelectedAgentId(agent.id);
  }

  const isCoPilot = agent.type?.toLowerCase().includes('copilot') || 
                    agent.type?.toLowerCase().includes('co-pilot') || 
                    agent.id === 'agent-builder-agent';

  if (viewMode === 'grid') {
    return (
      <div
        onClick={handleSelectAgent}
        className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-3xl shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs transition-transform group-hover:scale-105 shrink-0",
                isCoPilot
                  ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800"
                  : "bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900"
              )}>
                {isCoPilot ? <Sparkles className="w-5 h-5 text-amber-300" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className={cn(
                  "inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1",
                  isCoPilot
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}>
                  {agent.type || 'Assistant'}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {agent.name || 'Untitled Agent'}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {agent.description || 'No description provided for this agent.'}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200/60 dark:border-slate-750 font-mono">
              <Cpu className="w-3 h-3 text-indigo-500" />
              {agent.model || 'gpt-4o'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200/60 dark:border-slate-750">
              <Wrench className="w-3 h-3 text-amber-500" />
              {agent.tools?.length ?? 0} tool{agent.tools?.length === 1 ? '' : 's'}
            </span>
            {agent.price && agent.price !== 'Free' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800 ml-auto">
                {agent.price}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium truncate">By {agent.username || 'Creator'}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleSelectAgent(); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 shrink-0"
            >
              <span>View Agent</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleSelectAgent}
      className="group cursor-pointer flex flex-col gap-3 p-4 border border-gray-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-2xs transition-transform group-hover:scale-105",
          isCoPilot ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" : "bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900"
        )}>
          {isCoPilot ? <Sparkles className="w-5 h-5 text-amber-300" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {agent.name || 'Untitled Agent'}
            </h3>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 border border-indigo-100 dark:border-indigo-900">
              {agent.type || 'Assistant'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
            {agent.description || 'No description available.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <span className="rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200/80 dark:border-slate-750 px-2.5 py-1 text-xs text-gray-600 dark:text-slate-300 font-mono">
            {agent.model || 'gpt-4o'}
          </span>
          <span className="rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200/80 dark:border-slate-750 px-2.5 py-1 text-xs text-gray-600 dark:text-slate-300">
            {agent.tools?.length ?? 0} tools
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleSelectAgent(); }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <span>Open Agent</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AgentsRepository() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    let isInitial = true;

    async function fetchAgents(isFirstLoad = false) {
      if (isFirstLoad) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await listAgents();
        const newList = Array.isArray(data) ? data : [];
        setAgents((prev) => {
          const prevSig = prev.map((a) => `${a.id}:${a.name}:${a.tools?.length}`).join('|');
          const newSig = newList.map((a) => `${a.id}:${a.name}:${a.tools?.length}`).join('|');
          return prevSig === newSig ? prev : newList;
        });
      } catch (err) {
        setError(err.message || 'Unable to load agents.');
      } finally {
        if (isFirstLoad) {
          setLoading(false);
        }
      }
    }

    fetchAgents(true);

    const handleUpdate = () => fetchAgents(false);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('agent_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('agent_updated', handleUpdate);
    };
  }, []);

  const categories = ['All', 'Co-Pilots', 'Assistants', 'Custom'];

  const filteredAgents = agents.filter((agent) => {
    const value = query.toLowerCase();
    const matchesSearch = (
      agent.name?.toLowerCase().includes(value) ||
      agent.description?.toLowerCase().includes(value) ||
      agent.model?.toLowerCase().includes(value)
    );

    if (!matchesSearch) return false;

    if (category === 'Co-Pilots') {
      return agent.type?.toLowerCase().includes('copilot') || agent.type?.toLowerCase().includes('co-pilot') || agent.id === 'agent-builder-agent';
    }
    if (category === 'Custom') {
      return agent.id?.startsWith('custom-');
    }
    if (category === 'Assistants') {
      return !agent.type?.toLowerCase().includes('copilot') && !agent.type?.toLowerCase().includes('co-pilot');
    }

    return true;
  });

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/60 dark:bg-slate-950 relative transition-colors duration-200">
      <div className="h-full overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Premium Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-colors">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">AWAS Agent Repository</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight sm:text-3xl">
                  AI Agent Directory & Hub
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Browse, configure, and chat with autonomous agents or use the <strong className="text-indigo-600 dark:text-indigo-400">Agent Builder Co-Pilot</strong> in the chat sidebar to generate custom agents.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-4 py-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{agents.length} Active Agents</span>
                </div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Category tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-slate-800 p-1 rounded-2xl border border-gray-200/50 dark:border-slate-700">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer select-none",
                      category === cat
                        ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 shadow-xs"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Layout toggle */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200/80 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    placeholder="Search agents, models, tools..."
                  />
                </div>

                <div className="flex items-center bg-gray-100/80 dark:bg-slate-800 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all cursor-pointer",
                      viewMode === 'grid' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    )}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all cursor-pointer",
                      viewMode === 'list' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    )}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Display Area */}
          <div>
            {loading && agents.length === 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-44 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-slate-800" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-2 bg-gray-100 dark:bg-slate-850 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && agents.length === 0 && (
              <div className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {!loading && filteredAgents.length === 0 && agents.length > 0 && (
              <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">No agents found</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or use the Agent Builder Co-Pilot in the left sidebar to create a new agent.
                </p>
              </div>
            )}

            {filteredAgents.length > 0 && (
              <div className={cn(
                viewMode === 'grid'
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}>
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id || agent.name} agent={agent} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

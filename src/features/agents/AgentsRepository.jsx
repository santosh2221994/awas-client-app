import React, { useEffect, useState } from 'react';
import { Search, Plus, Bot, LayoutTemplate } from 'lucide-react';
import { listAgents } from '../../api/services/agentService';
import Button from '../../components/Button';
import { useUIStore } from '../../stores/useUIStore';

function AgentRow({ agent }) {
  const { setActiveNavItem, setSelectedAgentId } = useUIStore();

  function handleSelectAgent() {
    setActiveNavItem('agents');
    setSelectedAgentId(agent.id);
  }

  return (
    <div
      onClick={handleSelectAgent}
      className="cursor-pointer flex flex-col gap-3 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Bot className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{agent.name || 'Untitled agent'}</div>
          <div className="text-xs text-gray-500 truncate">
            {agent.description || 'No description available.'}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="text-xs text-gray-500">Type: {agent.type || 'Agent'}</div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">Model: {agent.model || 'Unknown'}</span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">Tools: {agent.tools?.length ?? 0}</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            handleSelectAgent();
          }}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          View Agent
        </Button>
      </div>
    </div>
  );
}

export default function AgentsRepository() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchAgents() {
      setLoading(true);
      setError(null);
      try {
        const data = await listAgents();
        setAgents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load agents.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const value = query.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(value) ||
      agent.description?.toLowerCase().includes(value) ||
      agent.model?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">Agents Repository</p>
                <h1 className="mt-2 text-2xl font-semibold text-gray-900">Create and configure CrewAI agents or connect external A2A agents</h1>
                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  Browse all available agents, connect external tools, and manage agent workflows from one centralized repository.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="brand" size="sm" className="whitespace-nowrap">
                  <Plus />
                  Add Agent
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                  placeholder="Search agents, models, or tools"
                />
              </div>
              <div className="text-sm text-gray-500">
                {agents.length} agent{agents.length === 1 ? '' : 's'} available
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                Loading agents...
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && filteredAgents.length === 0 && (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No agents found. Try adjusting your search.
              </div>
            )}

            {filteredAgents.map((agent) => (
              <AgentRow key={agent.id || agent.name} agent={agent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

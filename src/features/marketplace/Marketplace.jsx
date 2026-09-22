import React, { useEffect, useState } from 'react';
import { Search, Bot, ShoppingBag, Star, Plus, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

async function fetchMarketplaceAgents() {
  const res = await client.get(ENDPOINTS.AGENTS);
  const data = res;
  const agentList = Array.isArray(data) ? data : Object.values(data ?? {});
  return agentList.filter((a) => a.price > 0).map((a) => ({
    id: a.id || a.name,
    name: a.name,
    description: a.description,
    type: a.type || 'Automation',
    price: `$${a.price}`,
    username: a.username,
    rating: '4.7',
  }));
}

export default function Marketplace() {
  const { setActiveNavItem, setSelectedAgentId } = useUIStore();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mSearch, setMSearch] = useState('');
  const [mCategory, setMCategory] = useState('All');

  const [myListedAgents, setMyListedAgents] = useState(() => {
    const stored = localStorage.getItem('custom_agents');
    const list = stored ? JSON.parse(stored) : [];
    return list.filter((a) => a.sellOnMarketplace);
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentType, setNewAgentType] = useState('Assistant');
  const [newAgentModel, setNewAgentModel] = useState('gpt-4o');
  const [newAgentPrice, setNewAgentPrice] = useState('');

  useEffect(() => {
    fetchMarketplaceAgents()
      .then(setAgents)
      .catch((err) => setError(err.message || 'Unable to load marketplace agents.'))
      .finally(() => setLoading(false));
  }, []);

  const allAgents = [
    ...agents,
    ...myListedAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      type: a.type || 'Assistant',
      price: a.price,
      username: a.username || 'creator',
      rating: '5.0',
    })),
  ];

  const filtered = allAgents.filter((agent) => {
    const q = mSearch.toLowerCase();
    const matches = agent.name?.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q);
    const matchesCat =
      mCategory === 'All' ||
      (mCategory === 'Premium' && agent.price !== 'Free') ||
      agent.type === mCategory;
    return matches && matchesCat;
  });

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const price = newAgentPrice.startsWith('$') ? newAgentPrice : `$${newAgentPrice}`;
    const newAgent = {
      id: `custom-${Date.now()}`,
      name: newAgentName,
      description: newAgentDesc,
      type: newAgentType,
      model: newAgentModel,
      price,
      sellOnMarketplace: true,
      tools: [],
    };

    const stored = localStorage.getItem('custom_agents');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('custom_agents', JSON.stringify([...existing, newAgent]));
    setMyListedAgents((prev) => [...prev, newAgent]);
    setNewAgentName(''); setNewAgentDesc(''); setNewAgentPrice('');
    setNewAgentType('Assistant'); setNewAgentModel('gpt-4o');
    setShowCreateModal(false);
  };

  return (
  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8 pb-16">

          {/* Banner */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Marketplace</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-1">Discover & use premium AI agents</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Browse agents built by the community. Click "Use Agent" to start chatting.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Sell on Marketplace
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search marketplace..."
                value={mSearch}
                onChange={(e) => setMSearch(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 font-medium placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
            <div className="flex bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {['All', 'Premium'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mCategory === cat ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-xs' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center text-xs text-gray-500 dark:text-slate-400">
                Loading marketplace...
              </div>
            )}
            {error && (
              <div className="col-span-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 text-center text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="col-span-full border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center text-xs text-gray-500 dark:text-slate-400">
                No agents found in the marketplace.
              </div>
            )}
            {!loading && !error && filtered.map((agent) => (
              <div
                key={agent.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold rounded-lg px-2 py-0.5 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60">
                      {agent.price}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 dark:text-slate-100 mt-3.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {agent.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{agent.rating}</span>
                    <span className="text-gray-300 dark:text-slate-600 text-[10px]">•</span>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded px-1.5 py-0.5 uppercase">
                      {agent.type}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                    {agent.username ? `@${agent.username}` : 'By CrewStudio'}
                  </span>
                  <button
                    className="px-3 py-1 text-[11px] font-bold rounded-lg border bg-purple-600 text-white border-purple-600 hover:bg-purple-700 transition-all"
                    onClick={() => { setActiveNavItem('agents'); setSelectedAgentId(agent.id); }}
                  >
                    Use Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sell on Marketplace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateAgent}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 dark:border-slate-800 relative"
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="pb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">List Agent on Marketplace</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure your agent and set a price to sell it publicly</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Agent Name</label>
                <input
                  type="text" required placeholder="e.g. Content Publisher Bot"
                  value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  required rows={3} placeholder="What does this agent do?"
                  value={newAgentDesc} onChange={(e) => setNewAgentDesc(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Type</label>
                  <select value={newAgentType} onChange={(e) => setNewAgentType(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                    <option>Assistant</option><option>Marketing</option><option>Development</option>
                    <option>Data Science</option><option>Writing</option><option>Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Price (e.g. $10)</label>
                  <input
                    type="text" required placeholder="$10"
                    value={newAgentPrice} onChange={(e) => setNewAgentPrice(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl transition">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-sm">
                List Agent
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

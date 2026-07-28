import React, { useEffect, useState } from 'react';
import {
    Search, Plus, Bot, ChevronRight,
    PanelRightOpen, PanelRightClose, ShoppingBag,
    Star, X
} from 'lucide-react';
import { listAgents } from '../../api/services/agentService';
import { useUIStore } from '../../stores/useUIStore';
import Button from '../../components/Button';

export default function CrewStudioDashboard() {
    const { setSelectedCrewAgentId, isRightPanelOpen, toggleRightPanel } = useUIStore();

    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [mSearch, setMSearch] = useState('');
    const [mCategory, setMCategory] = useState('All');
    const [mAgents, setMAgents] = useState([]);
    const [mLoading, setMLoading] = useState(true);
    const [mError, setMError] = useState(null);

    const [myListedAgents, setMyListedAgents] = useState(() => {
        const stored = localStorage.getItem('custom_agents');
        return stored ? JSON.parse(stored) : [];
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDesc, setNewAgentDesc] = useState('');
    const [newAgentType, setNewAgentType] = useState('Assistant');
    const [newAgentModel, setNewAgentModel] = useState('gpt-4o');
    const [newAgentSell, setNewAgentSell] = useState(false);
    const [newAgentPrice, setNewAgentPrice] = useState('');

    useEffect(() => {
        localStorage.setItem('custom_agents', JSON.stringify(myListedAgents));
    }, [myListedAgents]);

    useEffect(() => {
        async function fetchAgentsList() {
            setLoading(true);
            setError(null);
            try {
                const data = await listAgents();
                setAgents(Array.isArray(data) ? data : []);
                setMAgents((Array.isArray(data) ? data : []).filter((a) => a.price && a.price !== 'Free'));
            } catch (err) {
                setError(err.message || 'Unable to load agents.');
                setMError(err.message || 'Unable to load marketplace agents.');
            } finally {
                setLoading(false);
                setMLoading(false);
            }
        }
        fetchAgentsList();
    }, [myListedAgents]);

    const cleanPrice = (p) => parseFloat(p?.toString().replace(/[^0-9.]/g, '')) || 0;

    const hasPricing = (agent) => {
        const p = agent.price;
        return p !== undefined && p !== null && p !== 'Free' && cleanPrice(p) > 0;
    };

    const allMarketplaceAgents = [
        ...mAgents,
        ...myListedAgents.filter((a) => a.sellOnMarketplace),
    ].filter((agent) => {
        const q = mSearch.toLowerCase();
        const matches = agent.name?.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q);
        const matchesCat = mCategory === 'All' || (mCategory === 'Premium' && agent.price !== 'Free') || agent.type === mCategory;
        return matches && matchesCat;
    });

    // Recent Projects — agents with no price
    const recentAgents = agents.filter((agent) => {
        if (hasPricing(agent)) return false;
        const q = query.toLowerCase();
        const matches = agent.name?.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q);
        if (activeTab === 'Mine') return matches && agent.id !== 'agent-2';
        if (activeTab === 'Shared with me') return matches && agent.id === 'agent-2';
        return matches;
    });

    const handleCreateAgent = (e) => {
        e.preventDefault();
        if (!newAgentName.trim()) return;

        const price = newAgentSell
            ? (newAgentPrice.startsWith('$') ? newAgentPrice : `$${newAgentPrice}`)
            : 'Free';

        const newAgent = {
            id: `custom-${Date.now()}`,
            name: newAgentName,
            description: newAgentDesc,
            type: newAgentType,
            model: newAgentModel,
            price,
            sellOnMarketplace: newAgentSell,
            rating: 5.0,
            category: newAgentType,
            tools: [],
        };

        setMyListedAgents([...myListedAgents, newAgent]);
        setNewAgentName('');
        setNewAgentDesc('');
        setNewAgentType('Assistant');
        setNewAgentModel('gpt-4o');
        setNewAgentSell(false);
        setNewAgentPrice('');
        setShowCreateModal(false);
    };

    return (
        <div className="flex-1 bg-slate-50/50 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-8 py-8 space-y-10 pb-16">

                {/* Banner */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Crew Studio Workspace</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mt-1">Agent & Workflow Studio</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Build autonomous agent flows or buy custom-built agents from the marketplace.</p>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Recent projects</h2>
                            <p className="text-xs text-gray-500">Pick up where you left off or deploy new agent capabilities</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white border-slate-200 text-slate-800 text-xs font-semibold shadow-xs"
                            onClick={() => { setNewAgentSell(true); setShowCreateModal(true); }}
                        >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                            Sell on Marketplace
                        </Button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-200/65 p-0.5 rounded-lg border border-gray-200">
                                {['All', 'Mine', 'Shared with me'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={toggleRightPanel}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all outline-none"
                                title={isRightPanelOpen ? 'Close panel' : 'Open tools & crew'}
                            >
                                {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {/* Create New */}
                        <div
                            onClick={() => { setNewAgentSell(false); setShowCreateModal(true); }}
                            className="group cursor-pointer border-2 border-dashed border-gray-300 bg-white hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center min-h-[175px] py-6 px-4 text-center transition-all duration-200 hover:shadow-xs flex-shrink-0 w-[350px]"
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-800 mt-3 group-hover:text-indigo-600">Create New</h3>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-[150px]">Start fresh project or workflow canvas</p>
                        </div>

                        {loading && (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-12 bg-white text-center text-xs text-gray-500 w-[350px] flex-shrink-0 flex items-center justify-center min-h-[175px]">
                                Loading agents list...
                            </div>
                        )}
                        {error && (
                            <div className="border border-red-100 rounded-2xl p-8 bg-red-50 text-center text-xs text-red-600 font-medium w-[350px] flex-shrink-0 flex items-center justify-center min-h-[175px]">
                                {error}
                            </div>
                        )}

                        {!loading && !error && recentAgents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedCrewAgentId(agent.id)}
                                className="group cursor-pointer border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] flex flex-col justify-between min-h-[175px] flex-shrink-0 w-[350px] bg-white border-gray-200 hover:border-indigo-200"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 uppercase bg-gray-50">
                                            {agent.type || 'Agent'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold mt-4 line-clamp-1 text-gray-800 group-hover:text-indigo-600 transition-colors">
                                        {agent.name}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                        {agent.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mt-4">
                                    <span className="text-[10px] text-gray-400 select-none">Modified 17 days ago</span>
                                    <button
                                        className="text-[11px] font-bold text-indigo-600 transition-colors flex items-center gap-0.5"
                                        onClick={(e) => { e.stopPropagation(); setSelectedCrewAgentId(agent.id); }}
                                    >
                                        <span>Edit Schema</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Marketplace */}
                <div className="space-y-6 pt-4 border-t border-slate-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">AI Agent Marketplace</h2>
                            </div>
                            <p className="text-xs text-gray-500">Discover and use premade specialist agents</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search marketplace..."
                                    value={mSearch}
                                    onChange={(e) => setMSearch(e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium placeholder-gray-400"
                                />
                            </div>
                            <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                                {['All', 'Premium'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setMCategory(cat)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${mCategory === cat ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mLoading && (
                            <div className="col-span-full border border-dashed border-gray-300 rounded-3xl p-12 text-center text-xs text-gray-500">
                                Loading marketplace...
                            </div>
                        )}
                        {mError && (
                            <div className="col-span-full border border-red-200 bg-red-50 rounded-3xl p-8 text-center text-sm text-red-700">
                                {mError}
                            </div>
                        )}
                        {!mLoading && !mError && allMarketplaceAgents.length === 0 && (
                            <div className="col-span-full border border-dashed border-gray-300 rounded-3xl p-12 text-center text-xs text-gray-500">
                                No agents found in the marketplace.
                            </div>
                        )}
                        {!mLoading && !mError && allMarketplaceAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold rounded-lg px-2 py-0.5 text-indigo-700 bg-indigo-50 border border-indigo-100">
                                            {agent.price}
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-800 mt-3.5 group-hover:text-purple-600 transition-colors">
                                        {agent.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                                        {agent.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-3">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        <span className="text-[10px] font-bold text-gray-700">{agent.rating}</span>
                                        <span className="text-gray-300 text-[10px]">•</span>
                                        <span className="text-[9px] font-bold text-gray-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 uppercase">
                                            {agent.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
                                    <span className="text-[9px] text-slate-400 font-medium">
                                        {agent.username ? `@${agent.username}` : 'By CrewStudio'}
                                    </span>
                                    <button
                                        className="px-3 py-1 text-[11px] font-bold rounded-lg border bg-purple-600 text-white border-purple-600 hover:bg-purple-700 transition-all"
                                        onClick={() => setSelectedCrewAgentId(agent.id)}
                                    >
                                        Use Agent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleCreateAgent}
                        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="pb-4">
                            <h3 className="text-base font-bold text-gray-900">Create Crew Agent</h3>
                            <p className="text-xs text-gray-500 mt-1">Configure your custom agent specifications & tools</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Agent Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Content Publisher Bot"
                                    value={newAgentName}
                                    onChange={(e) => setNewAgentName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description / Goal</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Define what instructions/tasks this agent executes..."
                                    value={newAgentDesc}
                                    onChange={(e) => setNewAgentDesc(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Specialty Domain</label>
                                    <select
                                        value={newAgentType}
                                        onChange={(e) => setNewAgentType(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option>Assistant</option>
                                        <option>Marketing</option>
                                        <option>Development</option>
                                        <option>Data Science</option>
                                        <option>Writing</option>
                                        <option>Analytics</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">LLM Model</label>
                                    <select
                                        value={newAgentModel}
                                        onChange={(e) => setNewAgentModel(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="claude-3-opus">Claude 3 Opus</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                        <option value="llama-3">Llama 3</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">List for sale on Marketplace</span>
                                        <span className="block text-[10px] text-gray-400">Offer this agent to the public marketplace</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={newAgentSell}
                                        onChange={(e) => setNewAgentSell(e.target.checked)}
                                        className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                                    />
                                </div>
                                {newAgentSell && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Price (e.g. $10)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="$10"
                                            value={newAgentPrice}
                                            onChange={(e) => setNewAgentPrice(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-sm"
                            >
                                Construct Agent
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

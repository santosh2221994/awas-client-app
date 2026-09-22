import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, Bot, ChevronRight,
    PanelRightOpen, PanelRightClose, ShoppingBag,
    Star, X, GitBranch
} from 'lucide-react';
import { listAgents } from '../../api/services/agentService';
import { listWorkflows, saveWorkflow, deleteWorkflow } from '../../api/services/workflowService';
import { useUIStore } from '../../stores/useUIStore';
import Button from '../../components/Button';
import AgentChatPanel from '../chat-sidebar/AgentChatPanel';

export default function CrewStudioDashboard() {
    const { setSelectedCrewAgentId, isRightPanelOpen, toggleRightPanel } = useUIStore();
    const [chatAgent, setChatAgent] = useState(null);

    const [agents, setAgents] = useState([]);
    const [query, setQuery] = useState('');
    const [mSearch, setMSearch] = useState('');
    const [mCategory, setMCategory] = useState('All');
    const [mLoading, setMLoading] = useState(true);
    const [mError, setMError] = useState(null);

    const [myListedAgents, setMyListedAgents] = useState(() => {
        const stored = localStorage.getItem('custom_agents');
        return stored ? JSON.parse(stored) : [];
    });

    const [workflows, setWorkflows] = useState([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(true);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [wfName, setWfName] = useState('');
    const [wfDesc, setWfDesc] = useState('');

    // Load workflows from MongoDB on mount
    useEffect(() => {
        listWorkflows()
            .then((data) => setWorkflows(Array.isArray(data) ? data : []))
            .catch(() => setWorkflows([]))
            .finally(() => setWorkflowsLoading(false));
    }, []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDesc, setNewAgentDesc] = useState('');
    const [newAgentType, setNewAgentType] = useState('Assistant');
    const [newAgentModel, setNewAgentModel] = useState('gpt-4o');
    const [newAgentSell, setNewAgentSell] = useState(false);
    const [newAgentPrice, setNewAgentPrice] = useState('');


    useEffect(() => {
        async function fetchAgentsList() {
            try {
                const data = await listAgents();
                setAgents(Array.isArray(data) ? data : []);
            } catch (err) {
                setMError(err.message || 'Unable to load marketplace agents.');
            } finally {
                setMLoading(false);
            }
        }
        fetchAgentsList();
    }, [myListedAgents]);

    const hasPricing = (agent) => {
        const p = agent.price;
        return p !== undefined && p !== null && p !== 'Free' && p !== '' && parseFloat(p?.toString().replace(/[^0-9.]/g, '')) > 0;
    };

    // Marketplace — agents WITH pricing
    const allMarketplaceAgents = agents.filter((agent) => {
        if (!hasPricing(agent)) return false;
        const q = mSearch.toLowerCase();
        const matches = agent.name?.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q);
        const matchesCat = mCategory === 'All' || (mCategory === 'Premium' && hasPricing(agent));
        return matches && matchesCat;
    });

    const handleCreateWorkflow = async (e) => {
        e.preventDefault();
        if (!wfName.trim()) return;
        const workflowId = `wf-${Date.now()}`;
        const newWf = {
            workflowId,
            id: workflowId,
            name: wfName,
            description: wfDesc || '',
            nodes: [],
            edges: [],
            createdAt: new Date().toISOString(),
        };
        // Persist to MongoDB first
        try {
            await saveWorkflow({ workflowId, name: wfName, description: wfDesc || '', nodes: [], edges: [] });
            
            // Optimistically update UI
            setWorkflows((prev) => [...prev, newWf]);
            setWfName('');
            setWfDesc('');
            setShowWorkflowModal(false);
            
            // Then navigate
            setSelectedCrewAgentId(workflowId);
        } catch (err) {
            console.warn('[CrewStudioDashboard] Failed to save workflow to DB', err);
        }
    };


    const handleCreateAgent = (e) => {
        e.preventDefault();
        if (!newAgentName.trim()) return;

        const price = newAgentSell
            ? (newAgentPrice.startsWith('$') ? newAgentPrice : `$${newAgentPrice}`)
            : 'Free';

        const systemInstructions = 
            `You are ${newAgentName}, an autonomous AI specialist configured as a ${newAgentType}.\n\n` +
            `Role & Mission:\n` +
            `${newAgentDesc || 'Execute assigned tasks with precision.'}\n\n` +
            `Behavior & Guidelines:\n` +
            `- Maintain concise, accurate communication.\n` +
            `- Follow workflow logic and output clear results.`;

        const newAgent = {
            id: `custom-${Date.now()}`,
            name: newAgentName,
            description: newAgentDesc,
            type: newAgentType,
            model: newAgentModel,
            instructions: systemInstructions,
            price,
            sellOnMarketplace: newAgentSell,
            rating: 5.0,
            category: newAgentType,
            tools: [],
        };

        const updatedAgents = [...myListedAgents, newAgent];
        try {
            localStorage.setItem('custom_agents', JSON.stringify(updatedAgents));
        } catch (err) {
            console.warn('[CrewStudioDashboard] Failed to persist new agent', err);
        }
        setMyListedAgents(updatedAgents);
        setNewAgentName('');
        setNewAgentDesc('');
        setNewAgentType('Assistant');
        setNewAgentModel('gpt-4o');
        setNewAgentSell(false);
        setNewAgentPrice('');
        setShowCreateModal(false);
    };


    return (
        <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto relative">
            <div className="max-w-6xl mx-auto px-8 py-8 space-y-10 pb-16">

                {/* Banner */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Crew Studio Workspace</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-1">Agent & Workflow Studio</h1>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Build autonomous agent flows or buy custom-built agents from the marketplace.</p>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Recent projects</h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Pick up where you left off or deploy new agent capabilities</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750"
                            onClick={() => { setNewAgentSell(true); setShowCreateModal(true); }}
                        >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                            Sell on Marketplace
                        </Button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400 dark:placeholder-slate-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleRightPanel}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all outline-none"
                                title={isRightPanelOpen ? 'Close panel' : 'Open tools & crew'}
                            >
                                {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Cards / Empty State */}
                    {workflows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 text-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                <GitBranch className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">No workflows yet</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs leading-relaxed">
                                    Create your first workflow to start building multi-agent pipelines on the canvas. Name it, describe it, and the AI will help you build it step by step.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <button
                                    onClick={() => setShowWorkflowModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create your first workflow
                                </button>
                            </div>
                            <div className="flex items-center gap-6 pt-2 border-t border-gray-100 dark:border-slate-800 w-full justify-center">
                                {[
                                    { step: '1', label: 'Name your workflow' },
                                    { step: '2', label: 'Chat with AI to build it' },
                                    { step: '3', label: 'Apply to canvas' },
                                ].map(({ step, label }) => (
                                    <div key={step} className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">{step}</span>
                                        <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {/* Create New */}
                            <div
                                onClick={() => setShowWorkflowModal(true)}
                                className="group cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-750 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center min-h-[175px] py-6 px-4 text-center transition-all duration-200 hover:shadow-xs flex-shrink-0 w-[350px]"
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Create New</h3>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 max-w-[150px]">Start fresh project or workflow canvas</p>
                            </div>

                            {/* Workflow Cards */}
                            {workflows.filter((wf) => {
                                const q = query.toLowerCase();
                                return wf.name?.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q);
                            }).map((wf) => (
                                <div
                                    key={wf.workflowId || wf.id}
                                    onClick={() => setSelectedCrewAgentId(wf.workflowId || wf.id)}
                                    className="group cursor-pointer border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] flex flex-col justify-between min-h-[175px] flex-shrink-0 w-[350px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/80"
                                >
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                                <GitBranch className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 border border-gray-200 dark:border-slate-700 rounded-full px-2 py-0.5 uppercase bg-gray-50 dark:bg-slate-800">Workflow</span>
                                        </div>
                                        <h3 className="text-sm font-bold mt-4 line-clamp-1 text-gray-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{wf.name}</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{wf.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3.5 mt-4">
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 select-none">{new Date(wf.createdAt).toLocaleDateString()}</span>
                                        <button className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                                            <span>Open</span>
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Marketplace */}
                <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">AI Agent Marketplace</h2>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Discover and use premade specialist agents</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search marketplace..."
                                    value={mSearch}
                                    onChange={(e) => setMSearch(e.target.value)}
                                    className="w-full text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 font-medium placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>
                            <div className="flex bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                {['All', 'Premium'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setMCategory(cat)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${mCategory === cat ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-xs' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mLoading && (
                            <div className="col-span-full border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center text-xs text-gray-500 dark:text-slate-400">
                                Loading marketplace...
                            </div>
                        )}
                        {mError && (
                            <div className="col-span-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 text-center text-sm text-red-700 dark:text-red-400">
                                {mError}
                            </div>
                        )}
                        {!mLoading && !mError && allMarketplaceAgents.length === 0 && (
                            <div className="col-span-full border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center text-xs text-gray-500 dark:text-slate-400">
                                No agents found in the marketplace.
                            </div>
                        )}
                        {!mLoading && !mError && allMarketplaceAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
                                onClick={() => setChatAgent(agent)}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border ${
                                            hasPricing(agent)
                                                ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800/60'
                                                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/60'
                                        }`}>
                                            {hasPricing(agent) ? agent.price : 'Free'}
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
                                        onClick={(e) => { e.stopPropagation(); setChatAgent(agent); }}
                                    >
                                        Chat with Agent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {chatAgent && (
                <div className="absolute top-0 right-0 h-full z-30 shadow-xl">
                    <AgentChatPanel agent={chatAgent} onClose={() => setChatAgent(null)} />
                </div>
            )}

            {/* Create Workflow Modal */}
            {showWorkflowModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleCreateWorkflow}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 dark:border-slate-800 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setShowWorkflowModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="pb-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Create Workflow</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Set up a new workflow canvas</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Workflow Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Content Pipeline"
                                    value={wfName}
                                    onChange={(e) => setWfName(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe what this workflow does..."
                                    value={wfDesc}
                                    onChange={(e) => setWfDesc(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowWorkflowModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-sm"
                            >
                                Create Workflow
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Create Agent Modal */}
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
                            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Create Crew Agent</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Configure your custom agent specifications & tools</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Agent Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Content Publisher Bot"
                                    value={newAgentName}
                                    onChange={(e) => setNewAgentName(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Description / Goal</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Define what instructions/tasks this agent executes..."
                                    value={newAgentDesc}
                                    onChange={(e) => setNewAgentDesc(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Specialty Domain</label>
                                    <select
                                        value={newAgentType}
                                        onChange={(e) => setNewAgentType(e.target.value)}
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">LLM Model</label>
                                    <select
                                        value={newAgentModel}
                                        onChange={(e) => setNewAgentModel(e.target.value)}
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="claude-3-opus">Claude 3 Opus</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                        <option value="llama-3">Llama 3</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800 dark:text-slate-200">List for sale on Marketplace</span>
                                        <span className="block text-[10px] text-gray-400 dark:text-slate-400">Offer this agent to the public marketplace</span>
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
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">Price (e.g. $10)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="$10"
                                            value={newAgentPrice}
                                            onChange={(e) => setNewAgentPrice(e.target.value)}
                                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-slate-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl transition"
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

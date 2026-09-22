import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, Bot, ChevronRight,
    PanelRightOpen, PanelRightClose, ShoppingBag,
    Star, X, GitBranch, Sparkles, Globe, FileText,
    MessageSquare, Terminal, Zap, ArrowRight, Layers
} from 'lucide-react';
import { listAgents } from '../../api/services/agentService';
import { listWorkflows, saveWorkflow, deleteWorkflow } from '../../api/services/workflowService';
import { useUIStore } from '../../stores/useUIStore';
import { useSessionStore } from '../../stores/useSessionStore';
import Button from '../../components/Button';
import AgentChatPanel from '../chat-sidebar/AgentChatPanel';

export default function CrewStudioDashboard() {
    const { setSelectedCrewAgentId, isRightPanelOpen, toggleRightPanel, selectedCrewAgentId } = useUIStore();
    const [chatAgent, setChatAgent] = useState(null);

    const [agents, setAgents] = useState([]);
    const [query, setQuery] = useState('');
    const [mSearch, setMSearch] = useState('');
    const [mCategory, setMCategory] = useState('All');
    const [mLoading, setMLoading] = useState(true);
    const [mError, setMError] = useState(null);

    const [myListedAgents, setMyListedAgents] = useState(() => {
        try {
            const stored = localStorage.getItem('custom_agents');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [workflows, setWorkflows] = useState([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(true);
    const [workflowsError, setWorkflowsError] = useState(null);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [wfName, setWfName] = useState('');
    const [wfDesc, setWfDesc] = useState('');

    // Load workflows from MongoDB — runs on mount and whenever we navigate back to the dashboard
    const fetchWorkflows = useCallback(() => {
        setWorkflowsLoading(true);
        setWorkflowsError(null);
        listWorkflows()
            .then((data) => setWorkflows(Array.isArray(data) ? data : []))
            .catch((err) => {
                if (err?.status === 401) {
                    useSessionStore.getState().logout();
                } else {
                    setWorkflowsError('Failed to load workflows. Please try again.');
                }
                setWorkflows([]);
            })
            .finally(() => setWorkflowsLoading(false));
    }, []);

    // Re-fetch whenever the dashboard becomes visible:
    // 1. On first mount
    // 2. When user navigates back from canvas (selectedCrewAgentId becomes null)
    useEffect(() => {
        if (selectedCrewAgentId === null) {
            fetchWorkflows();
        }
    }, [selectedCrewAgentId, fetchWorkflows]);

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
        try {
            // Save to DB and use the actual returned document
            const saved = await saveWorkflow({
                workflowId,
                name: wfName,
                description: wfDesc || '',
                nodes: [],
                edges: [],
            });
            // Use DB response so id/createdAt/updatedAt are accurate
            const newWf = saved || {
                workflowId,
                id: workflowId,
                name: wfName,
                description: wfDesc || '',
                nodes: [],
                edges: [],
                createdAt: new Date().toISOString(),
            };
            setWorkflows((prev) => [newWf, ...prev]);
            setWfName('');
            setWfDesc('');
            setShowWorkflowModal(false);
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
        <div className="flex-1 bg-slate-50/50 overflow-y-auto relative">
            <div className="max-w-6xl mx-auto px-8 py-8 space-y-10 pb-16">



                {/* Recent Projects */}
                <div className="space-y-5">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">My Workflows</h2>
                                {!workflowsLoading && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        {workflows.length} {workflows.length === 1 ? 'workflow' : 'workflows'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">All workflows stored in your account — pick up where you left off</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowWorkflowModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Workflow
                            </button>
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
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workflows..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchWorkflows}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all outline-none"
                                title="Refresh workflows"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={toggleRightPanel}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all outline-none"
                                title={isRightPanelOpen ? 'Close panel' : 'Open tools & crew'}
                            >
                                {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* First-time guided steps — rendered ABOVE the Create Workflow grid */}
                    {!workflowsLoading && !workflowsError && workflows.length === 0 && (
                        <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 border border-indigo-100/90 rounded-2xl p-5 shadow-xs mb-4 space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-800">Workflow Launch Guide</span>
                                </div>
                                <span className="text-[11px] font-semibold text-gray-500">Follow these 3 easy steps to build your first AI crew</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                                {[
                                    {
                                        step: '1',
                                        title: 'Name your workflow',
                                        desc: 'Click "Create New Workflow" below and enter a title for your project.',
                                        icon: Sparkles,
                                        badgeBg: 'bg-indigo-600 text-white shadow-indigo-200'
                                    },
                                    {
                                        step: '2',
                                        title: 'Chat with AI to build it',
                                        desc: 'Use natural language with AI Co-Pilot to configure agents & tools.',
                                        icon: MessageSquare,
                                        badgeBg: 'bg-purple-600 text-white shadow-purple-200'
                                    },
                                    {
                                        step: '3',
                                        title: 'Apply to canvas',
                                        desc: 'Watch your nodes auto-render on the interactive canvas & run live.',
                                        icon: GitBranch,
                                        badgeBg: 'bg-emerald-600 text-white shadow-emerald-200'
                                    }
                                ].map((item, idx) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div key={item.step} className="bg-white/90 backdrop-blur-xs border border-indigo-100/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative group">
                                            <div>
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <div className={`w-7 h-7 rounded-lg ${item.badgeBg} flex items-center justify-center text-xs font-black shadow-xs`}>
                                                        {item.step}
                                                    </div>
                                                    <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                                                        <IconComponent className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-extrabold text-gray-800 tracking-tight">{item.title}</h4>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                            </div>

                                            {idx < 2 && (
                                                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-indigo-100 text-indigo-500 rounded-full p-1 shadow-2xs">
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Loading skeletons */}
                    {workflowsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border border-gray-200 rounded-2xl p-5 min-h-[175px] bg-white animate-pulse">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                                    <div className="h-2.5 bg-gray-100 rounded w-full mb-1.5" />
                                    <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                                </div>
                            ))}
                        </div>
                    ) : workflowsError ? (
                        <div className="flex flex-col items-center justify-center py-10 px-6 border border-red-200 bg-red-50 rounded-2xl text-center gap-3">
                            <p className="text-xs text-red-600 font-semibold">{workflowsError}</p>
                            <button onClick={fetchWorkflows} className="text-xs font-bold text-red-600 underline">Retry</button>
                        </div>
                    ) : workflows.length === 0 ? (
                        /* Centered Create Workflow Card for Zero Workflows */
                        <div
                            onClick={() => setShowWorkflowModal(true)}
                            className="group cursor-pointer border-2 border-dashed border-indigo-200 bg-white hover:border-indigo-400 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-md hover:bg-indigo-50/30 max-w-xl mx-auto my-4 space-y-3"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-2xs">
                                <Plus className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">Create New Workflow</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm">Start a fresh interactive canvas or prompt AI Co-Pilot in the sidebar.</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowWorkflowModal(true); }}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 mt-2"
                            >
                                <Plus className="w-4 h-4" />
                                Start Fresh Canvas
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Always-visible Create New card in grid */}
                            <div
                                onClick={() => setShowWorkflowModal(true)}
                                className="group cursor-pointer border-2 border-dashed border-gray-300 bg-white hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center min-h-[175px] py-6 px-4 text-center transition-all duration-200 hover:shadow-sm hover:bg-indigo-50/30"
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-700 mt-3 group-hover:text-indigo-600">Create New Workflow</h3>
                                <p className="text-[11px] text-gray-400 mt-1">Start a fresh canvas</p>
                            </div>

                            {/* All workflow cards — filtered by search */}
                            {workflows
                                .filter((wf) => {
                                    const q = query.toLowerCase();
                                    return !q || wf.name?.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q);
                                })
                                .map((wf) => (
                                    <div
                                        key={wf.workflowId || wf.id}
                                        onClick={() => setSelectedCrewAgentId(wf.workflowId || wf.id)}
                                        className="group cursor-pointer border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[175px] bg-white border-gray-200 hover:border-indigo-300"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                    <GitBranch className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 uppercase bg-gray-50">Workflow</span>
                                            </div>
                                            <h3 className="text-sm font-bold mt-4 line-clamp-1 text-gray-800 group-hover:text-indigo-600 transition-colors">{wf.name}</h3>
                                            <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{wf.description || 'No description provided.'}</p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mt-4">
                                            <span className="text-[10px] text-gray-400 select-none">
                                                {wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                            <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-0.5">
                                                Open
                                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }

                            {/* No results from search */}
                            {workflows.length > 0 && query && workflows.filter((wf) => {
                                const q = query.toLowerCase();
                                return wf.name?.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q);
                            }).length === 0 && (
                                <div className="col-span-full py-8 text-center text-xs text-gray-400">
                                    No workflows match &ldquo;{query}&rdquo;
                                </div>
                            )}
                        </div>
                    )}
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
                                className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
                                onClick={() => setChatAgent(agent)}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border ${
                                            hasPricing(agent)
                                                ? 'text-indigo-700 bg-indigo-50 border-indigo-100'
                                                : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                        }`}>
                                            {hasPricing(agent) ? agent.price : 'Free'}
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
                        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setShowWorkflowModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="pb-4">
                            <h3 className="text-base font-bold text-gray-900">Create Workflow</h3>
                            <p className="text-xs text-gray-500 mt-1">Set up a new workflow canvas</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Workflow Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Content Pipeline"
                                    value={wfName}
                                    onChange={(e) => setWfName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe what this workflow does..."
                                    value={wfDesc}
                                    onChange={(e) => setWfDesc(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowWorkflowModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
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

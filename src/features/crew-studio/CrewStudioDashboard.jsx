import React, { useEffect, useState } from 'react';
import { Search, Plus, Bot, ChevronRight, SlidersHorizontal, PanelRightOpen, PanelRightClose } from 'lucide-react';
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
        const matchesQuery = (
            agent.name?.toLowerCase().includes(query.toLowerCase()) ||
            agent.description?.toLowerCase().includes(query.toLowerCase())
        );

        if (activeTab === 'Mine') {
            // Simulate "Mine" tab showing specific agents
            return matchesQuery && agent.id !== 'agent-2';
        }
        if (activeTab === 'Shared with me') {
            // Simulate "Shared with me" tab
            return matchesQuery && agent.id === 'agent-2';
        }
        return matchesQuery;
    });

    return (
        <div className="flex-1 bg-slate-50/50 overflow-y-auto">
            {/* Outer wrapper */}
            <div className="max-w-6xl mx-auto px-8 py-8 space-y-10 selection:bg-indigo-100">


                {/* Recent Projects Section */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent projects</h2>
                        <p className="text-xs text-gray-500">Pick up where you left off or start something new</p>
                    </div>

                    {/* Action and filter bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="!py-2 !px-3 font-semibold text-xs border-gray-250 hover:bg-gray-50 text-gray-700 bg-white shadow-none"
                            >
                                <SlidersHorizontal className="w-3 h-3 text-gray-500" />
                                Select
                            </Button>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Tab Filters */}
                            <div className="flex bg-gray-200/65 p-0.5 rounded-lg border border-gray-200">
                                {['All', 'Mine', 'Shared with me'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${activeTab === tab
                                            ? 'bg-white text-gray-800 shadow-xs'
                                            : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Projects Dropdown */}
                            <select className="border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer">
                                <option>All Projects</option>
                                <option>Active Tasks</option>
                                <option>Drafts</option>
                            </select>

                            <button
                                onClick={toggleRightPanel}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all outline-none"
                                title={isRightPanelOpen ? "Close panel" : "Open tools & crew"}
                            >
                                {isRightPanelOpen ? (
                                    <PanelRightClose className="w-4 h-4" />
                                ) : (
                                    <PanelRightOpen className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Cards Flex Row */}
                    <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                        {/* Create New Card */}
                        <div
                            onClick={() => setSelectedCrewAgentId('agent-1')} // default to first agent or new flow
                            className="group cursor-pointer border-2 border-dashed border-gray-300 bg-white hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center min-h-[175px] py-6 px-4 text-center transition-all duration-200 hover:shadow-xs flex-shrink-0 w-[350px]"
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-150 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-800 mt-3 group-hover:text-indigo-600">Create New</h3>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-[150px]">Start fresh project or workflow canvas</p>
                        </div>

                        {/* Loading / Error States */}
                        {loading && (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-12 bg-white text-center text-xs text-gray-500 w-[350px] flex-shrink-0 flex items-center justify-center min-h-[175px]">
                                Loading agents list...
                            </div>
                        )}
                        {error && (
                            <div className="border border-red-100 rounded-2xl p-8 bg-red-50 text-center text-xs text-red-650 font-medium w-[350px] flex-shrink-0 flex items-center justify-center min-h-[175px]">
                                {error}
                            </div>
                        )}

                        {/* Agent Cards */}
                        {!loading && !error && filteredAgents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedCrewAgentId(agent.id)}
                                className="group cursor-pointer border border-gray-200 bg-white rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-indigo-200 hover:translate-y-[-2px] flex flex-col justify-between min-h-[175px] flex-shrink-0 w-[350px]"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 border border-gray-150 rounded-full px-2 py-0.5 uppercase bg-gray-50">
                                            {agent.type || 'Agent'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 mt-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {agent.name}
                                    </h3>
                                    <p className="text-[11px] text-gray-550 mt-1.5 line-clamp-2 leading-relaxed">
                                        {agent.description || 'No description provided. Click to configure this agent and its workflow.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-50 pt-3.5 mt-4">
                                    <span className="text-[10px] text-gray-400 select-none">
                                        Modified {agent.id === 'agent-1' ? '17 days ago' : '2 months ago'}
                                    </span>
                                    <button
                                        className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors flex items-center gap-0.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCrewAgentId(agent.id);
                                        }}
                                    >
                                        <span>Edit</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Empty Search State */}
                        {!loading && !error && filteredAgents.length === 0 && (
                            <div className="border border-gray-200 rounded-2xl p-12 bg-white text-center text-xs text-gray-450 italic w-[350px] flex-shrink-0 flex items-center justify-center min-h-[175px]">
                                No matching agents found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

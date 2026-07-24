import React, { useState } from 'react';
import { Search, Plus, Globe, PowerOff, Check, Wrench, RefreshCw } from 'lucide-react';
import { toolCategories } from '../../mocks/tools';
import Button from '../../components/Button';

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState('Connections');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Hardcoded Connections data based on Image 3
    const [connections, setConnections] = useState([
        { id: 'asana', name: 'Asana', count: 12, type: 'Agent App', status: 'Not Configured', creator: 'Asana', iconColor: 'bg-orange-100 text-orange-600 font-bold' },
        { id: 'box', name: 'Box', count: 10, type: 'Agent App', status: 'Not Configured', creator: 'Box', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
        { id: 'clickup', name: 'ClickUp', count: 11, type: 'Agent App', status: 'Not Configured', creator: 'ClickUp', iconColor: 'bg-purple-100 text-purple-600 font-bold' },
        { id: 'confluence', name: 'Confluence', count: 10, type: 'Agent App', status: 'Not Configured', creator: 'Confluence', iconColor: 'bg-sky-100 text-sky-600 font-bold' },
        { id: 'databricks', name: 'Databricks', count: 0, type: 'MCP', status: 'Not Configured', creator: 'Databricks', iconColor: 'bg-red-100 text-red-650 font-bold' },
        { id: 'github', name: 'GitHub', count: 13, type: 'Agent App', status: 'Not Configured', creator: 'Git Hub', iconColor: 'bg-zinc-800 text-white font-bold' },
        { id: 'google-calendar', name: 'Google calendar', count: 6, type: 'Agent App', status: 'Not Configured', creator: 'Google Calendar', iconColor: 'bg-blue-50 text-blue-500 font-bold' },
        { id: 'google-contacts', name: 'Google contacts', count: 16, type: 'Agent App', status: 'Not Configured', creator: 'Google Contacts', iconColor: 'bg-green-150 text-green-700 font-bold' },
        { id: 'google-docs', name: 'Google docs', count: 33, type: 'Agent App', status: 'Not Configured', creator: 'Google Docs', iconColor: 'bg-blue-100 text-blue-600 font-bold' },
    ]);

    const [integrations] = useState([
        { id: 'openai', name: 'OpenAI API', status: 'Active', category: 'LLM Provider', description: 'Enable GPT-4o, GPT-4, and GPT-3.5 models.' },
        { id: 'gemini', name: 'Google Gemini', status: 'Active', category: 'LLM Provider', description: 'Enable Gemini 1.5 Flash & Pro models.' },
        { id: 'anthropic', name: 'Anthropic Claude', status: 'Inactive', category: 'LLM Provider', description: 'Enable Claude 3.5 Sonnet & Opus models.' },
        { id: 'mastra', name: 'Mastra Engine', status: 'Active', category: 'Backend Host', description: 'Power agent state, tools, and background evaluations.' },
    ]);

    const handleToggleConnect = (id) => {
        setConnections(prev => prev.map(conn => {
            if (conn.id === id) {
                const nextStatus = conn.status === 'Not Configured' ? 'Configured' : 'Not Configured';
                return { ...conn, status: nextStatus };
            }
            return conn;
        }));
    };

    const filteredConnections = connections.filter(conn => {
        const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conn.creator.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'All' || conn.type === typeFilter;
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Configured' && conn.status === 'Configured') ||
            (statusFilter === 'Not Configured' && conn.status === 'Not Configured');

        return matchesSearch && matchesType && matchesStatus;
    });

    // Extract internal tools list from categories
    const allInternalTools = toolCategories.flatMap(cat =>
        cat.tools.map(t => ({ ...t, categoryName: cat.category }))
    );

    const filteredInternalTools = allInternalTools.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200/80 px-8 py-6">
                <div className="max-w-6xl mx-auto space-y-1">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tools & Integrations</h1>
                    <p className="text-xs text-gray-500">Manage apps, internal tools, and integrations for your CrewAI agents</p>
                </div>
            </div>

            {/* Tabs list */}
            <div className="bg-white border-b border-gray-200/80 px-8">
                <div className="max-w-6xl mx-auto flex gap-6">
                    {['Connections', 'Internal Tools', 'Integrations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSearchQuery('');
                            }}
                            className={`px-0 py-3.5 text-xs font-semibold border-b-2 transition ${activeTab === tab
                                ? 'text-indigo-650 border-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-8 py-6">
                {activeTab === 'Connections' && (
                    <div className="space-y-6">

                        {/* Top description card */}
                        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Connections</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Manage your agent apps and MCP server connections.</p>
                                </div>
                            </div>
                            <Button variant="brand" size="sm" className="whitespace-nowrap font-semibold gap-1.5 shadow-none pb-2 pt-2.5">
                                <Plus className="w-3.5 h-3.5" />
                                Add Connection
                            </Button>
                        </div>

                        {/* Filter controls row */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center py-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search connections..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-405"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer"
                                >
                                    <option value="All">Type: All</option>
                                    <option value="Agent App">Agent App</option>
                                    <option value="MCP">MCP</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-250 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-650 outline-none hover:bg-gray-50 cursor-pointer"
                                >
                                    <option value="All">Status: All</option>
                                    <option value="Configured">Configured</option>
                                    <option value="Not Configured">Not Configured</option>
                                </select>
                            </div>
                        </div>

                        {/* Table layout */}
                        <div className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-xs">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-150 bg-slate-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        <th className="px-6 py-3.5">Applications</th>
                                        <th className="px-6 py-3.5">Visibility</th>
                                        <th className="px-6 py-3.5">Type</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Created by</th>
                                        <th className="px-6 py-3.5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {filteredConnections.map((conn) => (
                                        <tr key={conn.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4.5 font-bold text-gray-900 flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${conn.iconColor} shadow-3xs border border-gray-200/40 text-xs`}>
                                                    {conn.name?.charAt(0)}
                                                </div>
                                                <span>
                                                    {conn.name} {conn.count > 0 && <span className="font-medium text-gray-400 text-[11px] ml-1">({conn.count})</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                {conn.type === 'Agent App' ? (
                                                    <select className="border border-transparent hover:border-gray-200 bg-transparent rounded-md px-1.5 py-0.5 text-xs text-gray-500 font-semibold cursor-pointer outline-none">
                                                        <option>All</option>
                                                        <option>Private</option>
                                                    </select>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${conn.type === 'MCP'
                                                    ? 'bg-purple-55 bg-purple-100/60 text-purple-600 border border-purple-200/40'
                                                    : 'bg-pink-100/60 text-pink-600 border border-pink-200/40'
                                                    }`}>
                                                    {conn.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${conn.status === 'Configured'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-gray-100 text-gray-500 border border-gray-150'
                                                    }`}>
                                                    {conn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5 text-gray-500 font-medium">{conn.creator}</td>
                                            <td className="px-6 py-4.5 text-center">
                                                {conn.type === 'Agent App' && (
                                                    <button
                                                        onClick={() => handleToggleConnect(conn.id)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${conn.status === 'Configured'
                                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100/60'
                                                            : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {conn.status === 'Configured' ? (
                                                            <>
                                                                <PowerOff className="w-3 h-3" />
                                                                Disconnect
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-3 h-3" />
                                                                Connect
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredConnections.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-gray-450 italic">
                                                No connections matches query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Internal Tools' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                                    <Wrench className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Internal Tools</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Custom tools registered locally inside this workspace directory.</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="whitespace-nowrap font-semibold gap-1.5 border-gray-250 hover:bg-gray-50 text-gray-700 bg-white">
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reload Directory
                            </Button>
                        </div>

                        {/* Internal search */}
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search internal tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-405"
                            />
                        </div>

                        {/* List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredInternalTools.map((tool) => (
                                <div key={tool.id} className="border border-gray-200 bg-white rounded-2xl p-5 shadow-3xs flex flex-col justify-between min-h-[120px]">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-bold text-gray-950">{tool.name}</h4>
                                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-655 border border-slate-205">
                                                {tool.categoryName}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tool.description}</p>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span>ID: <code className="font-mono text-[9.5px] bg-slate-50 px-1 py-0.5 rounded border border-gray-100">{tool.id}</code></span>
                                        <span className="text-emerald-500 font-semibold flex items-center gap-0.5">● Ready</span>
                                    </div>
                                </div>
                            ))}
                            {filteredInternalTools.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl italic">
                                    No internal tools found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Integrations' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-none">
                            {integrations.map((integ) => (
                                <div key={integ.id} className="border border-gray-200 bg-white rounded-2xl p-5 shadow-3xs flex justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-950">{integ.name}</h4>
                                            <span className="text-[10px] font-semibold text-gray-400">{integ.category}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{integ.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between min-h-[75px] shrink-0">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${integ.status === 'Active'
                                            ? 'bg-emerald-950/10 text-emerald-600 border border-emerald-900/10'
                                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                                            }`}>
                                            {integ.status}
                                        </span>
                                        <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition">
                                            Configure
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

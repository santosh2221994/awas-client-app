import React, { useState } from 'react';
import { ExternalLink, Search, Code, FileText, MessageCircle, Video, Star, ChevronRight, BookOpen, Zap } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'guide', label: 'Guides' },
  { id: 'api', label: 'API Reference' },
  { id: 'tutorial', label: 'Tutorials' },
  { id: 'community', label: 'Community' },
];

const RESOURCES = [
  {
    id: 'r-1',
    title: 'Quickstart: Build Your First Automation',
    description: 'Step-by-step guide to creating your first agentic workflow automation in under 10 minutes.',
    category: 'guide',
    type: 'Article',
    icon: FileText,
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 'r-2',
    title: 'AWAS REST API Reference',
    description: 'Complete reference for all API endpoints, authentication, rate limits, and response formats.',
    category: 'api',
    type: 'Reference',
    icon: Code,
    readTime: 'Reference',
    featured: true,
  },
  {
    id: 'r-3',
    title: 'Understanding LLM Connections',
    description: 'How to configure and manage multiple LLM providers, set routing priorities, and handle fallbacks.',
    category: 'guide',
    type: 'Article',
    icon: FileText,
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 'r-4',
    title: 'Tracing & Debugging Agent Runs',
    description: 'Use the Traces dashboard to inspect step-by-step execution, token counts, and identify bottlenecks.',
    category: 'tutorial',
    type: 'Tutorial',
    icon: Video,
    readTime: '12 min watch',
    featured: false,
  },
  {
    id: 'r-5',
    title: 'Environment Variables Best Practices',
    description: 'Secure patterns for managing secrets, scoping variables to environments, and rotating API keys.',
    category: 'guide',
    type: 'Article',
    icon: FileText,
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 'r-6',
    title: 'Community Forum',
    description: 'Connect with other AWAS builders, ask questions, and share your automation templates.',
    category: 'community',
    type: 'Community',
    icon: MessageCircle,
    readTime: 'Community',
    featured: false,
  },
  {
    id: 'r-7',
    title: 'CrewAI + AWAS Integration Tutorial',
    description: 'Learn how to connect your CrewAI agents to AWAS automations and orchestrate multi-agent pipelines.',
    category: 'tutorial',
    type: 'Tutorial',
    icon: Video,
    readTime: '20 min watch',
    featured: true,
  },
  {
    id: 'r-8',
    title: 'Webhook Triggers in Depth',
    description: 'Configure webhook trigger automations, validate payloads, and map dynamic data to your workflows.',
    category: 'guide',
    type: 'Article',
    icon: FileText,
    readTime: '7 min read',
    featured: false,
  },
];

const TYPE_STYLES = {
  Article: 'bg-blue-100/60 text-blue-700',
  Reference: 'bg-purple-100/60 text-purple-700',
  Tutorial: 'bg-emerald-100/60 text-emerald-700',
  Community: 'bg-orange-100/60 text-orange-700',
};

const QUICK_LINKS = [
  { label: 'Changelog', icon: Zap, desc: 'Latest product updates' },
  { label: 'Status Page', icon: Star, desc: 'System & API status' },
  { label: 'Discord Community', icon: MessageCircle, desc: 'Join 4K+ builders' },
  { label: 'GitHub', icon: Code, desc: 'Open source examples' },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = RESOURCES.filter((r) => {
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = filtered.filter(r => r.featured);
  const regular = filtered.filter(r => !r.featured);

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Resources</h1>
          <p className="text-xs text-gray-500">Documentation, tutorials, and community links to help you build faster</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200/80 px-8">
        <div className="max-w-6xl mx-auto flex gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-0 py-3.5 text-xs font-semibold border-b-2 transition ${activeCategory === cat.id
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-900'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-8">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search docs, guides, tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-gray-250 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-gray-400"
          />
        </div>

        {/* Quick Links */}
        {activeCategory === 'all' && !searchQuery && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Links</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    className="flex flex-col items-start gap-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group text-left"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{link.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Resources */}
        {featured.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Featured</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    className="flex flex-col gap-3 p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${TYPE_STYLES[r.type]}`}>
                        {r.type}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{r.title}</h3>
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{r.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400">{r.readTime}</span>
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                        Open <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Resources */}
        {regular.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">{featured.length > 0 ? 'More Resources' : 'Resources'}</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden divide-y divide-gray-100">
              {regular.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-slate-50/30 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {r.title}
                        </h4>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${TYPE_STYLES[r.type]}`}>
                          {r.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{r.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <span className="text-[11px] text-gray-400">{r.readTime}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No resources found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

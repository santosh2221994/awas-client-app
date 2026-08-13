import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Circle, Upload, Mic, Send, ChevronDown, ChevronRight, MessageSquare, RefreshCw, Info, Share2, ArrowUp, Link2, Clock, Copy, MoreHorizontal, Terminal, Settings, Brain, Zap } from 'lucide-react';
import { getAgentById, generateAgentResponse, streamAgentGenerate, getAgentThreads, getThreadMessages, getLogs } from '../../api/services/agentService';
import Button from '../../components/Button';
import { useUIStore } from '../../stores/useUIStore';

const tabs = ['Chat', 'Editor', 'Evaluate', 'Review', 'Traces', 'Context'];
const rightPanelTabs = ['Overview', 'Model Settings', 'Memory', 'Traces'];

function CollapsibleSection({ title, count, children, defaultOpen = true, icon: Icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden transition">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-zinc-650 hover:bg-zinc-50 transition"
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
          <span className="text-zinc-800 font-semibold">{title}</span>
        </span>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full select-none">
              {count}
            </span>
          )}
          {open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </button>
      {open && <div className="border-t border-zinc-150 bg-zinc-50/20 px-1 py-1">{children}</div>}
    </div>
  );
}

function ModelStatusPill({ status, usage, timestamp }) {
  if (!status && !usage) return null;

  const totalTokens = usage ? (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0) : null;
  const displayDuration = usage?.duration;

  return (
    <div className="flex items-center gap-2 mt-1.5 px-1 select-none">
      {/* Model Status */}
      {status === 'thinking' && (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
          <Brain className="w-3 h-3 text-indigo-400 animate-pulse" />
          Thinking...
        </span>
      )}
      {status === 'generating' && (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Generating...
        </span>
      )}
      {status === 'generated' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
          ✓ Generated
        </span>
      )}

      {/* Token Usage */}
      {totalTokens !== null && (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600">
          <Zap className="w-3 h-3 text-amber-500" />
          {totalTokens.toLocaleString()} tokens
        </span>
      )}

      {displayDuration ? (
        <span className="text-[10px] text-zinc-500 font-mono ml-1">
          {displayDuration}
        </span>
      ) : (
        timestamp && (
          <span className="text-[10px] text-zinc-500 font-mono ml-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      )}

      {usage && (
        <span className="text-[10px] font-mono ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 select-none">
          <span className="text-indigo-500">Input: {(usage.promptTokens ?? 0).toLocaleString()}</span>
          <span className="text-gray-400">/</span>
          <span className="text-emerald-500">Output: {(usage.completionTokens ?? 0).toLocaleString()}</span>
        </span>
      )}
    </div>
  );
}

function DarkReasoningPanel({ isThinking = false, reasoning = '' }) {
  const [open, setOpen] = useState(true);
  if (!isThinking && !reasoning) return null;
  return (
    <div className="mb-2 rounded-xl border border-indigo-900/40 bg-zinc-900/80 overflow-hidden text-xs max-w-[80%]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-zinc-400 hover:bg-zinc-800/40 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-semibold text-indigo-300 flex-1 text-left">
          {isThinking ? 'Thinking...' : 'Reasoning'}
        </span>
        {isThinking ? (
          <span className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        ) : (
          open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 text-zinc-400 border-t border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
          {reasoning || 'Processing your request...'}
        </div>
      )}
    </div>
  );
}

function AgentEditor({
  agent,
  versions = [],
  activeVersionId,
  setActiveVersionId,
  onSaveNewVersion,
  onPublishVersion,
  instructions,
  onChangeInstructions
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeVersion = versions.find((v) => v.id === activeVersionId);

  const variables = [
    { name: 'user-id', type: 'string' },
    { name: 'user-tier', type: 'string' },
    { name: 'tenant-id', type: 'string' },
    { name: 'locale', type: 'string' },
    { name: 'temperature-unit', type: 'string' },
    { name: 'allow-commands', type: 'string' },
  ];

  const tools = agent?.tools || [];
  const workspaceTools = agent?.workspaceTools || [];
  const browserTools = agent?.browserTools || [];
  const allTools = [
    ...tools.map((t) => ({ name: t.name || t.id, tag: 'tool' })),
    ...workspaceTools.map((name) => ({ name, tag: 'workspace' })),
    ...browserTools.map((name) => ({ name, tag: 'browser' })),
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pr-3">
        {/* Version Info Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 relative">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-zinc-400" />

            {/* Version Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition focus:outline-none"
              >
                <span>{activeVersion?.name || activeVersionId} - {activeVersion?.timestamp}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-zinc-200 shadow-2xl z-55 overflow-hidden divide-y divide-zinc-100">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Versions History
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {versions.map((ver) => (
                      <button
                        key={ver.id}
                        onClick={() => {
                          setActiveVersionId(ver.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between hover:bg-zinc-50 ${ver.id === activeVersionId
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                      >
                        <div className="flex flex-col gap-0.5 animate-none">
                          <span className="font-semibold">{ver.name}</span>
                          <span className="text-[10px] text-zinc-400">{ver.timestamp}</span>
                        </div>
                        {ver.published && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Copy Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeVersionId);
                alert(`Version ID '${activeVersionId}' copied to clipboard!`);
              }}
              className="p-1.5 rounded-md hover:bg-zinc-50 text-zinc-550 hover:text-zinc-800 transition"
              title="Copy version ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Status Indicator Badge */}
            <span className={`w-1.5 h-1.5 rounded-full ${activeVersion?.published ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${activeVersion?.published
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-extrabold text-[9px]'
              : 'bg-blue-50 text-blue-700 border border-blue-200/50 font-extrabold text-[9px]'
              }`}>
              {activeVersion?.published ? 'Published' : 'Unpublished'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-md hover:bg-zinc-50 border border-transparent hover:border-zinc-200 text-zinc-500 hover:text-zinc-800 transition" title="Duplicate version">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-zinc-50 border border-transparent hover:border-zinc-200 text-zinc-500 hover:text-zinc-800 transition" title="More options">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info description */}
        <p className="text-xs text-zinc-500 leading-relaxed text-[11px]">
          Edit your agent's system prompt, tools, and variables below.
        </p>

        {/* Collapsible parts */}
        <div className="space-y-3.5 pt-1">
          {/* Variables Collapsible */}
          <CollapsibleSection title="Variables" count={variables.length} icon={Settings} defaultOpen={false}>
            <div className="divide-y divide-zinc-100 text-xs bg-white">
              {variables.map((v) => (
                <div key={v.name} className="flex items-center justify-between px-3 py-2.5 font-medium hover:bg-zinc-50 transition">
                  <span className="text-zinc-650 font-mono">{v.name}</span>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">{v.type}</span>
                </div>
              ))}
              <div className="px-3 py-2.5 text-[10px] text-zinc-400 italic">Defined via requestContextSchema in code.</div>
            </div>
          </CollapsibleSection>

          {/* System Prompt Collapsible */}
          <CollapsibleSection title="System Prompt" icon={Terminal}>
            <div className="p-3 bg-white">
              <textarea
                value={instructions}
                onChange={(e) => onChangeInstructions(e.target.value)}
                placeholder="Add instruction blocks to your agent. Blocks are combined in order to form the system prompt."
                rows={10}
                className="w-full bg-transparent text-xs text-zinc-700 placeholder-zinc-400 outline-none resize-none leading-relaxed min-h-[160px]"
              />
            </div>
          </CollapsibleSection>

          {/* Tools Collapsible */}
          <CollapsibleSection title="Tools" count={allTools.length} icon={Settings} defaultOpen={false}>
            {allTools.length === 0 ? (
              <div className="px-3 py-4 text-xs text-zinc-450 italic select-none">No tools configured.</div>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs bg-white">
                {allTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 transition">
                    <span className="text-zinc-650 font-mono">{tool.name}</span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full uppercase">{tool.tag}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-zinc-100 px-3 py-2.5 flex justify-end bg-white">
              <button className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition">
                <Plus className="w-3.5 h-3.5" /> Add Tools
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Control Footer */}
      <div className="border-t border-zinc-200 bg-white px-6 py-4 flex items-center justify-between select-none">
        <button
          onClick={onSaveNewVersion}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 transition"
        >
          Save New Version <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </button>
        <button
          onClick={onPublishVersion}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeVersion?.published
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 pointer-events-none opacity-80'
            : 'bg-emerald-600 text-white hover:bg-emerald-750'
            }`}
        >
          {activeVersion?.published ? 'Published' : 'Publish'}
        </button>
      </div>
    </div>
  );
}

function EvaluateTab({ agentId }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-800 mb-1">Evaluation</div>
        <p className="text-xs text-zinc-550">
          The Mastra evaluation API is not available for this agent. Evaluations are run via the Mastra CLI or SDK using <code className="bg-zinc-100 px-1 rounded text-zinc-700">mastra eval run</code>.
        </p>
      </div>
    </div>
  );
}

function ReviewTab({ agentId }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAgentThreads(agentId)
      .then(setThreads)
      .finally(() => setLoading(false));
  }, [agentId]);

  const selectThread = useCallback(async (thread) => {
    setSelectedThread(thread);
    setMsgLoading(true);
    try {
      const msgs = await getThreadMessages(thread.id);
      setMessages(msgs);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  if (loading) return <div className="text-sm text-gray-500 p-4">Loading threads...</div>;

  return (
    <div className="flex h-full gap-4">
      <div className="w-64 shrink-0 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-400 uppercase mb-2">Conversation Threads</div>
        {threads.length === 0 && <div className="text-xs text-zinc-500">No threads found.</div>}
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => selectThread(t)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${selectedThread?.id === t.id ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.title || t.id}</span>
            </div>
            <div className="text-zinc-400 mt-0.5 pl-5">{new Date(t.updatedAt).toLocaleDateString()}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {!selectedThread && <div className="text-sm text-zinc-500">Select a thread to view messages.</div>}
        {msgLoading && <div className="text-sm text-zinc-400">Loading messages...</div>}
        {!msgLoading && selectedThread && messages.length === 0 && (
          <div className="text-sm text-zinc-500">No messages in this thread.</div>
        )}
        {!msgLoading && messages.map((msg) => {
          const text = msg.content?.parts?.find((p) => p.type === 'text')?.text || msg.content?.content || '';
          if (!text) return null;
          return (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-zinc-50 border border-zinc-200 text-zinc-800'
                }`}
            >
              <div className="text-xs opacity-60 mb-1">{msg.role} · {new Date(msg.createdAt).toLocaleTimeString()}</div>
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TracesTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    getLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-zinc-400 uppercase">Execution Logs</div>
        <button onClick={fetchLogs} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-850 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      {loading && <div className="text-sm text-zinc-400">Loading traces...</div>}
      {!loading && logs.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-center text-xs text-zinc-500 shadow-sm">
          No trace logs found. Logs appear here when the agent runs with a configured log transport.
        </div>
      )}
      {!loading && logs.map((log, idx) => (
        <div key={idx} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-mono text-zinc-700 shadow-sm">
          <span className="text-zinc-400 mr-3">{log.timestamp || log.time || ''}</span>
          <span className={log.level === 'error' ? 'text-red-600 font-semibold' : log.level === 'warn' ? 'text-yellow-600 font-semibold' : 'text-zinc-650'}>
            [{log.level || 'info'}]
          </span>
          <span className="ml-2">{log.message || JSON.stringify(log)}</span>
        </div>
      ))}
    </div>
  );
}

function ContextTab({ agentId }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAgentThreads(agentId)
      .then((t) => { setThreads(t); if (t.length > 0) selectThread(t[0]); })
      .finally(() => setLoading(false));
  }, [agentId]);

  const selectThread = useCallback(async (thread) => {
    setSelectedThread(thread);
    setMsgLoading(true);
    try {
      const msgs = await getThreadMessages(thread.id);
      setMessages(msgs);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  if (loading) return <div className="text-sm text-gray-500 p-4">Loading context...</div>;

  const tokenInfo = messages.find((m) => m.content?.parts?.some((p) => p.type === 'data-om-status'));
  const omStatus = tokenInfo?.content?.parts?.find((p) => p.type === 'data-om-status')?.data;

  return (
    <div className="flex h-full gap-4">
      <div className="w-64 shrink-0 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-400 uppercase mb-2">Threads</div>
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => selectThread(t)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${selectedThread?.id === t.id ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
          >
            <div className="truncate">{t.title || t.id}</div>
            <div className="text-zinc-400 mt-0.5">{new Date(t.updatedAt).toLocaleDateString()}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {omStatus && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2 shadow-sm">
            <div className="text-xs font-semibold text-zinc-450 uppercase">Context Window</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-50/70 rounded-lg p-3 border border-zinc-100">
                <div className="text-zinc-500 mb-1">Message Tokens</div>
                <div className="text-zinc-800 font-mono font-semibold">{omStatus.windows?.active?.messages?.tokens ?? '—'}</div>
                <div className="text-zinc-400 font-mono">/ {omStatus.windows?.active?.messages?.threshold ?? '—'}</div>
              </div>
              <div className="bg-zinc-50/70 rounded-lg p-3 border border-zinc-100">
                <div className="text-zinc-500 mb-1">Observation Tokens</div>
                <div className="text-zinc-800 font-mono font-semibold">{omStatus.windows?.active?.observations?.tokens ?? '—'}</div>
                <div className="text-zinc-400 font-mono">/ {omStatus.windows?.active?.observations?.threshold ?? '—'}</div>
              </div>
            </div>
          </div>
        )}

        {msgLoading && <div className="text-sm text-zinc-400">Loading context...</div>}
        {!msgLoading && !selectedThread && <div className="text-sm text-zinc-500">No threads available.</div>}
        {!msgLoading && selectedThread && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-zinc-450 uppercase mb-3">Thread Messages ({messages.filter(m => m.content?.parts?.some(p => p.type === 'text')).length})</div>
            <div className="space-y-2">
              {messages.filter((m) => m.content?.parts?.some((p) => p.type === 'text')).map((msg) => {
                const text = msg.content.parts.find((p) => p.type === 'text').text;
                return (
                  <div key={msg.id} className="flex gap-2 text-xs">
                    <span className={`shrink-0 font-semibold ${msg.role === 'user' ? 'text-blue-600' : 'text-emerald-700'}`}>{msg.role}</span>
                    <span className="text-zinc-600 truncate">{text}</span>
                  </div>
                );
              })}
              {messages.filter((m) => m.content?.parts?.some((p) => p.type === 'text')).length === 0 && (
                <div className="text-xs text-zinc-500">No text messages in this thread.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function AgentDetail() {

  const { selectedAgentId, clearSelectedAgentId } = useUIStore();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [activeRightTab, setActiveRightTab] = useState('Overview');
  const [selectedProvider, setSelectedProvider] = useState('OpenAI');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [threads, setThreads] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const chatStorageKey = selectedAgentId ? `agent_chat_${selectedAgentId}` : null;

  // Load persisted threads + messages from localStorage
  function loadPersistedChat(agentId) {
    try {
      const raw = localStorage.getItem(`agent_chat_${agentId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function savePersistedChat(agentId, data) {
    try {
      localStorage.setItem(`agent_chat_${agentId}`, JSON.stringify(data));
    } catch {}
  }

  // Versions and local storage tracking states
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState('');
  const [editorInstructions, setEditorInstructions] = useState('');

  const [models] = useState({
    OpenAI: ['GPT-4', 'GPT-3.5', 'GPT-4 Turbo'],
    Google: ['Gemini Pro', 'Gemini Ultra'],
    Anthropic: ['Claude 3 Opus', 'Claude 3 Sonnet'],
  });

  useEffect(() => {
    async function fetchAgent() {
      if (!selectedAgentId) return;
      setLoading(true);
      setError(null);
      setChatMessages([]);
      setThreadId(crypto.randomUUID());

      try {
        const data = await getAgentById(selectedAgentId);
        setAgent(data);
        const agentThreads = await getAgentThreads(selectedAgentId);
        // Merge API threads with locally persisted threads (local ones first)
        const persisted = loadPersistedChat(selectedAgentId);
        const localThreads = persisted?.threads || [];
        const apiIds = new Set(agentThreads.map((t) => t.id));
        const mergedThreads = [...localThreads.filter((t) => !apiIds.has(t.id)), ...agentThreads];
        setThreads(mergedThreads);
        // Restore last active thread messages
        if (persisted?.activeThreadId && persisted?.messagesByThread?.[persisted.activeThreadId]) {
          setThreadId(persisted.activeThreadId);
          setChatMessages(persisted.messagesByThread[persisted.activeThreadId]);
        } else {
          setChatMessages([]);
          setThreadId(crypto.randomUUID());
        }

        // Retrieve versions or mock default
        const stored = localStorage.getItem(`agent_versions_${selectedAgentId}`);
        let parsed = [];
        if (stored) {
          try {
            parsed = JSON.parse(stored);
          } catch (e) {
            console.error(e);
          }
        }

        if (parsed.length === 0) {
          parsed = [
            {
              id: 'v1',
              name: 'v1',
              timestamp: 'Jul 20, 2026, 11:42 AM',
              published: true, // v1 is active/published originally
              instructions: data.instructions || '',
              variables: [
                { name: 'user-id', type: 'string' },
                { name: 'user-tier', type: 'string' },
                { name: 'tenant-id', type: 'string' },
                { name: 'locale', type: 'string' },
                { name: 'temperature-unit', type: 'string' },
                { name: 'allow-commands', type: 'string' },
              ],
              tools: data.tools || []
            }
          ];
          localStorage.setItem(`agent_versions_${selectedAgentId}`, JSON.stringify(parsed));
        }

        setVersions(parsed);
        const activeVer = parsed.find(v => v.published) || parsed[parsed.length - 1];
        setActiveVersionId(activeVer?.id || 'v1');
        setEditorInstructions(activeVer?.instructions || '');
      } catch (err) {
        setError(err.message || 'Unable to load agent details.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [selectedAgentId]);

  if (!selectedAgentId) return null;

  // Persist threads + messages to localStorage whenever they change
  useEffect(() => {
    if (!selectedAgentId || threads.length === 0) return;
    const persisted = loadPersistedChat(selectedAgentId) || {};
    const messagesByThread = persisted.messagesByThread || {};
    if (chatMessages.length > 0) messagesByThread[threadId] = chatMessages;
    savePersistedChat(selectedAgentId, {
      threads: threads.filter((t) => !t.updatedAt), // only local threads
      activeThreadId: threadId,
      messagesByThread,
    });
  }, [threads, chatMessages, threadId, selectedAgentId]);

  async function handleSelectThread(thread) {
    setThreadId(thread.id);
    setChatMessages([]);
    // Local thread — restore from localStorage
    if (!thread.updatedAt) {
      const persisted = loadPersistedChat(selectedAgentId);
      const saved = persisted?.messagesByThread?.[thread.id] || [];
      setChatMessages(saved);
      return;
    }
    // API thread — fetch from server
    setThreadLoading(true);
    try {
      const msgs = await getThreadMessages(thread.id);
      const normalized = msgs
        .filter((m) => m.content?.parts?.some((p) => p.type === 'text'))
        .map((m) => {
          const textPart = m.content?.parts?.find((p) => p.type === 'text');
          const usagePart = m.content?.parts?.find((p) => p.type === 'usage');
          return {
            id: m.id,
            role: m.role,
            content: textPart ? textPart.text : '',
            usage: usagePart ? usagePart.usage : null,
          };
        });
      setChatMessages(normalized);
    } catch {
      setChatMessages([]);
    } finally {
      setThreadLoading(false);
    }
  }

  const handleActiveVersionChange = (verId) => {
    setActiveVersionId(verId);
    const ver = versions.find(v => v.id === verId);
    if (ver) {
      setEditorInstructions(ver.instructions || '');
    }
  };

  const handleInstructionsChange = (newVal) => {
    setEditorInstructions(newVal);
    setVersions(prev => {
      const updated = prev.map(v => v.id === activeVersionId ? { ...v, instructions: newVal } : v);
      localStorage.setItem(`agent_versions_${selectedAgentId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveNewVersion = () => {
    const nextVerNum = versions.length + 1;
    const nextVerId = `v${nextVerNum}`;
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');

    const activeVer = versions.find(v => v.id === activeVersionId) || {};
    const newVersion = {
      id: nextVerId,
      name: nextVerId,
      timestamp: nowStr,
      published: false,
      instructions: editorInstructions,
      variables: activeVer.variables || [],
      tools: activeVer.tools || []
    };

    const updated = [...versions, newVersion];
    setVersions(updated);
    localStorage.setItem(`agent_versions_${selectedAgentId}`, JSON.stringify(updated));
    setActiveVersionId(nextVerId);
  };

  const handlePublishVersion = () => {
    const updated = versions.map(v => ({
      ...v,
      published: v.id === activeVersionId
    }));
    setVersions(updated);
    localStorage.setItem(`agent_versions_${selectedAgentId}`, JSON.stringify(updated));
  };

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    setSelectedProvider(provider);
    setSelectedModel(models[provider]?.[0] || '');
  };

  const extractAssistantText = (payload) => {
    if (typeof payload === 'string') return payload;
    if (Array.isArray(payload)) {
      for (const item of payload) {
        const text = extractAssistantText(item);
        if (text) return text;
      }
      return '';
    }

    if (payload && typeof payload === 'object') {
      for (const key of ['output', 'message', 'content', 'text', 'result']) {
        const text = extractAssistantText(payload[key]);
        if (text) return text;
      }

      if (payload?.choices?.[0]?.message?.content) {
        return extractAssistantText(payload.choices[0].message.content);
      }

      if (payload?.messages?.length) {
        const lastMessage = payload.messages[payload.messages.length - 1];
        return extractAssistantText(lastMessage?.content || lastMessage?.text || lastMessage?.message);
      }
    }

    return '';
  };

  const [modelStatus, setModelStatus] = useState(null);

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedAgentId || isSending) return;

    const userMessage = { role: 'user', content: text, timestamp: Date.now() };
    const assistantMsgId = `msg-${Date.now()}`;

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsSending(true);
    setIsThinking(true);
    setModelStatus('thinking');

    try {
      // Prepend version-specific instructions to simulate testing modified prompts
      const msgsToSend = [];
      if (activeTab === 'Editor' && editorInstructions) {
        msgsToSend.push({ role: 'system', content: editorInstructions });
      } else if (activeTab === 'Chat') {
        const publishedVer = versions.find(v => v.published);
        if (publishedVer && publishedVer.instructions) {
          msgsToSend.push({ role: 'system', content: publishedVer.instructions });
        }
      }

      const formattedHistory = chatMessages.map(m => ({ role: m.role, content: m.content }));
      formattedHistory.push(userMessage);
      msgsToSend.push(...formattedHistory);

      // Add empty streaming assistant message
      setChatMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          reasoning: '',
          usage: null,
          isStreaming: true,
          status: 'thinking',
          timestamp: Date.now(),
        },
      ]);

      await streamAgentGenerate(selectedAgentId, msgsToSend, threadId, {
        onReasoning: (reasoningChunk) => {
          setIsThinking(true);
          setModelStatus('thinking');
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, reasoning: (m.reasoning || '') + reasoningChunk, status: 'thinking' }
                : m
            )
          );
        },
        onToken: (tokenChunk) => {
          setIsThinking(false);
          setModelStatus('generating');
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: (m.content || '') + tokenChunk, status: 'generating' }
                : m
            )
          );
        },
        onUsage: (usage) => {
          setChatMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, usage } : m))
          );
        },
        onDone: async () => {
          setIsThinking(false);
          setModelStatus('generated');
          // Wait 150ms for backend database write to finish
          await new Promise((r) => setTimeout(r, 150));
          try {
            const msgs = await getThreadMessages(threadId);
            const normalized = msgs
              .filter((m) => m.content?.parts?.some((p) => p.type === 'text'))
              .map((m) => {
                const textPart = m.content?.parts?.find((p) => p.type === 'text');
                const usagePart = m.content?.parts?.find((p) => p.type === 'usage');
                return {
                  id: m.id,
                  role: m.role,
                  content: textPart ? textPart.text : '',
                  usage: usagePart ? usagePart.usage : null,
                };
              });
            if (normalized.length > 0) {
              setChatMessages(normalized);
            }
          } catch (err) {
            console.error('Failed to get thread usage on done:', err);
            setChatMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, isStreaming: false, status: 'generated' } : m
              )
            );
          }
        },
        onError: (err) => {
          console.error('Agent streaming response failed', err);
          setIsThinking(false);
          setModelStatus('error');
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: err.message || 'Unable to generate a response.',
                    isStreaming: false,
                    status: 'error',
                  }
                : m
            )
          );
        },
      });
    } catch (err) {
      console.error('Agent response failed', err);
    } finally {
      setIsSending(false);
      setIsThinking(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Editor':
      case 'Chat':
        return (
          <div className="flex h-full flex-col font-medium">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center select-none pb-12">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-350 font-bold text-xs uppercase mb-3 shadow-md">
                  {agent?.name ? agent.name.charAt(0) : 'A'}
                </div>
                <div className="text-sm font-semibold text-zinc-400">How can I help you today?</div>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {threadLoading
                  ? <div className="text-sm text-zinc-550">Loading messages...</div>
                  : chatMessages.map((chat, index) => (
                    <div key={chat.id || `${chat.role}-${index}`} className="mb-3 group">
                      {chat.role === 'assistant' && (
                        <DarkReasoningPanel
                          isThinking={chat.isStreaming && !chat.content && !chat.reasoning}
                          reasoning={chat.reasoning}
                        />
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                          chat.role === 'user'
                            ? 'ml-auto bg-blue-600 text-white'
                            : 'bg-zinc-50 border border-zinc-200 text-zinc-800'
                        }`}
                      >
                        {chat.content}
                        {chat.role === 'assistant' && chat.isStreaming && (
                          <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse" />
                        )}
                      </div>
                      {chat.role === 'assistant' && (
                        <ModelStatusPill
                          status={chat.status || (chat.isStreaming ? (chat.content ? 'generating' : 'thinking') : 'generated')}
                          usage={chat.usage}
                          timestamp={chat.timestamp}
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'Evaluate':
        return <EvaluateTab agentId={selectedAgentId} />;
      case 'Review':
        return <ReviewTab agentId={selectedAgentId} />;
      case 'Traces':
        return <TracesTab />;
      case 'Context':
        return <ContextTab agentId={selectedAgentId} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-white text-zinc-800 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Agents /</span>
          <span className="text-sm font-semibold text-zinc-800 flex items-center gap-1 cursor-pointer select-none">
            {agent?.name || 'Agent'}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-xs text-zinc-500 hover:text-zinc-800">Agents documentation</a>
          <Button variant="ghost" size="sm" onClick={clearSelectedAgentId} className="text-zinc-500 hover:text-[#4ADE80] transition p-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white px-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-0 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab
                ? 'text-zinc-900 border-zinc-900 font-semibold'
                : 'text-zinc-500 border-transparent hover:text-zinc-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-hidden flex bg-zinc-50">
        {/* Left Column: Chat Sidebar (only for Chat tab) */}
        {activeTab === 'Chat' && (
          <div className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col overflow-hidden">
            <div className="border-b border-zinc-200 p-4">
              <button
                onClick={() => {
                  const newId = crypto.randomUUID();
                  const newThread = { id: newId, createdAt: new Date().toISOString() };
                  setThreadId(newId);
                  setChatMessages([]);
                  setThreads((prev) => {
                    const updated = [newThread, ...prev];
                    const persisted = loadPersistedChat(selectedAgentId) || {};
                    savePersistedChat(selectedAgentId, {
                      ...persisted,
                      threads: updated.filter((t) => !t.updatedAt),
                      activeThreadId: newId,
                    });
                    return updated;
                  });
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100/70 transition"
              >
                <Plus className="w-3.5 h-3.5" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {threads.length === 0 ? (
                <div className="text-xs text-zinc-400 px-3 py-2">Your conversations will appear here once you start chatting!</div>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectThread(t)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${threadId === t.id ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : t.id}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Editor Tab Specific Split View */}
        {activeTab === 'Editor' ? (
          <div className="flex-1 flex overflow-hidden divide-x divide-zinc-200">
            {/* Left Box: Agent Editor */}
            <div className="w-[55%] flex flex-col overflow-hidden">
              <AgentEditor
                agent={agent}
                versions={versions}
                activeVersionId={activeVersionId}
                setActiveVersionId={handleActiveVersionChange}
                onSaveNewVersion={handleSaveNewVersion}
                onPublishVersion={handlePublishVersion}
                instructions={editorInstructions}
                onChangeInstructions={handleInstructionsChange}
              />
            </div>

            {/* Right Box: Chat Interface */}
            <div className="w-[45%] flex flex-col overflow-hidden bg-white">
              <div className="flex-grow flex flex-col overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="flex-1 flex flex-col">
                  {chatMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center select-none pb-12">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-650 font-bold text-xs uppercase mb-3 shadow-md">
                        {agent?.name ? agent.name.charAt(0) : 'A'}
                      </div>
                      <div className="text-sm font-semibold text-zinc-400">How can I help you today?</div>
                      <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                        <span>Testing version:</span>
                        <span className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-zinc-600 font-bold">{activeVersionId || 'v1'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 pr-2">
                      {threadLoading
                        ? <div className="text-sm text-zinc-550">Loading messages...</div>
                        : chatMessages.map((chat, index) => (
                            <div key={chat.id || `${chat.role}-${index}`} className="mb-3 group">
                              {chat.role === 'assistant' && (
                                <DarkReasoningPanel
                                  isThinking={chat.isStreaming && !chat.content && !chat.reasoning}
                                  reasoning={chat.reasoning}
                                />
                              )}
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                                  chat.role === 'user'
                                    ? 'ml-auto bg-blue-600 text-white'
                                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800'
                                }`}
                              >
                                {chat.content}
                                {chat.role === 'assistant' && chat.isStreaming && (
                                  <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse" />
                                )}
                              </div>
                              {chat.role === 'assistant' && (
                                <ModelStatusPill
                                  status={chat.status || (chat.isStreaming ? (chat.content ? 'generating' : 'thinking') : 'generated')}
                                  usage={chat.usage}
                                  timestamp={chat.timestamp}
                                />
                              )}
                            </div>
                          ))}

                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input inside Editor */}
              <div className="p-6 border-t border-zinc-200 bg-white">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden focus-within:border-zinc-300 transition">
                  <textarea
                    placeholder="Enter your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim()) handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="w-full bg-transparent px-4 pt-3 text-sm outline-none resize-none placeholder-zinc-400 text-zinc-800"
                  />

                  <div className="flex justify-between items-center px-4 pb-3 pt-1">
                    {/* Model Selector pills */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center">
                        <select
                          value={selectedProvider}
                          onChange={handleProviderChange}
                          className="appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 py-1 text-[11px] font-medium text-zinc-650 outline-none hover:border-zinc-300 hover:text-zinc-800 cursor-pointer transition select-none"
                        >
                          <option>OpenAI</option>
                          <option>Google</option>
                          <option>Anthropic</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
                      </div>

                      <div className="relative flex items-center">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 py-1 text-[11px] font-medium text-zinc-655 outline-none hover:border-zinc-300 hover:text-zinc-800 cursor-pointer transition max-w-[150px] truncate select-none"
                        >
                          <option value="">Select model...</option>
                          {models[selectedProvider]?.map((model) => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5">
                      <button className="text-zinc-400 hover:text-zinc-700 transition p-1" title="Voice input">
                        <Mic className="w-4 h-4" />
                      </button>
                      <button className="text-zinc-400 hover:text-zinc-700 transition p-1" title="Add integrations/tools">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isSending}
                        className={`flex items-center justify-center w-7 h-7 rounded-full transition ${message.trim() && !isSending
                          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                          : 'bg-zinc-100 text-zinc-400 pointer-events-none'
                          }`}
                        title="Send message"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Other Tabs: standard middle column and right properties panel */
          <>
            {/* Middle Column: Active Tab Content (Chat, Evaluate, Review, etc.) */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
              <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                {renderTabContent()}
              </div>

              {/* Chat Input (only inside Chat tab) */}
              {activeTab === 'Chat' && (
                <div className="p-6 border-t border-zinc-200 bg-white">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden focus-within:border-zinc-300 transition">
                    <textarea
                      placeholder="Enter your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (message.trim()) handleSendMessage();
                        }
                      }}
                      rows={2}
                      className="w-full bg-transparent px-4 pt-3 text-sm outline-none resize-none placeholder-zinc-400 text-zinc-800"
                    />

                    <div className="flex justify-between items-center px-4 pb-3 pt-1">
                      {/* Model Selector pills */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          <select
                            value={selectedProvider}
                            onChange={handleProviderChange}
                            className="appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 py-1 text-[11px] font-medium text-zinc-650 outline-none hover:border-zinc-300 hover:text-zinc-800 cursor-pointer transition select-none"
                          >
                            <option>OpenAI</option>
                            <option>Google</option>
                            <option>Anthropic</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
                        </div>

                        <div className="relative flex items-center">
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="appearance-none rounded-lg border border-zinc-205 bg-white pl-2.5 pr-7 py-1 text-[11px] font-medium text-zinc-655 outline-none hover:border-zinc-300 hover:text-zinc-800 cursor-pointer transition max-w-[150px] truncate select-none"
                          >
                            <option value="">Select model...</option>
                            {models[selectedProvider]?.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5">
                        <button className="text-zinc-400 hover:text-zinc-700 transition p-1" title="Voice input">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button className="text-zinc-400 hover:text-zinc-700 transition p-1" title="Add integrations/tools">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || isSending}
                          className={`flex items-center justify-center w-7 h-7 rounded-full transition ${message.trim() && !isSending
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                            : 'bg-zinc-100 text-zinc-400 pointer-events-none'
                            }`}
                          title="Send message"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar: Agent Details */}
            <div className="w-80 shrink-0 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-650 font-bold text-xs uppercase shadow-sm">
                    {agent?.name ? agent.name.charAt(0) : 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-zinc-800 block truncate max-w-[200px]">{agent?.name || 'Agent'}</div>
                    <div className="text-[10px] font-medium text-zinc-500">Mastra Agent</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono text-zinc-600 block truncate max-w-[170px]" title={agent?.id || ''}>
                    {agent?.id || 'agent'}
                  </span>
                  <button className="flex items-center gap-1 px-2.5 py-0.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100/50 text-zinc-600 hover:text-zinc-900 rounded text-[10px] font-medium transition">
                    <Share2 className="w-3 h-3 text-zinc-500" /> Share
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-zinc-200 px-4 py-0 flex gap-4 overflow-x-auto bg-white">
                {rightPanelTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveRightTab(tab)}
                    className={`whitespace-nowrap px-0 py-2.5 text-xs font-semibold border-b-2 transition ${activeRightTab === tab
                      ? 'text-zinc-900 border-zinc-900 font-semibold'
                      : 'text-zinc-500 border-transparent hover:text-zinc-800'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm bg-white">
                {activeRightTab === 'Overview' && (
                  <>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">{agent?.description || 'No description available.'}</p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1 select-none">
                        Memory <Info className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded w-fit select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">On</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1 select-none">
                        Tools <Info className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      {agent?.tools && agent.tools.length > 0 ? (
                        <div className="space-y-1.5 pl-1">
                          {agent.tools.map((tool, idx) => (
                            <div key={idx} className="text-xs text-zinc-650 flex items-start gap-2">
                              <span className="text-zinc-350 font-bold select-none">•</span>
                              <span className="leading-snug">{tool.description || tool.name || tool.id}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">No tools</p>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1 select-none">
                        Workflows <Info className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <p className="text-xs text-zinc-400 italic">No workflows</p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Skills</div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-purple-50 border border-purple-100 text-[10px] font-bold text-purple-700 shadow-sm select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 block animate-pulse"></span>
                        mastra
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                        Workspace Tools <Info className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <p className="text-xs text-zinc-400 italic">No workspace tools</p>
                    </div>
                  </>
                )}

                {activeRightTab === 'Model Settings' && (
                  <>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Model Configuration</div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-zinc-500 font-sans font-semibold">Model</span>
                        <span className="text-zinc-800 font-semibold">{agent?.model || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-zinc-100">
                        <span className="text-zinc-500 font-sans font-semibold">Provider</span>
                        <span className="text-zinc-800 font-semibold">{agent?.provider || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-zinc-100">
                        <span className="text-zinc-500 font-sans font-semibold">Type</span>
                        <span className="text-zinc-800 font-semibold">{agent?.type || 'N/A'}</span>
                      </div>
                    </div>
                  </>
                )}

                {activeRightTab === 'Memory' && (
                  <>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Memory Configuration</div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-zinc-500 font-sans font-semibold">Memory Enabled</span>
                        <span className="text-emerald-600 font-bold">Yes</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-zinc-100">
                        <span className="text-zinc-500 font-sans font-semibold">Last Messages</span>
                        <span className="text-zinc-800 font-semibold">15</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-zinc-100">
                        <span className="text-zinc-500 font-sans font-semibold">Auto-generate Titles</span>
                        <span className="text-rose-600 font-bold uppercase text-[10px]">No</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full mt-4 bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition py-2 text-xs font-semibold rounded-lg shadow-sm">
                      Edit Working Memory
                    </Button>
                  </>
                )}

                {activeRightTab === 'Traces' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Trace Log Triggers</div>
                    <p className="text-xs text-zinc-550 leading-relaxed font-semibold">Tracing requires setting telemetry triggers inside your environment connections variables.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

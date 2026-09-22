import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, MessageSquare, Check, ChevronDown, Bot } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../stores/useChatStore';

export default function AgentChatPanel({ agent, onClose }) {
  const agentKey = agent?.id || 'agent-chat';

  const allSessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const newChat = useChatStore((s) => s.newChat);
  const switchSession = useChatStore((s) => s.switchSession);

  const sessions = allSessions.filter((s) => s.agentId === agentKey);
  const { messages, isLoading, send } = useChat(agentKey);

  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!historyOpen) return;
    function handleClick(e) {
      if (historyRef.current && !historyRef.current.contains(e.target)) setHistoryOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [historyOpen]);

  function handleSend(text) {
    send?.(text);
  }

  function handleNewChat() {
    newChat(agentKey);
    setHistoryOpen(false);
  }

  // Determine if the last message is actively streaming
  const isLastStreaming = messages.length > 0 && messages[messages.length - 1]?.isStreaming;

  return (
    <div className="flex flex-col h-full w-80 bg-gray-50 dark:bg-slate-950 border-l border-gray-200 dark:border-slate-800 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none shrink-0">
        <div
          ref={historyRef}
          className="relative flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          onClick={() => setHistoryOpen((v) => !v)}
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">{agent?.name || 'Agent'}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{activeSession?.label}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />

          {historyOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Chat History</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNewChat(); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={(e) => { e.stopPropagation(); switchSession(session.id); setHistoryOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors ${session.id === activeSessionId ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${session.id === activeSessionId ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${session.id === activeSessionId ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-slate-200'}`}>{session.label}</p>
                    </div>
                    {session.id === activeSessionId && <Check className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-all"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-all"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 select-none">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">Chat with {agent?.name || 'Agent'}</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1 leading-relaxed">{agent?.description || 'Ask this agent anything.'}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isThinking={false} />
            ))}
            {/* Global thinking indicator while loading but no streaming message yet */}
            {isLoading && !isLastStreaming && (
              <ChatMessage key="thinking" message={{ id: 'thinking', role: 'assistant', content: '' }} isThinking />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}

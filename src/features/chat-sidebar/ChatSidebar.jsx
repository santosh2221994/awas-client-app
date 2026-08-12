import React, { useEffect, useRef, useState } from 'react';
import { Clock, Plus, MessageSquare, Check } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { useChat } from '../../hooks/useChat';
import { useUIStore } from '../../stores/useUIStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatSidebar() {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const isLoading = useChatStore((s) => s.isLoading);
  const newChat = useChatStore((s) => s.newChat);
  const switchSession = useChatStore((s) => s.switchSession);

  const messages = sessions.find((s) => s.id === activeSessionId)?.messages ?? [];

  const selectedAgentId = useUIStore((s) => s.selectedAgentId);
  const selectedCrewAgentId = useUIStore((s) => s.selectedCrewAgentId);
  const activeAgentId = selectedAgentId || selectedCrewAgentId || 'studio-chat-agent';
  const { send } = useChat(activeAgentId);
  const messagesEndRef = useRef(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setHistoryOpen(false);
      }
    }
    if (historyOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [historyOpen]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="w-80 h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white select-none">
        <span className="text-sm font-semibold text-gray-800">
          {activeSession?.label || 'Studio Chat'}
        </span>

        <div className="flex items-center gap-1">
          {/* History icon */}
          <div ref={historyRef} className="relative">
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all outline-none border border-transparent hover:border-gray-100"
              title="Chat History"
            >
              <Clock className="w-4 h-4" />
            </button>

            {historyOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Chat History</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={(e) => { e.stopPropagation(); switchSession(session.id); setHistoryOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${session.id === activeSessionId ? 'bg-indigo-50' : ''}`}
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${session.id === activeSessionId ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${session.id === activeSessionId ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {session.label}
                        </p>
                        <p className="text-[10px] text-gray-400">{session.messages.length} message{session.messages.length !== 1 ? 's' : ''}</p>
                      </div>
                      {session.id === activeSessionId && <Check className="w-3 h-3 text-indigo-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* New Chat icon */}
          <button
            onClick={newChat}
            className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all outline-none border border-transparent hover:border-gray-100"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 select-none">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27C3.4 15.5 3 13.8 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">How may I help you?</p>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Ask me anything about agents,<br />workflows, or canvas setup.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} isThinking={false} />
            ))}
            {/* Only show global thinking bubble when no streaming message is already visible */}
            {isLoading && !messages[messages.length - 1]?.isStreaming && (
              <ChatMessage key="thinking" message={{ id: 'thinking', role: 'assistant', content: '' }} isThinking={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>


      {/* Chat Input */}
      <ChatInput onSend={send} />
    </div>
  );
}

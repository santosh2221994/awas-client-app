import React, { useEffect, useRef } from 'react';
import { Clock, ChevronDown, Plus } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { useChat } from '../../hooks/useChat';
import { useUIStore } from '../../stores/useUIStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatSidebar() {
  const messages = useChatStore((s) => s.messages);
  const selectedAgentId = useUIStore((s) => s.selectedAgentId);
  const selectedCrewAgentId = useUIStore((s) => s.selectedCrewAgentId);
  const activeAgentId = selectedAgentId || selectedCrewAgentId || 'studio-chat-agent';
  const { send } = useChat(activeAgentId);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-80 h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white select-none">
        <div className="flex items-center gap-2 cursor-pointer group">
          <Clock className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
            Studio Chat
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <button
          className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all outline-none border border-transparent hover:border-gray-100"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>


      {/* Messages and Cards Area */}
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
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Chat Input */}
      <ChatInput onSend={send} />
    </div>
  );
}

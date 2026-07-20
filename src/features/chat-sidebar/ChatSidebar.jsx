import React, { useEffect, useRef } from 'react';
import { Clock, ChevronDown, Plus } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { useChat } from '../../hooks/useChat';
import { useUIStore } from '../../stores/useUIStore';
import ChatMessage from './ChatMessage';
import WarningBanner from './WarningBanner';
import SuggestionCard from './SuggestionCard';
import ChatInput from './ChatInput';
import { initialMessages, initialWarnings, initialSuggestions } from '../../mocks/chatMessages';

export default function ChatSidebar() {
  const { messages, warnings, suggestions, dismissWarning, dismissSuggestion, setMessages, addWarning, addSuggestion } = useChatStore();
  const agentId = useUIStore((s) => s.selectedAgentId);
  const { send, runAutomation } = useChat(agentId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
    initialWarnings.forEach(w => addWarning(w));
    initialSuggestions.forEach(s => addSuggestion(s));
  }, []);

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
        {/* Render Chat Messages */}
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Warning Banner Card */}
        {warnings.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            {warnings.map((warning) => (
              <WarningBanner
                key={warning.id}
                warning={warning}
                onDismiss={dismissWarning}
              />
            ))}
          </div>
        )}

        {/* Suggestion Card */}
        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onPrimaryAction={runAutomation}
                onDismiss={dismissSuggestion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Chat Input */}
      <ChatInput onSend={send} />
    </div>
  );
}

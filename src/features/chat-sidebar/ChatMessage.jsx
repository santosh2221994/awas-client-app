import React from 'react';
import { cn } from '../../utils/cn';
import ReasoningPanel from './ReasoningPanel';
import { Zap } from 'lucide-react';

export default function ChatMessage({ message, isThinking = false }) {
  const { role, content, type, timestamp, reasoning, usage, isStreaming } = message;
  const isUser = role === 'user';
  const isCode = type === 'code';

  const formatContent = (text) => {
    if (!text) return null;
    // Basic Markdown parser for **bold** text and `inline code`
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="font-mono text-xs bg-gray-100 text-indigo-600 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const totalTokens = usage ? (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0) : null;

  return (
    <div className={cn('flex w-full mb-3 group', isUser ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col max-w-[85%]">
        {/* Reasoning / thinking panel for assistant messages */}
        {!isUser && (
          <ReasoningPanel
            isThinking={isThinking || (isStreaming && !content && !reasoning)}
            reasoning={reasoning}
          />
        )}

        {isCode ? (
          <div 
            className="font-mono text-xs bg-gray-800 text-emerald-400 rounded-xl px-4 py-3 shadow-sm border border-gray-700/50 whitespace-pre overflow-x-auto scrollbar-thin"
          >
            {content}
          </div>
        ) : (
          <div
            className={cn(
              'px-4 py-2.5 text-sm leading-relaxed shadow-sm',
              isUser
                ? 'bg-gray-900 text-white rounded-2xl rounded-tr-none'
                : 'bg-zinc-50 text-zinc-800 rounded-2xl rounded-tl-none border border-zinc-200'
            )}
          >
            {isUser ? content : formatContent(content)}
            {/* Blinking cursor during active streaming */}
            {!isUser && isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}

        {/* Token usage pill — shown below completed assistant messages */}
        {!isUser && totalTokens !== null && !isStreaming && (
          <div className="flex items-center gap-1.5 mt-1 px-1 select-none">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-amber-600 font-mono">
              {totalTokens.toLocaleString()} tokens
            </span>
            {usage?.duration && (
              <span className="text-[10px] text-gray-500 font-mono ml-0.5">
                {usage.duration}
              </span>
            )}
            {usage && (
              <span className="text-[10px] font-mono ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 select-none">
                <span className="text-indigo-500">Input: {(usage.promptTokens ?? 0).toLocaleString()}</span>
                <span className="text-gray-400">/</span>
                <span className="text-emerald-500">Output: {(usage.completionTokens ?? 0).toLocaleString()}</span>
              </span>
            )}
          </div>
        )}

        {isUser && formattedTime && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1 text-right">
            {formattedTime}
          </span>
        )}

        {!isUser && totalTokens === null && formattedTime && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1 text-left">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}

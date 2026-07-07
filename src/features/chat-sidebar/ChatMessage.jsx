import React from 'react';
import { cn } from '../../utils/cn';

export default function ChatMessage({ message }) {
  const { role, content, type, timestamp } = message;
  const isUser = role === 'user';
  const isCode = type === 'code';

  const formatContent = (text) => {
    if (!text) return '';
    // Basic Markdown parser for **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={cn("flex w-full mb-3", isUser ? "justify-end" : "justify-start")}>
      <div className="flex flex-col max-w-[85%]">
        {isCode ? (
          <div className="font-mono text-xs bg-gray-800 text-emerald-400 rounded-xl px-4 py-3 shadow-sm border border-gray-700/50 whitespace-pre overflow-x-auto scrollbar-thin">
            {content}
          </div>
        ) : (
          <div
            className={cn(
              "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
              isUser
                ? "bg-gray-900 text-white rounded-2xl rounded-tr-none"
                : "bg-white text-gray-700 rounded-2xl rounded-tl-none border border-gray-200"
            )}
          >
            {isUser ? content : formatContent(content)}
          </div>
        )}
        <span className={cn("text-[10px] text-gray-400 mt-1 px-1", isUser ? "text-right" : "text-left")}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

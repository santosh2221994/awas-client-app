import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ReasoningPanel({ isThinking = false, reasoning = '' }) {
  const [open, setOpen] = useState(true);

  if (!isThinking && !reasoning) return null;

  return (
    <div className="mb-2 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-semibold text-gray-600 flex-1 text-left">
          {isThinking ? 'Thinking...' : 'Reasoning'}
        </span>
        {isThinking ? (
          <ThinkingDots />
        ) : (
          open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {open && !isThinking && reasoning && (
        <div className="px-3 pb-3 pt-1 text-gray-500 leading-relaxed border-t border-gray-200 whitespace-pre-wrap">
          {reasoning}
        </div>
      )}

      {open && isThinking && (
        <div className="px-3 pb-3 pt-1 text-gray-400 italic border-t border-gray-200">
          Processing your request...
        </div>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'w-1 h-1 rounded-full bg-indigo-400 animate-bounce',
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

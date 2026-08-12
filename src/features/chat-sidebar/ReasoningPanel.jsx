import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * ReasoningPanel
 *
 * Renders model thinking/reasoning for assistant messages.
 * - While `isThinking` is true: shows animated "Thinking..." dots with placeholder text.
 * - While streaming reasoning arrives: shows live text as it accumulates.
 * - After streaming: shows collapsible finalized reasoning block.
 */
export default function ReasoningPanel({ isThinking = false, reasoning = '' }) {
  const [open, setOpen] = useState(true);

  // Don't render anything if there's no thinking activity and no reasoning content
  if (!isThinking && !reasoning) return null;

  const hasContent = Boolean(reasoning);

  return (
    <div className="mb-2 rounded-xl border border-indigo-100 bg-indigo-50/60 overflow-hidden text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-gray-500 hover:bg-indigo-50 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-semibold text-indigo-600 flex-1 text-left">
          {isThinking ? 'Thinking...' : 'Reasoning'}
        </span>
        {isThinking ? (
          <ThinkingDots />
        ) : (
          open
            ? <ChevronDown className="w-3.5 h-3.5 text-indigo-300" />
            : <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-indigo-100">
          {hasContent ? (
            <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{reasoning}</p>
          ) : (
            <p className="text-gray-400 italic">Processing your request...</p>
          )}
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
          className={cn('w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce')}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

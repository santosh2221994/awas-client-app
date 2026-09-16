import React, { useState, useEffect } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * ReasoningPanel
 *
 * Renders model thinking/reasoning for assistant messages.
 * Automatically opens when thinking and closes when finished, similar to elements.ai-sdk.dev
 */
export default function ReasoningPanel({ isThinking = false, reasoning = '' }) {
  const [open, setOpen] = useState(false);

  // Auto-open when thinking, auto-close when done
  useEffect(() => {
    if (isThinking) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isThinking]);

  // Don't render anything if there is no active thinking and no reasoning content
  if (!isThinking && !reasoning) return null;

  const hasReasoningContent = Boolean(reasoning && reasoning.trim());

  return (
    <div className="mb-3 w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-0 outline-none cursor-pointer"
      >
        <Brain className={cn("w-4 h-4 text-indigo-500", isThinking && "animate-pulse")} />
        <p className="flex-1 text-left m-0 font-medium">
          {isThinking ? 'Thinking...' : 'Thought Process'}
        </p>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 text-gray-400", 
            open ? "rotate-180" : "rotate-0"
          )} 
        />
      </button>

      {open && (
        <div className="mt-2 text-xs text-gray-600 border-l-2 border-indigo-200 bg-gray-50/70 p-2.5 rounded-r-md ml-2 max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-2 fade-in-0 duration-200 font-mono">
          {hasReasoningContent ? (
            reasoning
          ) : isThinking ? (
            <div className="flex items-center gap-2 text-gray-400 font-sans italic py-0.5">
              <span>Reasoning in progress</span>
              <ThinkingDots />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-0.5 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('w-1 h-1 rounded-full bg-gray-400 animate-bounce')}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

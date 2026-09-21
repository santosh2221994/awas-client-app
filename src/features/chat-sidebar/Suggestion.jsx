import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles } from 'lucide-react';

/**
 * AI Elements - Suggestion Component
 * Renders a horizontal scrollable row of clickable suggestions based on user prompt context.
 * Reference: https://elements.ai-sdk.dev/components/suggestion
 */
export function SuggestionItem({ children, onClick, className, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs font-medium',
        'px-3 py-1.5 rounded-full border border-zinc-200 bg-white shadow-2xs',
        'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300',
        'text-zinc-700 transition-all cursor-pointer active:scale-95 select-none',
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 text-indigo-500 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

export function SuggestionList({ suggestions = [], onSelect, className }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5', className)}>
      <div className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-zinc-400 select-none pr-1">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span>Suggestions</span>
      </div>
      {suggestions.map((item, index) => {
        const text = typeof item === 'string' ? item : item.label || item.text;
        return (
          <SuggestionItem key={index} onClick={() => onSelect?.(text)}>
            {text}
          </SuggestionItem>
        );
      })}
    </div>
  );
}

export default SuggestionList;

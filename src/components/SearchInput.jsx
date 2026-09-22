import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}) {
  return (
    <div
      className={cn(
        'relative flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 rounded-lg px-3 py-2',
        className
      )}
    >
      <Search size={14} className="text-gray-400 dark:text-slate-500 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors ml-1 flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

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
        'relative flex items-center bg-gray-50 border-0 rounded-lg px-3 py-2',
        className
      )}
    >
      <Search size={14} className="text-gray-400 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-1 flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

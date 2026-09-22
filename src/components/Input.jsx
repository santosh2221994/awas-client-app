import React from 'react';
import { cn } from '../utils/cn.js';

export default function Input({
  icon: Icon,
  suffix,
  placeholder,
  value,
  onChange,
  onKeyDown,
  className,
  ...rest
}) {
  return (
    <div
      className={cn(
        'relative flex items-center bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-all',
        className
      )}
    >
      {Icon && <Icon className="text-gray-400 dark:text-slate-500 w-4 h-4 mr-2 flex-shrink-0" />}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 min-w-0"
        {...rest}
      />
      {suffix && <div className="flex-shrink-0 ml-2">{suffix}</div>}
    </div>
  );
}

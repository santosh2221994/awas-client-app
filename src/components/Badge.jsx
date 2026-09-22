import React from 'react';
import { cn } from '../utils/cn.js';

const variants = {
  default: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300',
  success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
  purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
};

const dotColors = {
  default: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}) {
  return (
    <span
      className={cn(
        'rounded-full font-medium inline-flex items-center gap-1',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

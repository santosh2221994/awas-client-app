import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn.js';

export default function Accordion({
  title,
  isOpen = false,
  onToggle,
  children,
  icon: Icon,
  className,
}) {
  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon size={16} className="text-gray-400" />}
          <span>{title}</span>
        </div>
        <ChevronRight
          size={14}
          className={cn(
            'text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </button>

      {isOpen && (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

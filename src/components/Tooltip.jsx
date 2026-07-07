import React from 'react';
import { cn } from '../utils/cn.js';

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
};

export default function Tooltip({
  content,
  position = 'top',
  children,
}) {
  if (!content) return children;

  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          'absolute hidden group-hover:flex items-center bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-50 shadow-lg pointer-events-none',
          positionClasses[position]
        )}
      >
        {content}
        <span
          className={cn(
            'absolute w-0 h-0 border-4',
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}

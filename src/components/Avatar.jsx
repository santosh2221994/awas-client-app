import React from 'react';
import { cn } from '../utils/cn.js';

const sizes = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export default function Avatar({
  src,
  fallback = '',
  size = 'md',
  className,
}) {
  const initials = fallback ? fallback.charAt(0).toUpperCase() : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={fallback || 'Avatar'}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-indigo-100 text-indigo-600 font-semibold rounded-full flex items-center justify-center flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

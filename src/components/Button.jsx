import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn.js';

const variants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  brand: 'bg-indigo-600 text-white hover:bg-indigo-700',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  className,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'rounded-lg font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : Icon ? (
        <Icon size={iconSizes[size]} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={iconSizes[size]} />}
    </button>
  );
}

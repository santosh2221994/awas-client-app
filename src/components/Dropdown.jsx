import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn.js';

export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-white border border-gray-200 rounded-lg text-sm px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors w-full',
          isOpen && 'ring-2 ring-indigo-500/20 border-indigo-400'
        )}
      >
        <span className={cn('flex-1 text-left', !selectedOption && 'text-gray-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] w-full animate-fade-in">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'hover:bg-gray-50 px-3 py-2 cursor-pointer text-sm transition-colors',
                option.value === value
                  ? 'text-indigo-600 font-medium bg-indigo-50/50'
                  : 'text-gray-700'
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

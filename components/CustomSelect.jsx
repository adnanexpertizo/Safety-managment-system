'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  error = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selected = options?.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 sm:px-4 py-2.5 sm:py-3
          bg-white border rounded-xl
          flex items-center justify-between gap-2
          text-left transition-all duration-150
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-slate-400'}
          ${isOpen ? 'border-slate-600 ring-2 ring-slate-100' : 'border-gray-300'}
          ${error ? 'border-red-400 ring-2 ring-red-50' : ''}
        `}
      >
        <span className={`truncate text-xs sm:text-sm ${selected ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-56 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">No options available</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`
                  flex items-center justify-between
                  px-3 sm:px-4 py-2 sm:py-2.5
                  text-xs sm:text-sm cursor-pointer transition-colors
                  ${value === opt.value
                    ? 'bg-slate-50 text-slate-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check size={13} className="flex-shrink-0 text-slate-600" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
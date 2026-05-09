'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({
  label,
  options,
  value = '',
  onChange,
  placeholder = 'Select...',
  minWidth = '140px',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selected = options?.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="relative w-full"
      ref={ref}
      style={{ minWidth }}
    >
      {/* Label */}
      {label && (
        <label
          className="
            block
            text-[11px] sm:text-sm
            font-medium
            text-gray-700
            mb-1
          "
        >
          {label}
        </label>
      )}

      {/* Select Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full
          px-2 sm:px-4
          py-2 sm:py-3
          bg-white
          border border-gray-300
          rounded-md sm:rounded-lg
          flex items-center justify-between
          cursor-pointer
          hover:border-blue-500
          transition-all
        "
      >
        <span
          className={`
            truncate
            text-xs sm:text-sm
            ${value ? 'text-gray-800' : 'text-gray-400'}
          `}
        >
          {selected ? selected.label : placeholder}
        </span>

        <ChevronDown
          className={`
            w-4 h-4 sm:w-5 sm:h-5
            text-gray-500
            transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute
            z-50
            mt-1
            w-full
            bg-white
            border border-gray-300
            rounded-lg sm:rounded-xl
            shadow-lg
            py-1
            max-h-52
            overflow-auto
          "
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`
                px-2.5 sm:px-4
                py-2
                text-xs sm:text-sm
                hover:bg-blue-50
                cursor-pointer
                transition
                ${
                  value === opt.value
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700'
                }
              `}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
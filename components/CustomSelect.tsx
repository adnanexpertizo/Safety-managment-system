'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({
  label,
  options,
  value = '',           // ← Default to empty string
  onChange,
  placeholder = "Select...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selected = options?.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 transition ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg py-1 max-h-60 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer ${value === opt.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
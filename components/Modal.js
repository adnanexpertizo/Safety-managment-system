'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footerActions = [],
  size = 'md',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-white
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          flex flex-col
          max-h-[95vh] sm:max-h-[90vh]
          animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 text-gray-700 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footerActions && footerActions.length > 0 && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            {footerActions.map((action, i) => (
              <Button
                key={i}
                variant={action?.variant || 'secondary'}
                onClick={action?.onClick}
                className="w-full sm:w-auto min-w-[100px]"
              >
                {action?.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
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
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center 
                 p-0 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-animate { animation: modalSlideIn 0.22s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Modal Content */}
      <div className={`modal-animate relative w-full ${sizeClasses[size]} 
                       bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl 
                       flex flex-col max-h-[93vh] sm:max-h-[88vh]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate pr-4">
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
        <div className="flex-1 overflow-y-auto px-6 py-6 text-gray-700 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footerActions && footerActions.length > 0 && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl flex-shrink-0">
            {footerActions.map((action, i) => (
              <Button
                key={i}
                variant={action?.variant || 'secondary'}
                onClick={action?.onClick}
                className="w-full sm:w-auto min-w-[110px]"
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
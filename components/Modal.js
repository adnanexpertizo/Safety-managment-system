'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return createPortal(
    <>
      <style>{`
        @keyframes modal-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-animate {
          animation: modal-slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Backdrop — sits directly on document.body, never clipped by layout */}
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(3px)' }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Panel */}
        <div
          className={`modal-animate relative w-full ${sizeClasses[size]} bg-white flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl`}
          style={{ maxHeight: 'min(92vh, 860px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800 rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
            <h2 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight truncate pr-4">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 min-h-0 text-gray-700">
            {children}
          </div>

          {/* Footer */}
          {footerActions.length > 0 && (
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl">
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
    </>,
    document.body
  );
}
'use client';

import { useEffect } from 'react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footerActions = [],
  size = 'md',
  maxHeight = '85vh',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-primary text-white">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white text-3xl leading-none hover:text-gray-200 transition-colors p-1 -mr-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div 
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 text-gray-700"
          style={{ maxHeight }}
        >
          {children}
        </div>

        {/* Footer */}
        {footerActions && footerActions.length > 0 && (
          <div className="flex justify-end gap-3 px-5 sm:px-6 py-4 border-t bg-gray-50">
            {footerActions.map((action, i) => (
              <Button
                key={i}
                variant={action?.variant || 'secondary'}
                onClick={action?.onClick}
                className="min-w-[100px]"
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
'use client';

import { useEffect } from 'react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footerActions = [],           // ← Safe default
  size = 'md',
  maxHeight = '75vh',
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1f3d3a] text-white">
          <h2 className="text-[18px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl leading-none hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div 
          className="px-6 py-6 overflow-y-auto"
          style={{ maxHeight }}
        >
          {children}
        </div>

        {/* Footer - Safe Check */}
        {footerActions && footerActions.length > 0 && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footerActions.map((action, i) => (
              <Button
                key={i}
                variant={action?.variant || 'secondary'}
                onClick={action?.onClick}
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
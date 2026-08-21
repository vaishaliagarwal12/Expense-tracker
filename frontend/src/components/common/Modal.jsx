import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  onSubmit,
  maxWidth = 'max-w-2xl'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ContentWrapper = onSubmit ? 'form' : 'div';
  const wrapperProps = onSubmit ? { onSubmit } : {};

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center max-sm:items-end p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidth} max-h-[calc(100dvh-20px)] sm:max-h-[calc(100vh-48px)] bg-white dark:bg-slate-800 rounded-2xl max-sm:rounded-b-none max-sm:rounded-t-3xl shadow-2xl border border-slate-200/90 dark:border-slate-700/90 overflow-hidden flex flex-col my-auto max-sm:my-0 animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-700/80 shrink-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form / Content Wrapper */}
        <ContentWrapper {...wrapperProps} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 custom-scrollbar pb-6">
            {children}
          </div>

          {/* Fixed Footer Actions */}
          {footer && (
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50/95 dark:bg-slate-800/95 border-t border-slate-200/80 dark:border-slate-700 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 z-10">
              {footer}
            </div>
          )}
        </ContentWrapper>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}






import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  '2xl': 'sm:max-w-4xl',
  '3xl': 'sm:max-w-6xl',
  '4xl': 'sm:max-w-7xl',
  full: 'sm:max-w-[95vw]',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Modal Container: Bottom sheet on mobile, centered modal on tablet/desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative flex flex-col w-full ${sizes[size]} max-h-[92dvh] sm:max-h-[88dvh] rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 bg-white shadow-2xl z-10 overflow-hidden`}
          >
            {/* Mobile Sheet Handle */}
            <div className="flex sm:hidden justify-center pt-2.5 pb-1">
              <span className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            {/* Modal Header */}
            {title ? (
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 shrink-0">
                <div className="min-w-0 pr-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
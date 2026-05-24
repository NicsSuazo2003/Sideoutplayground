import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative glass-card p-6 w-full ${sizes[size]} z-10`}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10">
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

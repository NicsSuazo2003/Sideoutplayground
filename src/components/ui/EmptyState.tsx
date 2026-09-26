import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 ${
        compact ? 'py-8 sm:py-10' : 'py-14 sm:py-20'
      }`}
    >
      {/* Icon Capsule */}
      <div
        className={`flex items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-600 shadow-2xs ${
          compact ? 'w-12 h-12 mb-3' : 'w-14 h-14 sm:w-16 sm:h-16 mb-4'
        }`}
      >
        <div className="flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-7 sm:[&>svg]:h-7">
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-slate-900 font-bold text-sm sm:text-base tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-5 max-w-xs sm:max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Call to Action */}
      {action && (
        <div className="w-full sm:w-auto">
          <Button
            variant="neon"
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
            className="w-full sm:w-auto font-bold text-xs shadow-xs"
          >
            {action.label}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
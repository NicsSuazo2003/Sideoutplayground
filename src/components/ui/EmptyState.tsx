import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/30">
        {icon}
      </div>
      <h3 className="text-white/80 font-semibold text-base mb-2">{title}</h3>
      {description && <p className="text-white/40 text-sm mb-6 max-w-xs">{description}</p>}
      {action && (
        <Button variant="neon" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

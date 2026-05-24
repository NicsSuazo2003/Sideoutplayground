import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-white/80">{label}</label>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full input-glass rounded-xl px-4 py-2.5 text-sm ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

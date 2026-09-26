import {
  type InputHTMLAttributes,
  forwardRef,
  type ReactNode,
  useId,
} from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-semibold text-slate-700 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {/* Left Icon (Non-interactive pass-through) */}
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400 [&>svg]:w-4 [&>svg]:h-4">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all outline-none ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
                : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15'
            } ${
              disabled
                ? 'cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200/80 shadow-none'
                : ''
            } ${className}`}
            {...props}
          />

          {/* Right Icon (Interactive button or passive indicator) */}
          {rightIcon && (
            <div className="absolute right-1 flex items-center justify-center">
              {onRightIconClick ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={onRightIconClick}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:scale-95 transition-all [&>svg]:w-4 [&>svg]:h-4"
                >
                  {rightIcon}
                </button>
              ) : (
                <div className="pointer-events-none pr-3 flex items-center justify-center text-slate-400 [&>svg]:w-4 [&>svg]:h-4">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Validation or Helper Feedback */}
        {error ? (
          <p
            id={errorId}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-red-600 animate-in fade-in-50"
          >
            <AlertCircle size={12} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
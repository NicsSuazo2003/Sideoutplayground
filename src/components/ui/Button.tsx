import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'neon' | 'pink' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  neon: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg rounded-xl transition-all duration-300 font-bold',
  pink: 'border-2 border-amber-400 text-amber-500 hover:bg-amber-50 rounded-xl transition-all duration-300 font-bold',
  outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300',
  ghost: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-300',
  destructive: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-all duration-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', size = 'md', loading, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
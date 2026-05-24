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
  neon: 'btn-neon rounded-xl text-black',
  pink: 'btn-pink rounded-xl',
  outline: 'border border-white/20 text-white hover:bg-white/5 rounded-xl transition-all duration-300',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300',
  destructive: 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 rounded-xl transition-all duration-300',
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

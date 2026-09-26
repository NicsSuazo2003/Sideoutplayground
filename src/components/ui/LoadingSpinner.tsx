import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  className?: string;
  inline?: boolean;
}

export function LoadingSpinner({
  size = 32,
  message,
  className = '',
  inline = false,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={message || 'Loading content'}
      className={`flex flex-col items-center justify-center text-center ${
        inline ? 'p-1' : 'p-6 sm:p-8'
      } ${className}`}
    >
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0"
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-slate-200/80"
          style={{ width: size, height: size }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"
          style={{ width: size, height: size }}
        />
      </div>

      {message && (
        <p className="mt-3 text-xs font-semibold text-slate-500 animate-pulse tracking-wide">
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
}

export function FullPageLoader({
  message = 'Loading Side Out Playground...',
}: {
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-label={message}
      className="fixed inset-0 z-50 flex min-h-[100dvh] w-full flex-col items-center justify-center bg-slate-50/95 backdrop-blur-xs px-4"
    >
      <div className="relative flex flex-col items-center text-center">
        {/* Animated Brand Ring Spinner */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
          <div className="absolute inset-0 rounded-full border-[3px] border-teal-600 border-t-transparent animate-spin" />
          <div className="h-6 w-6 rounded-full bg-teal-50 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm font-bold tracking-tight text-slate-800">
          {message}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Please wait a moment while we fetch the latest schedules.
        </p>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
}
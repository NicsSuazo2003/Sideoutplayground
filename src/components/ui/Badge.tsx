import type { BookingStatus } from '../../types';

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize status-${status}`}>
      {status}
    </span>
  );
}

export function TypeBadge({ type, label }: { type: 'indoor' | 'outdoor'; label?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type === 'indoor' ? 'bg-blue-900/30 text-blue-400 border border-blue-700/40' : 'bg-green-900/30 text-green-400 border border-green-700/40'}`}>
      {label || (type === 'indoor' ? 'Indoor' : 'Outdoor')}
    </span>
  );
}

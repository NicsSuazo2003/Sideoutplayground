import type { BookingStatus, MembershipTier } from '../../types';


export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize status-${status}`}>
      {status}
    </span>
  );
}

export function TierBadge({ tier }: { tier: MembershipTier }) {
  const styles: Record<MembershipTier, string> = {
    free: 'bg-gray-800 text-gray-400 border border-gray-700',
    bronze: 'bg-amber-900/30 text-amber-500 border border-amber-700/40',
    silver: 'bg-slate-700/30 text-slate-300 border border-slate-500/40',
    gold: 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/40',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[tier]}`}>
      {tier === 'free' ? 'Free Tier' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Member`}
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

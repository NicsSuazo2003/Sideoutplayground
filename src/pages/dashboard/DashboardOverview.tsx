import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getUserBookings } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { StatusBadge, TierBadge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Booking } from '../../types';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserBookings(user.id).then(bks => {
      setUserBookings(bks);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = userBookings.filter(b => b.date >= today && b.status !== 'cancelled').slice(0, 3);
  const totalBookings = userBookings.length;
  const hoursPlayed = userBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.slots.length, 0);

  const stats = [
    { label: 'Total Bookings', value: totalBookings, icon: Calendar, color: '#7CFC00' },
    { label: 'Hours Played', value: hoursPlayed, icon: Clock, color: '#FF1493' },
    { label: 'Current Tier', value: user?.membershipTier ? user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1) : 'Free', icon: CreditCard, color: '#FFD700' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-white/50 text-sm mt-1">Here's your activity at Side Out Playground</p>
        </div>
        <Button variant="neon" size="sm" onClick={() => navigate('/book')}>
          Book Now <ArrowRight size={15} />
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <TrendingUp size={14} className="text-[#7CFC00]" />
            </div>
            <div className="text-3xl font-black text-white mb-1">{s.value}</div>
            <div className="text-white/50 text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Upcoming Bookings</h2>
            <button onClick={() => navigate('/dashboard/my-bookings')} className="text-[#7CFC00] text-xs hover:underline">
              View all
            </button>
          </div>
          {loading ? <LoadingSpinner size={24} /> : upcoming.length === 0 ? (
            <EmptyState icon={<Calendar size={24} />} title="No upcoming bookings" action={{ label: 'Book a Slot', onClick: () => navigate('/book') }} />
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div>
                    <div className="text-white text-sm font-semibold">{new Date(b.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-white/40 text-xs">{b.slots[0]?.startTime} – {b.slots[b.slots.length - 1]?.endTime} · {b.slots.length}h</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h2 className="text-white font-bold mb-4">Membership Status</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-black text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-white font-semibold">{user?.name}</div>
              <TierBadge tier={user?.membershipTier || 'free'} />
            </div>
          </div>
          {user?.membershipTier === 'free' && (
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-white/60 text-sm mb-3">Upgrade for exclusive discounts & priority booking</p>
              <Button variant="pink" size="sm" onClick={() => navigate('/dashboard/membership')}>
                Upgrade Now
              </Button>
            </div>
          )}
          <div className="text-xs text-white/30 mt-2">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

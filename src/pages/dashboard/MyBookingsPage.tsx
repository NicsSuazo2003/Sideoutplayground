import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { getUserBookings, cancelBooking } from '../../services/bookingService';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Booking } from '../../types';

export function MyBookingsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserBookings(user.id).then(bks => { setBookings(bks); setLoading(false); });
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled' || b.status === 'completed');
  const list = tab === 'upcoming' ? upcoming : past;

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Bookings</h1>
        <p className="text-white/50 text-sm mt-1">Manage your court reservations</p>
      </div>

      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${tab === t ? 'bg-[#7CFC00] text-black' : 'text-white/50 hover:text-white'}`}
          >
            {t} {t === 'upcoming' ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : list.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          description={tab === 'upcoming' ? 'Book your first slot to get started!' : undefined}
          action={tab === 'upcoming' ? { label: 'Book a Slot', onClick: () => navigate('/book') } : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {list.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#7CFC00]/10 flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-[#7CFC00]" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-white/50 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {booking.slots[0]?.startTime} – {booking.slots[booking.slots.length - 1]?.endTime}
                      </span>
                      <span>·</span>
                      <span>{booking.slots.length} {booking.slots.length === 1 ? 'hour' : 'hours'}</span>
                      <span>·</span>
                      <span>${booking.totalAmount}</span>
                    </div>
                    <div className="text-white/30 text-xs mt-1">#{booking.id} · {booking.paymentMethod.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <StatusBadge status={booking.status} />
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={cancelling === booking.id}
                      onClick={() => handleCancel(booking.id)}
                    >
                      <X size={14} /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

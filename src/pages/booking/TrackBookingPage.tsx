import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, Hash, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackBooking } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import type { Booking } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function TrackBookingPage() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) {
      toast.error('Enter both reference code and email');
      return;
    }
    setLoading(true);
    try {
      const result = await trackBooking(reference.trim(), email.trim());
      setBooking(result);
    } catch {
      toast.error('Booking not found. Check your reference and email.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Track Your Booking</h1>
          <p className="text-white/50 text-sm mt-2">Enter your booking reference and email to check your reservation status.</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleTrack} className="glass-card p-6 space-y-4 mb-6">
          <Input label="Booking Reference" placeholder="SOP-20260001" value={reference}
            onChange={e => setReference(e.target.value.toUpperCase())} leftIcon={<Hash size={16} />} />
          <Input label="Email Address" type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} />} />
          <Button variant="neon" size="lg" className="w-full" loading={loading} type="submit">
            <Search size={16} /> Track Booking
          </Button>
        </motion.form>

        {booking && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Booking Details</h2>
              <StatusBadge status={booking.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/60"><Hash size={14} className="text-[#7CFC00]" />{booking.referenceCode}</div>
              <div className="flex items-center gap-2 text-white/60"><User size={14} className="text-[#7CFC00]" />{booking.customerName}</div>
              <div className="flex items-center gap-2 text-white/60"><Calendar size={14} className="text-[#7CFC00]" />{new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="flex items-center gap-2 text-white/60"><Clock size={14} className="text-[#7CFC00]" />{booking.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({booking.slots.length}h)</div>
            </div>
            {booking.status === 'pending' && (
              <div className="glass rounded-xl p-3 text-xs text-yellow-400/80 mt-2">
                Your booking is pending confirmation. The admin will review and confirm it shortly.
              </div>
            )}
            {booking.status === 'confirmed' && (
              <div className="glass rounded-xl p-3 text-xs text-green-400/80 mt-2">
                Your booking is confirmed! Please pay at the venue before your session.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
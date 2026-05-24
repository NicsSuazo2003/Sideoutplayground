import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, DollarSign, CalendarPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import type { Booking } from '../../types';

export function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking?: Booking })?.booking;

  if (!booking) { navigate('/book'); return null; }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7CFC00]/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-md w-full relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#7CFC00]/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-[#7CFC00]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Booking Confirmed</div>
          <h1 className="text-4xl font-black text-white mb-2">Court Reserved!</h1>
          <p className="text-white/50 mb-8">You're all set. See you on the court!</p>

          <div className="glass-card p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">
                {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">
                {booking.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => s.startTime).join(', ')} ({booking.slots.length}h)
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">${booking.totalAmount.toFixed(2)} via {booking.paymentMethod.toUpperCase()}</span>
            </div>
            <div className="border-t border-white/8 pt-3">
              <span className="text-xs text-white/30">Booking ID: {booking.id}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" size="lg" className="w-full" onClick={() => toast.success('Calendar invite sent!')}>
              <CalendarPlus size={16} /> Add to Calendar
            </Button>
            <Button variant="neon" size="lg" className="w-full" onClick={() => navigate('/dashboard/my-bookings')}>
              View My Bookings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

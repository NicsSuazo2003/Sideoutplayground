import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Hash, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import type { Booking } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking?: Booking })?.booking;

  if (!booking) { navigate('/book'); return null; }

  const copyReference = () => {
    navigator.clipboard.writeText(booking.referenceCode);
    toast.success('Reference copied!');
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-teal-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {/* Parking Reminder */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛵</span>
              <div className="text-left">
                <p className="text-amber-800 font-bold text-sm">Strictly No Car Parking Inside</p>
                <p className="text-amber-600 text-xs mt-0.5">Motorcycle parking only. Please park your car outside the venue.</p>
              </div>
            </div>
          </div>

          {/* Email Reminder */}
<div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 mb-6">
  <div className="flex items-start gap-3">
    <span className="text-2xl">📧</span>
    <div className="text-left">
      <p className="text-blue-800 font-bold text-sm">Check Your Email</p>
      <p className="text-blue-600 text-xs mt-0.5">
        We'll send a confirmation email once the admin verifies your payment. 
        You can also track your booking status anytime.
      </p>
    </div>
  </div>
</div>

          <div className="text-teal-600 text-sm font-bold tracking-widest uppercase mb-2">
            {booking.status === 'payment_submitted' ? 'Payment Submitted' : 'Booking Created'}
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            {booking.status === 'payment_submitted' ? 'Awaiting Verification' : 'Reservation Received!'}
          </h1>
          <p className="text-slate-500 mb-6">
            {booking.status === 'payment_submitted'
              ? 'Your payment proof has been submitted. Admin will verify shortly.'
              : 'Complete your payment to confirm your slot.'}
          </p>

          {/* Reference Code */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6 inline-block">
            <div className="text-slate-400 text-xs mb-1">Booking Reference</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-teal-600 tracking-wider">{booking.referenceCode}</span>
              <button onClick={copyReference} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-600">{new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-600">{booking.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({booking.slots.length}h)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-600">₱{booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="neon" size="lg" className="w-full" onClick={() => navigate('/track')}>
              Track My Booking
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
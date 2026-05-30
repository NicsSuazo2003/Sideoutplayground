import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Hash, Copy, Smartphone } from 'lucide-react';
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

  const copyGcash = () => {
    navigator.clipboard.writeText('09058100973');
    toast.success('GCash number copied!');
  };

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
          <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Booking Created</div>
          <h1 className="text-4xl font-black text-white mb-2">Reservation Received!</h1>
          <p className="text-white/50 mb-6">Complete your GCash payment to confirm your slot.</p>

          {/* Reference Code */}
          <div className="glass-card p-4 mb-4 inline-block">
            <div className="text-white/40 text-xs mb-1">Booking Reference</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#7CFC00] tracking-wider">{booking.referenceCode}</span>
              <button onClick={copyReference} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* GCash Payment Info */}
          <div className="glass-card p-4 mb-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Smartphone size={16} className="text-[#7CFC00]" />
              <span className="text-white font-semibold">Pay via GCash</span>
            </div>
            <div className="text-white/50 text-sm">
              Send <strong className="text-white">₱{booking.totalAmount.toFixed(2)}</strong> to:
            </div>
            <div className="flex items-center justify-between glass rounded-lg p-2">
              <span className="text-white font-bold">09058100973</span>
              <button onClick={copyGcash} className="text-xs text-[#7CFC00] hover:underline">Copy</button>
            </div>
            <p className="text-xs text-[#FF1493]">
              ⚠️ Put reference <strong>{booking.referenceCode}</strong> in your GCash message!
            </p>
          </div>

          <div className="glass-card p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">{new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">{booking.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({booking.slots.length}h)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash size={16} className="text-[#7CFC00] shrink-0" />
              <span className="text-white/70">₱{booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="neon" size="lg" className="w-full" onClick={() => navigate('/track')}>
              Upload Payment Screenshot
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
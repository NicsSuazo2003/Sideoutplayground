import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Calendar, Clock, ArrowLeft, User, Mail, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { Button } from '../../components/ui/Button';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { court, selectedDate, selectedSlots, customerName, customerEmail, customerPhone, notes, createBooking, clearSelection } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min in seconds
 const timerRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (selectedSlots.length === 0 || !customerName || !customerEmail) navigate('/book');
  }, []);

  useEffect(() => {
    if (booking) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast.error('Payment time expired. Slot released.');
            navigate('/book');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [booking]);

  if (selectedSlots.length === 0) return null;

  const pricePerHour = court?.pricePerHour || 20;
  const total = selectedSlots.reduce((sum, s) => sum + (s.price || pricePerHour), 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    try {
      const result = await createBooking({
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total,
        notes: notes || undefined,
      });
      setBooking(result);
      toast.success('Booking created! Pay within 30 minutes.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const copyGcash = () => {
    navigator.clipboard.writeText('09058100973');
    toast.success('GCash number copied!');
  };

  const copyReference = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.referenceCode);
      toast.success('Reference copied!');
    }
  };

  if (booking) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <Smartphone size={40} className="text-[#7CFC00] mx-auto" />
            <h2 className="text-xl font-black text-white">Pay via GCash</h2>
            
            <div className="glass rounded-xl p-4 text-sm space-y-2">
              <div className="text-white/50">Send exactly</div>
              <div className="text-3xl font-black text-[#7CFC00]">₱{total.toFixed(2)}</div>
              <div className="text-white/50">to</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-white">09058100973</span>
                <button onClick={copyGcash} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"><Copy size={14} /></button>
              </div>
              <div className="text-white/50">Reference</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-[#FF1493]">{booking.referenceCode}</span>
                <button onClick={copyReference} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"><Copy size={14} /></button>
              </div>
              <p className="text-xs text-[#FF1493] mt-2">⚠️ Put this reference in your GCash message!</p>
            </div>

            {/* Countdown */}
            <div className={`glass rounded-xl p-4 ${timeLeft <= 60 ? 'border-[#FF1493]/40' : timeLeft <= 300 ? 'border-yellow-500/40' : ''}`}>
              <div className="text-white/50 text-xs mb-1">Time Remaining</div>
              <div className={`text-2xl font-black ${timeLeft <= 60 ? 'text-[#FF1493]' : 'text-[#7CFC00]'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all ${timeLeft <= 60 ? 'bg-[#FF1493]' : 'bg-[#7CFC00]'}`}
                  style={{ width: `${(timeLeft / 1800) * 100}%` }} />
              </div>
            </div>

            <p className="text-white/40 text-xs">
              After paying, upload your screenshot on the Track Booking page using your reference code.
            </p>

            <Button variant="neon" size="lg" className="w-full" onClick={() => { clearSelection(); navigate('/book/success', { state: { booking } }); }}>
              Done
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/book')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h2 className="text-white font-bold mb-4">Booking Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/60"><User size={14} className="text-[#7CFC00]" /> {customerName}</div>
              <div className="flex items-center gap-2 text-sm text-white/60"><Mail size={14} className="text-[#7CFC00]" /> {customerEmail}</div>
              {customerPhone && <div className="text-sm text-white/60 pl-6">📱 {customerPhone}</div>}
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar size={14} className="text-[#7CFC00]" />
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock size={14} className="text-[#7CFC00]" />
                {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({selectedSlots.length}h)
              </div>
            </div>
            <div className="border-t border-white/8 pt-4">
              <div className="flex justify-between font-black text-base">
                <span className="text-white">{selectedSlots.length}h</span>
                <span className="text-[#7CFC00]">₱{total}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 space-y-4">
            <h2 className="text-white font-bold">GCash Payment</h2>
            <div className="glass rounded-xl p-4 text-white/60 text-sm">
              <Smartphone size={20} className="text-[#7CFC00] mb-2" />
              <p>Pay <strong className="text-white">₱{total.toFixed(2)}</strong> via GCash to proceed with your booking.</p>
              <p className="mt-2 text-xs text-white/40">You'll have 30 minutes to complete the payment.</p>
            </div>
            <Button variant="neon" size="lg" className="w-full" loading={loading} onClick={handleCreateBooking}>
              Confirm & Pay via GCash · ₱{total.toFixed(2)}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, Calendar, Clock, ArrowLeft, User, Mail } from 'lucide-react';
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

  useEffect(() => {
    if (selectedSlots.length === 0 || !customerName || !customerEmail) navigate('/book');
  }, []);

  if (selectedSlots.length === 0) return null;

  const pricePerHour = court?.pricePerHour || 20;
  const total = selectedSlots.length * pricePerHour;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const booking = await createBooking({
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total,
        notes: notes || undefined,
      });
      clearSelection();
      navigate('/book/success', { state: { booking } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center gap-2 text-sm text-white/60">
                <User size={14} className="text-[#7CFC00]" /> {customerName}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="text-[#7CFC00]" /> {customerEmail}
              </div>
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
                <span className="text-white">{selectedSlots.length} {selectedSlots.length === 1 ? 'hour' : 'hours'}</span>
                <span className="text-[#7CFC00]">₱{total}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 space-y-4">
            <h2 className="text-white font-bold">Confirm Booking</h2>
            <div className="glass rounded-xl p-4 text-white/60 text-sm">
              <Banknote size={20} className="text-[#7CFC00] mb-2" />
              <p>Please pay <strong className="text-white">₱{total.toFixed(2)}</strong> at the venue front desk before your session starts.</p>
              <p className="mt-2 text-xs text-white/40">Your booking will be marked as pending until confirmed by admin.</p>
            </div>
            <Button variant="neon" size="lg" className="w-full" loading={loading} onClick={handleConfirm}>
              Confirm Booking · ₱{total.toFixed(2)}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
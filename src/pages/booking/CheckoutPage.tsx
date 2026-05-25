import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { processPayment } from '../../services/paymentService';
import { Button } from '../../components/ui/Button';
import type { PaymentMethod } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { court, selectedDate, selectedSlots, createBooking, clearSelection } = useBookingStore();
  const { user } = useAuthStore();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSlots.length === 0) navigate('/book');
  }, [selectedSlots.length, navigate]);

  if (selectedSlots.length === 0) return null;

  const pricePerHour = court?.pricePerHour || 20;
  const total = selectedSlots.length * pricePerHour;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bookingId = `bk-${Date.now()}`;
      await processPayment({ method, amount: total, bookingId });
      const booking = await createBooking({
        userId: user!.id,
        userName: user!.name,
        userEmail: user!.email,
        date: selectedDate,
        slots: selectedSlots,
        totalAmount: total,
        status: 'confirmed',
        paymentMethod: method,
      });
      clearSelection();
      navigate('/book/success', { state: { booking } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const methods: { id: PaymentMethod; icon: typeof CreditCard; label: string; desc: string; available: boolean }[] = [
    { id: 'cash', icon: Banknote, label: 'Cash', desc: 'Pay at the venue', available: true },
    { id: 'gcash', icon: Smartphone, label: 'GCash', desc: 'Coming soon', available: false },
    { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Coming soon', available: false },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/book')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to booking
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-4">Booking Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Calendar size={14} className="text-[#7CFC00]" />
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock size={14} className="text-[#7CFC00]" />
{selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({selectedSlots.length}h)                </div>
              </div>
              <div className="border-t border-white/8 pt-4">
                <div className="flex justify-between font-black text-base">
                  <span className="text-white">{selectedSlots.length} {selectedSlots.length === 1 ? 'hour' : 'hours'}</span>
                  <span className="text-[#7CFC00]">₱{total}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-4">Payment Method</h2>
              <div className="space-y-2">
                {methods.map(m => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all border ${
                      !m.available
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : method === m.id
                        ? 'border-[#7CFC00]/40 bg-[#7CFC00]/8 cursor-pointer'
                        : 'border-white/8 hover:border-white/15 cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      value={m.id}
                      checked={method === m.id}
                      onChange={() => m.available && setMethod(m.id)}
                      disabled={!m.available}
                      className="accent-[#7CFC00]"
                    />
                    <m.icon size={18} className={method === m.id && m.available ? 'text-[#7CFC00]' : 'text-white/40'} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {m.label}
                        {!m.available && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF1493]/15 text-[#FF1493] border border-[#FF1493]/30 font-bold">
                            COMING SOON
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 space-y-4">
              <h2 className="text-white font-bold">Payment Details</h2>

              <div className="glass rounded-xl p-4 text-white/60 text-sm">
                <Banknote size={20} className="text-[#7CFC00] mb-2" />
                <p>Please pay <strong className="text-white">₱{total.toFixed(2)}</strong> at the venue front desk before your session starts.</p>
              </div>

              <Button variant="neon" size="lg" className="w-full" loading={loading} onClick={handleConfirm}>
                Confirm Booking · ₱{total.toFixed(2)}
              </Button>
              <p className="text-xs text-white/30 text-center">Pay at the venue. Your slot is reserved upon confirmation.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
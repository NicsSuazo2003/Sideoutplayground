import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { processPayment } from '../../services/paymentService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { PaymentMethod } from '../../types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { court, selectedDate, selectedSlots, createBooking, clearSelection } = useBookingStore();
  const { user } = useAuthStore();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [gcashNum, setGcashNum] = useState('');

  if (selectedSlots.length === 0) { navigate('/book'); return null; }

  const discount = user?.membershipTier === 'gold' ? 0.10 : user?.membershipTier === 'silver' ? 0.08 : user?.membershipTier === 'bronze' ? 0.05 : 0;
  const pricePerHour = court?.pricePerHour || 20;
  const subtotal = selectedSlots.length * pricePerHour;
  const discountAmt = Math.round(subtotal * discount * 100) / 100;
  const total = subtotal - discountAmt;

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleConfirm = async () => {
    if (method === 'card' && cardNum.replace(/\s/g, '').length < 16) { toast.error('Enter a valid card number'); return; }
    if (method === 'gcash' && gcashNum.length < 10) { toast.error('Enter a valid GCash number'); return; }
    setLoading(true);
    try {
      const bookingId = `bk-${Date.now()}`;
      await processPayment({ method, amount: total, bookingId, cardNumber: cardNum, cardExpiry, cardCvv, gcashNumber: gcashNum });
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

  const methods: { id: PaymentMethod; icon: typeof CreditCard; label: string; desc: string }[] = [
    { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, etc.' },
    { id: 'gcash', icon: Smartphone, label: 'GCash', desc: 'Pay via GCash e-wallet' },
    { id: 'cash', icon: Banknote, label: 'Cash', desc: 'Pay at the venue' },
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
                  {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => s.startTime).join(', ')} ({selectedSlots.length}h)
                </div>
              </div>
              <div className="border-t border-white/8 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="text-white">${subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-[#7CFC00]">Member Discount</span><span className="text-[#7CFC00]">-${discountAmt.toFixed(2)}</span></div>}
                <div className="flex justify-between font-black text-base border-t border-white/8 pt-2"><span className="text-white">Total</span><span className="text-[#7CFC00]">${total.toFixed(2)}</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-4">Payment Method</h2>
              <div className="space-y-2">
                {methods.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${method === m.id ? 'border-[#7CFC00]/40 bg-[#7CFC00]/8' : 'border-white/8 hover:border-white/15'}`}>
                    <input type="radio" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#7CFC00]" />
                    <m.icon size={18} className={method === m.id ? 'text-[#7CFC00]' : 'text-white/40'} />
                    <div>
                      <div className="text-sm font-semibold text-white">{m.label}</div>
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
              {method === 'card' && (
                <>
                  <Input label="Card Number" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} leftIcon={<CreditCard size={16} />} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Expiry" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} />
                    <Input label="CVV" placeholder="123" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.slice(0, 3))} />
                  </div>
                </>
              )}
              {method === 'gcash' && (
                <Input label="GCash Number" placeholder="+63 9XX XXX XXXX" value={gcashNum} onChange={e => setGcashNum(e.target.value)} leftIcon={<Smartphone size={16} />} />
              )}
              {method === 'cash' && (
                <div className="glass rounded-xl p-4 text-white/60 text-sm">
                  <Banknote size={20} className="text-[#7CFC00] mb-2" />
                  <p>Please pay <strong className="text-white">${total.toFixed(2)}</strong> at the venue front desk before your session starts. Your booking will be confirmed upon payment.</p>
                </div>
              )}

              <Button variant="neon" size="lg" className="w-full" loading={loading} onClick={handleConfirm}>
                Confirm Payment · ${total.toFixed(2)}
              </Button>
              <p className="text-xs text-white/30 text-center">Your slot will be reserved immediately upon payment confirmation.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

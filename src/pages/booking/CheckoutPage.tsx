import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Calendar, Clock, ArrowLeft, User, Mail, Copy, Upload, CheckCircle2, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { Button } from '../../components/ui/Button';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const GCASH_NUMBER = '09058100973';
const GCASH_NAME = 'Side Out Playground';
const PAYMENT_MINUTES = 15;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { court, selectedDate, selectedSlots, customerName, customerEmail, customerPhone, notes, createBooking, clearSelection } = useBookingStore();
  const [step, setStep] = useState<'summary' | 'payment' | 'upload'>('summary');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_MINUTES * 60);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (selectedSlots.length === 0 || !customerName || !customerEmail) navigate('/book');
  }, []);

  useEffect(() => {
    if (step === 'payment' && booking) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast.error('Payment time expired. Slot released.');
            clearSelection();
            navigate('/book');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, booking]);

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
      setStep('payment');
      toast.success('Booking created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const copyGcash = () => {
    navigator.clipboard.writeText(GCASH_NUMBER);
    toast.success('GCash number copied!');
  };

  const copyReference = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.referenceCode);
      toast.success('Reference copied!');
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshot || !booking) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${booking.id}/upload-payment`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Payment proof uploaded!');
        clearSelection();
        navigate('/book/success', { state: { booking: await res.json() } });
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // STEP 1: Summary
  if (step === 'summary') {
    return (
      <div className="pt-16 min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Booking Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Court</span><span className="text-white">{court?.name || 'Court'}</span></div>
              <div className="flex justify-between">
                <span className="text-white/50">Schedule</span>
                <span className="text-white text-right">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  , {selectedSlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-white/50">Guest</span><span className="text-white">{customerName}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Email</span><span className="text-white">{customerEmail}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/8">
                <span className="text-white/50">Total Amount</span>
                <span className="text-[#7CFC00] font-bold text-lg">₱{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="glass rounded-xl p-3 text-center">
              <div className="text-yellow-400 text-sm font-semibold">⏳ Awaiting Payment</div>
              <p className="text-white/50 text-xs mt-1">Complete payment to confirm your booking.</p>
              <p className="text-white/40 text-xs mt-2">Pay within <strong className="text-white">{PAYMENT_MINUTES} minutes</strong></p>
            </div>

            <Button variant="neon" size="lg" className="w-full" loading={loading} onClick={handleCreateBooking}>
              Pay Now · ₱{total.toFixed(2)}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 2: Payment Method
  if (step === 'payment') {
    return (
      <div className="pt-16 min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs">
            <span className="w-5 h-5 rounded-full bg-[#7CFC00] text-black flex items-center justify-center font-bold">1</span>
            <span className="text-[#7CFC00] font-semibold">Payment Method</span>
            <span className="text-white/20">→</span>
            <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 flex items-center justify-center">2</span>
            <span className="text-white/50">Pay</span>
            <span className="text-white/20">→</span>
            <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 flex items-center justify-center">3</span>
            <span className="text-white/50">Upload Proof</span>
          </div>

          {/* Countdown */}
          <div className={`glass rounded-xl p-3 mb-4 text-center ${timeLeft <= 60 ? 'border-[#FF1493]/40' : ''}`}>
            <div className="text-white/50 text-xs">Pay within</div>
            <div className={`text-2xl font-black ${timeLeft <= 60 ? 'text-[#FF1493]' : 'text-[#7CFC00]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <h2 className="text-white font-bold">Choose a payment method</h2>
            <p className="text-white/50 text-sm">Select how you'd like to pay the <strong className="text-white">₱{total.toFixed(2)}</strong> total.</p>

            {/* GCash Option */}
            <label className="flex items-center gap-4 p-4 rounded-xl border border-[#7CFC00]/40 bg-[#7CFC00]/8 cursor-pointer">
              <input type="radio" checked readOnly className="accent-[#7CFC00]" />
              <Smartphone size={20} className="text-[#7CFC00]" />
              <div>
                <div className="text-white font-semibold text-sm">GCash</div>
                <div className="text-white/50 text-xs">{GCASH_NUMBER}</div>
                <div className="text-white/40 text-xs">{GCASH_NAME}</div>
              </div>
            </label>

            <Button variant="neon" size="lg" className="w-full" onClick={() => setStep('upload')}>
              Continue
            </Button>

            <button onClick={() => setStep('summary')} className="w-full text-center text-white/40 text-xs hover:text-white">
              ← Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 3: Upload Proof
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 text-xs">
          <span className="w-5 h-5 rounded-full bg-[#7CFC00] text-black flex items-center justify-center font-bold">✓</span>
          <span className="text-[#7CFC00] font-semibold">Payment Method</span>
          <span className="text-white/20">→</span>
          <span className="w-5 h-5 rounded-full bg-[#7CFC00] text-black flex items-center justify-center font-bold">✓</span>
          <span className="text-[#7CFC00] font-semibold">Pay</span>
          <span className="text-white/20">→</span>
          <span className="w-5 h-5 rounded-full bg-[#7CFC00] text-black flex items-center justify-center font-bold">3</span>
          <span className="text-[#7CFC00] font-semibold">Upload Proof</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h2 className="text-white font-bold">Upload Payment Proof</h2>

          <div className="glass rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-white/50">Amount:</span><span className="text-white">₱{total.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span className="text-white/50">GCash:</span>
              <span className="text-white">{GCASH_NUMBER} <button onClick={copyGcash} className="text-[#7CFC00] text-xs ml-1">Copy</button></span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Reference:</span>
              <span className="text-[#FF1493]">{booking?.referenceCode} <button onClick={copyReference} className="text-[#7CFC00] text-xs ml-1">Copy</button></span>
            </div>
          </div>

          {/* Upload */}
          <div className="glass rounded-xl p-6 text-center space-y-3">
            {screenshot ? (
              <div>
                <CheckCircle2 size={32} className="text-[#7CFC00] mx-auto mb-2" />
                <p className="text-white text-sm">{screenshot.name}</p>
                <button onClick={() => setScreenshot(null)} className="text-xs text-white/40 hover:text-white mt-1">Remove</button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/15 rounded-xl p-6 cursor-pointer hover:border-[#7CFC00]/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <Upload size={28} className="text-white/30 mx-auto mb-2" />
                <p className="text-white/50 text-sm">Tap to upload screenshot</p>
                <p className="text-white/30 text-xs mt-1">GCash receipt or payment confirmation</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) setScreenshot(e.target.files[0]); }} />
          </div>

          <Button variant="neon" size="lg" className="w-full" loading={uploading}
            disabled={!screenshot} onClick={handleUploadScreenshot}>
            Submit Payment Proof
          </Button>

          <button onClick={() => setStep('payment')} className="w-full text-center text-white/40 text-xs hover:text-white">
            ← Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
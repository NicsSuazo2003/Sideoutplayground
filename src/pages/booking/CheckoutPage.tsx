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
        customerName, customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total, notes: notes || undefined,
      });
      setBooking(result);
      setStep('payment');
      toast.success('Booking created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally { setLoading(false); }
  };

  const copyGcash = () => { navigator.clipboard.writeText(GCASH_NUMBER); toast.success('GCash number copied!'); };
  const copyReference = () => { if (booking) { navigator.clipboard.writeText(booking.referenceCode); toast.success('Reference copied!'); } };

  const handleUploadScreenshot = async () => {
    if (!screenshot || !booking) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${booking.id}/upload-payment`, { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('Payment proof uploaded!');
        clearSelection();
        navigate('/book/success', { state: { booking: await res.json() } });
      } else { toast.error('Upload failed'); }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const cardClass = "bg-white border border-slate-200 rounded-2xl shadow-sm p-6";
  const headingClass = "text-slate-800 font-bold text-lg";

  // STEP 1: Summary
  if (step === 'summary') {
    return (
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} space-y-4`}>
            <h2 className={headingClass}>Booking Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Court</span><span className="text-slate-800">{court?.name || 'Court'}</span></div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule</span>
                <span className="text-slate-800 text-right">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  , {selectedSlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Guest</span><span className="text-slate-800">{customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-800">{customerEmail}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Total Amount</span>
                <span className="text-teal-600 font-bold text-lg">₱{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
              <div className="text-amber-600 text-sm font-semibold">⏳ Awaiting Payment</div>
              <p className="text-slate-500 text-xs mt-1">Complete payment to confirm your booking.</p>
              <p className="text-slate-400 text-xs mt-2">Pay within <strong className="text-slate-700">{PAYMENT_MINUTES} minutes</strong></p>
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
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6 text-xs">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">1</span>
            <span className="text-teal-600 font-semibold">Payment Method</span>
            <span className="text-slate-300">→</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">2</span>
            <span className="text-slate-500">Pay</span>
            <span className="text-slate-300">→</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">3</span>
            <span className="text-slate-500">Upload Proof</span>
          </div>

          <div className={`rounded-xl p-3 mb-4 text-center border ${timeLeft <= 60 ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
            <div className="text-slate-500 text-xs">Pay within</div>
            <div className={`text-2xl font-black ${timeLeft <= 60 ? 'text-red-500' : 'text-teal-600'}`}>{formatTime(timeLeft)}</div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} space-y-4`}>
            <h2 className={headingClass}>Choose a payment method</h2>
            <p className="text-slate-500 text-sm">Select how you'd like to pay the <strong className="text-slate-800">₱{total.toFixed(2)}</strong> total.</p>

            <label className="flex items-center gap-4 p-4 rounded-xl border border-teal-300 bg-teal-50 cursor-pointer">
              <input type="radio" checked readOnly className="accent-teal-600" />
              <Smartphone size={20} className="text-teal-600" />
              <div>
                <div className="text-slate-800 font-semibold text-sm">GCash</div>
                <div className="text-slate-500 text-xs">{GCASH_NUMBER}</div>
                <div className="text-slate-400 text-xs">{GCASH_NAME}</div>
              </div>
            </label>

            <Button variant="neon" size="lg" className="w-full" onClick={() => setStep('upload')}>Continue</Button>
            <button onClick={() => setStep('summary')} className="w-full text-center text-slate-400 text-xs hover:text-slate-600">← Back</button>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 3: Upload Proof
  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-xs">
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">✓</span>
          <span className="text-teal-600 font-semibold">Payment Method</span>
          <span className="text-slate-300">→</span>
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">✓</span>
          <span className="text-teal-600 font-semibold">Pay</span>
          <span className="text-slate-300">→</span>
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">3</span>
          <span className="text-teal-600 font-semibold">Upload Proof</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} space-y-4`}>
          <h2 className={headingClass}>Upload Payment Proof</h2>
          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="text-slate-800">₱{total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">GCash:</span><span className="text-slate-800">{GCASH_NUMBER} <button onClick={copyGcash} className="text-teal-600 text-xs ml-1 hover:underline">Copy</button></span></div>
            <div className="flex justify-between"><span className="text-slate-500">Reference:</span><span className="text-amber-600">{booking?.referenceCode} <button onClick={copyReference} className="text-teal-600 text-xs ml-1 hover:underline">Copy</button></span></div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 text-center space-y-3 border-2 border-dashed border-slate-200">
            {screenshot ? (
              <div>
                <CheckCircle2 size={32} className="text-teal-600 mx-auto mb-2" />
                <p className="text-slate-800 text-sm">{screenshot.name}</p>
                <button onClick={() => setScreenshot(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-1">Remove</button>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Tap to upload screenshot</p>
                <p className="text-slate-400 text-xs mt-1">GCash receipt or payment confirmation</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setScreenshot(e.target.files[0]); }} />
          </div>

          <Button variant="neon" size="lg" className="w-full" loading={uploading} disabled={!screenshot} onClick={handleUploadScreenshot}>
            Submit Payment Proof
          </Button>
          <button onClick={() => setStep('payment')} className="w-full text-center text-slate-400 text-xs hover:text-slate-600">← Back</button>
        </motion.div>
      </div>
    </div>
  );
}
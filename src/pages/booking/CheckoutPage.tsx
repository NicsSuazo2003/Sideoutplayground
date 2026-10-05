import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Calendar,
  Clock,
  ArrowLeft,
  User,
  Mail,
  Copy,
  Check,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { trackBooking } from '../../services/bookingService';
import {
  savePendingBooking,
  clearPendingBooking,
  getPendingBooking,
} from '../../hooks/usePendingBooking';
import type { Booking } from '../../types';

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
  const {
    court,
    selectedDate,
    selectedSlots,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    createBooking,
    clearSelection,
  } = useBookingStore();

  const [step, setStep] = useState<'summary' | 'payment' | 'upload'>('summary');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_MINUTES * 60);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // ─────────────────────────────────────────────────────────────
  // Restore-on-refresh: if store is empty but a pending booking
  // exists in localStorage, rehydrate and jump straight to payment.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Already have in-memory booking (came from step 1)
    if (booking) {
      setRestoring(false);
      return;
    }

    // Store still has slots + customer info — normal flow, no restore needed
    if (selectedSlots.length > 0 && customerName && customerEmail) {
      setRestoring(false);
      return;
    }

    const pending = getPendingBooking();
    if (!pending) {
      setRestoring(false);
      navigate('/book');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const fetched = await trackBooking(pending.reference, pending.email);
        if (cancelled) return;

        if (fetched.status !== 'pending_payment') {
          // Already paid, expired, cancelled — nothing to resume.
          clearPendingBooking();
          navigate('/book');
          return;
        }

        // Sync local timer to backend's authoritative expiry
        setBooking(fetched);
        if (fetched.paymentExpiresAt) {
          const expiresAt = new Date(fetched.paymentExpiresAt).getTime();
          setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
        }
        setStep('payment');
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to restore pending booking:', err);
        clearPendingBooking();
        navigate('/book');
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the hold has already expired on mount (e.g. rehydrated from ref)
  useEffect(() => {
    if (!booking?.paymentExpiresAt) return;
    const expiresAt = new Date(booking.paymentExpiresAt).getTime();
    if (Date.now() >= expiresAt) {
      clearPendingBooking();
      toast.error('Payment window expired. Slot released.');
      clearSelection();
      navigate('/book');
    }
  }, [booking, clearSelection, navigate]);

  // Timer lifecycle during payment / upload phases
  useEffect(() => {
    if ((step === 'payment' || step === 'upload') && booking) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearPendingBooking();
            toast.error('Payment window expired. Slot released.');
            clearSelection();
            navigate('/book');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, booking, clearSelection, navigate]);

  // Clean object URL memory
  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  // Guard render: show spinner while restoring, null only if truly empty
  if (restoring && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-3 text-xs text-slate-400">Restoring your booking…</p>
        </div>
      </div>
    );
  }

  if (selectedSlots.length === 0 && !booking) return null;

  const pricePerHour = court?.pricePerHour || 20;
  const total = booking
    ? booking.totalAmount
    : selectedSlots.reduce((sum, s) => sum + (s.price || pricePerHour), 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    try {
      const result = await createBooking({
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: selectedSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total,
        notes: notes || undefined,
      });
      setBooking(result);

      // 🔵 Save ref + email so we can restore on refresh
      if (result.referenceCode) {
  savePendingBooking(result.referenceCode, result.customerEmail || customerEmail);
}

      // Sync local timer with backend's authoritative expiry time
      if (result.paymentExpiresAt) {
        const expiresAt = new Date(result.paymentExpiresAt).getTime();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setTimeLeft(secondsLeft);
      }

      setStep('payment');
      toast.success('Reservation held! Complete GCash transfer.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshot || !booking) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/${booking.id}/upload-payment`,
        { method: 'POST', body: formData }
      );
      if (res.ok) {
        clearPendingBooking();
        const updated = await res.json();
        toast.success('Receipt verified! Booking confirmed.');
        clearSelection();
        navigate('/book/success', { state: { booking: updated } });
      } else {
        toast.error('Upload failed. Try again.');
      }
    } catch {
      toast.error('Upload failed. Check your internet connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20">
      {/* Mobile Sticky Step & Timer Header */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
              {step === 'summary' ? '1' : step === 'payment' ? '2' : '3'}
            </span>
            <span className="text-xs font-bold text-slate-800 capitalize">
              {step === 'summary' ? 'Review Summary' : step === 'payment' ? 'Send GCash' : 'Upload Receipt'}
            </span>
          </div>

          {(step === 'payment' || step === 'upload') && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                timeLeft <= 120
                  ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                  : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}
            >
              <Clock size={12} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-5 sm:py-8 sm:px-6">
        {/* Desktop Step Indicators */}
        <div className="mb-6 hidden items-center justify-between sm:flex">
          {[
            { id: 'summary', num: '1', title: 'Summary' },
            { id: 'payment', num: '2', title: 'Payment' },
            { id: 'upload', num: '3', title: 'Confirmation' },
          ].map((s, idx, arr) => {
            const isDone =
              (s.id === 'summary' && step !== 'summary') ||
              (s.id === 'payment' && step === 'upload');
            const isActive = step === s.id;

            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-teal-600 text-white'
                        : isActive
                        ? 'bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check size={12} /> : s.num}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-teal-700' : isDone ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 flex-1 transition-all ${
                      isDone ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: SUMMARY */}
        {step === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">Reservation Overview</h2>
                <button
                  onClick={() => navigate('/book')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  <ArrowLeft size={13} />
                  <span>Edit slots</span>
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <Building size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                    {court?.name || 'Pickleball Court'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {court?.type === 'indoor' ? 'Indoor Court' : 'Outdoor Court'} · Tandag City
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-teal-600">₱{pricePerHour}/hr</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Time Slots</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {selectedSlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((s) => `${format12h(s.startTime)} - ${format12h(s.endTime)}`)
                      .join(', ')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Player</span>
                  <span className="font-semibold text-slate-800">{customerName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{customerEmail}</span>
                </div>

                {customerPhone && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-semibold text-slate-800">{customerPhone}</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-3">
                  <div>
                    <span className="text-sm font-bold text-slate-800">Total Payable</span>
                    <p className="text-[10px] text-slate-400">Includes court fees & lighting</p>
                  </div>
                  <span className="text-2xl font-black text-teal-600">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
              <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Hold Window Policy</p>
                <p className="mt-0.5 text-amber-700 leading-relaxed">
                  Upon clicking continue, your selected slots will be reserved for{' '}
                  <strong className="font-bold">{PAYMENT_MINUTES} minutes</strong> while you complete GCash payment.
                </p>
              </div>
            </div>

            <div className="hidden sm:block pt-2">
              <Button
                variant="neon"
                size="lg"
                className="w-full font-bold shadow-lg"
                loading={loading}
                onClick={handleCreateBooking}
                rightIcon={<ArrowRight size={16} />}
              >
                Continue to Payment · ₱{total.toFixed(2)}
              </Button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-400">Total Amount</p>
                  <p className="text-lg font-black leading-tight text-teal-600">₱{total.toFixed(2)}</p>
                </div>
                <Button
                  variant="neon"
                  size="md"
                  className="font-bold"
                  loading={loading}
                  onClick={handleCreateBooking}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Confirm & Pay
                </Button>
              </div>
            </div>
            <div className="h-16 sm:hidden" />
          </motion.div>
        )}

        {/* STEP 2: GCASH PAYMENT DETAILS */}
        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className={`hidden sm:flex items-center justify-between rounded-2xl border p-4 shadow-sm ${
                timeLeft <= 120
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-teal-200 bg-teal-50/60 text-teal-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Payment Reservation Window</p>
                  <p className="text-xs opacity-80">Slots will be released if unpaid</p>
                </div>
              </div>
              <div className="text-2xl font-black">{formatTime(timeLeft)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs shadow-sm">
                    G
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">Send via GCash</h2>
                    <p className="text-[11px] text-slate-400">Scan QR or enter account details manually</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                  Direct Express
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">GCash Mobile Number</span>
                    <p className="text-base font-extrabold text-slate-800 tracking-wide">{GCASH_NUMBER}</p>
                    <p className="text-[11px] text-slate-500">{GCASH_NAME}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(GCASH_NUMBER, 'gcash', 'GCash number')}
                    className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-teal-400 active:scale-95"
                  >
                    {copiedKey === 'gcash' ? (
                      <>
                        <Check size={14} className="text-teal-600" />
                        <span className="text-teal-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-700">Booking Reference</span>
                    <p className="text-base font-black text-teal-800 font-mono tracking-wider">
                      {booking?.referenceCode}
                    </p>
                    <p className="text-[10px] text-teal-600">Put this in the GCash message/remarks</p>
                  </div>
                  <button
                    onClick={() =>
                      booking?.referenceCode &&
                      copyToClipboard(booking.referenceCode, 'ref', 'Reference code')
                    }
                    className="flex h-9 items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 text-xs font-bold text-teal-700 shadow-sm transition hover:border-teal-400 active:scale-95"
                  >
                    {copiedKey === 'ref' ? (
                      <>
                        <Check size={14} className="text-teal-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-teal-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-800 p-3 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Exact Amount to Send</p>
                    <p className="text-xs text-slate-300">Exact centavos ensure instant match</p>
                  </div>
                  <div className="text-xl font-black text-teal-400">₱{total.toFixed(2)}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-700">Quick 3-step payment:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                  <li>Open GCash app and tap <strong>Express Send</strong></li>
                  <li>Paste <strong>{GCASH_NUMBER}</strong> and enter <strong>₱{total.toFixed(2)}</strong></li>
                  <li>Screenshot your transaction receipt and proceed</li>
                </ol>
              </div>
            </div>

            <div className="hidden sm:flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-1/3"
                onClick={() => setStep('summary')}
              >
                Back
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="w-2/3 font-bold"
                onClick={() => setStep('upload')}
                rightIcon={<ArrowRight size={16} />}
              >
                I Have Sent Payment
              </Button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setStep('summary')}
                  className="px-3"
                >
                  <ArrowLeft size={16} />
                </Button>
                <Button
                  variant="neon"
                  size="md"
                  className="flex-1 font-bold"
                  onClick={() => setStep('upload')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  I've Paid · Attach Receipt
                </Button>
              </div>
            </div>
            <div className="h-16 sm:hidden" />
          </motion.div>
        )}

        {/* STEP 3: UPLOAD PROOF */}
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">Submit GCash Receipt</h2>
                <p className="text-xs text-slate-400">
                  Upload screenshot for Booking Ref{' '}
                  <span className="font-mono font-bold text-teal-600">{booking?.referenceCode}</span>
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  screenshot
                    ? 'border-teal-500 bg-teal-50/20'
                    : 'border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <img src={previewUrl} alt="Receipt Preview" className="h-full w-full object-cover" />
                    </div>
                    <p className="max-w-[240px] truncate text-xs font-bold text-slate-800">
                      {screenshot?.name}
                    </p>
                    <span className="text-[11px] font-semibold text-teal-600 underline">
                      Tap to replace screenshot
                    </span>
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                      <Upload size={22} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 sm:text-sm">
                      Tap to select GCash Screenshot
                    </p>
                    <p className="text-[11px] text-slate-400">JPG, PNG, or WebP up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setScreenshot(e.target.files[0]);
                  }}
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100">
                <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                <span>Our admins will cross-check the reference number on your slip.</span>
              </div>
            </div>

            <div className="hidden sm:flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-1/3"
                onClick={() => setStep('payment')}
              >
                Back
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="w-2/3 font-bold"
                loading={uploading}
                disabled={!screenshot}
                onClick={handleUploadScreenshot}
                rightIcon={<CheckCircle2 size={16} />}
              >
                Confirm & Submit Proof
              </Button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setStep('payment')}
                  className="px-3"
                >
                  <ArrowLeft size={16} />
                </Button>
                <Button
                  variant="neon"
                  size="md"
                  className="flex-1 font-bold"
                  loading={uploading}
                  disabled={!screenshot}
                  onClick={handleUploadScreenshot}
                  rightIcon={<CheckCircle2 size={16} />}
                >
                  {screenshot ? 'Submit Proof' : 'Attach Proof to Submit'}
                </Button>
              </div>
            </div>
            <div className="h-16 sm:hidden" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Hash,
  Copy,
  Check,
  Mail,
  ArrowRight,
  Home,
  ShieldCheck,
  Hourglass,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { clearPendingBooking } from '../../hooks/usePendingBooking';
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
  const [copied, setCopied] = useState(false);

  // 🔵 Clear the pending ref as soon as we land here — payment proof was submitted
  useEffect(() => {
    clearPendingBooking();
  }, []);

  if (!booking) {
    navigate('/book');
    return null;
  }

  const copyReference = () => {
    navigator.clipboard.writeText(booking.referenceCode);
    setCopied(true);
    toast.success('Reference code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaymentSubmitted = booking.status === 'payment_submitted';

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24 sm:py-20 sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto max-w-lg w-full px-4 sm:px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100/90 text-teal-600 shadow-md shadow-teal-600/10 sm:h-24 sm:w-24"
        >
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 text-center"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              <Hourglass size={12} className="animate-spin" />
              {isPaymentSubmitted ? 'Payment Proof Under Review' : 'Reservation Received'}
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
              {isPaymentSubmitted ? 'Verification in Progress' : 'Booking Placed!'}
            </h1>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
              {isPaymentSubmitted
                ? 'Your payment screenshot was received. Our team will verify your GCash ref shortly.'
                : 'Complete payment within the window to guarantee your court slot.'}
            </p>
          </div>

          <div
            onClick={copyReference}
            className="group relative mx-auto flex max-w-sm cursor-pointer items-center justify-between rounded-2xl border border-teal-200 bg-teal-50/60 p-3.5 shadow-sm transition hover:border-teal-400 hover:bg-teal-50 active:scale-98"
          >
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Booking Reference
              </p>
              <p className="font-mono text-xl font-black tracking-wider text-teal-800 sm:text-2xl">
                {booking.referenceCode}
              </p>
            </div>

            <div className="flex h-9 items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-2.5 text-xs font-bold text-teal-700 shadow-sm transition group-hover:bg-teal-600 group-hover:text-white">
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm sm:p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Schedule Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="mt-0.5 text-teal-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-teal-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {booking.slots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((s) => (
                        <span
                          key={s.startTime}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700"
                        >
                          {format12h(s.startTime)} – {format12h(s.endTime)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Hash size={15} className="text-teal-600" />
                  <span className="font-medium">Total Paid</span>
                </div>
                <span className="text-lg font-black text-teal-600">
                  ₱{booking.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              What Happens Next
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-700">
                  1
                </span>
                <p>
                  <strong>Admin Verification:</strong> Our team checks your GCash reference against our bank alerts (usually &lt; 15 mins).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-700">
                  2
                </span>
                <p>
                  <strong>Email Confirmation:</strong> We send official booking details to{' '}
                  <span className="font-semibold text-slate-800">{booking.customerEmail}</span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-black text-teal-700">
                  3
                </span>
                <p>
                  <strong>Show Up &amp; Play:</strong> Show your reference code or confirmation email at the front desk upon arrival.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden gap-3 sm:flex pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/')}
              leftIcon={<Home size={16} />}
            >
              Back Home
            </Button>
            <Button
              variant="neon"
              size="lg"
              className="flex-1 font-bold shadow-md"
              onClick={() => navigate('/track')}
              rightIcon={<ArrowRight size={16} />}
            >
              Track Booking
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/')}
            className="px-3"
            aria-label="Home"
          >
            <Home size={18} />
          </Button>
          <Button
            variant="neon"
            size="md"
            className="flex-1 font-bold"
            onClick={() => navigate('/track')}
            rightIcon={<ArrowRight size={16} />}
          >
            Track My Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
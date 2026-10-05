import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  Hash,
  Wallet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/Badge';
import { usePendingBooking } from '../../hooks/usePendingBooking';
import type { TimeSlot } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDateLong(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { booking, loading } = usePendingBooking();

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24 sm:pt-20">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6"
        >
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
              My Bookings
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Pending and recent bookings on this device
            </p>
          </div>
          <Button
            variant="neon"
            size="sm"
            onClick={() => navigate('/book')}
            leftIcon={<CalendarDays size={14} />}
          >
            Book a court
          </Button>
        </motion.div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : booking ? (
          <div className="space-y-5">
            {/* Unpaid banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100 text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-amber-900">
                      You have an unpaid booking
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800 sm:text-sm">
                      Upload your payment receipt to confirm{' '}
                      {booking.slots.length} slot
                      {booking.slots.length !== 1 && 's'} ·{' '}
                      ₱{(booking.totalAmount ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="neon"
                  size="md"
                  onClick={() => navigate('/book/checkout')}
                  rightIcon={<ArrowRight size={16} />}
                  className="font-bold shadow-md"
                >
                  Pay now
                </Button>
              </div>
            </motion.div>

            {/* Booking details card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reference
                  </p>
                  <p className="font-mono text-sm font-black tracking-wider text-teal-700">
                    {booking.referenceCode}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Upload receipt
                  </span>
                  <StatusBadge status={booking.status} />
                </div>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                {/* Court + Date + Amount row */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      Sideout Playground
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Calendar size={12} className="text-teal-600 shrink-0" />
                      {formatDateLong(booking.date)}
                    </p>
                  </div>
                  <p className="text-sm font-black text-teal-600 shrink-0">
                    ₱{(booking.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>

                {/* Slots */}
                <div className="space-y-2">
                  {booking.slots
                    .slice()
                    .sort((a: TimeSlot, b: TimeSlot) =>
                      a.startTime.localeCompare(b.startTime)
                    )
                    .map((slot) => (
                      <div
                        key={slot.startTime}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span className="font-medium text-slate-700">
                            {format12h(slot.startTime)} – {format12h(slot.endTime)}
                          </span>
                        </div>
                        <span className="font-bold text-teal-600">
                          ₱{(slot.price ?? 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Hash size={12} className="text-teal-600" />
                    {booking.slots.length} slot
                    {booking.slots.length !== 1 ? 's' : ''}
                  </span>
                  {booking.paymentExpiresAt && (
                    <span className="text-amber-700">
                      Hold expires{' '}
                      {new Date(booking.paymentExpiresAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Helper links */}
            <p className="text-center text-xs text-slate-500">
              Booking on a different device?{' '}
              <Link
                to="/track"
                className="font-semibold text-teal-600 underline decoration-dotted hover:text-teal-700"
              >
                Look it up with your reference code
              </Link>
              .
            </p>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Wallet className="h-7 w-7 text-slate-300" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-800">
              No pending bookings on this device
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Start a new booking, or look up an existing one with your
              reference code.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                variant="neon"
                size="md"
                onClick={() => navigate('/book')}
                leftIcon={<CalendarDays size={16} />}
              >
                Book a court
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/track')}
              >
                Track a booking
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
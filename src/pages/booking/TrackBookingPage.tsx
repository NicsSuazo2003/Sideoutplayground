import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Hash,
  Mail,
  User,
  Upload,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Building,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackBooking } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import type { Booking } from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5154/api';
const GCASH_NUMBER = '09058100973';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function TrackBookingPage() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() && !email.trim()) {
      toast.error('Enter your reference number or email address');
      return;
    }
    setLoading(true);
    try {
      const result = await trackBooking(reference.trim(), email.trim());
      setBooking(result);
      toast.success('Booking located!');
    } catch {
      toast.error('Booking not found. Check your reference code and try again.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !booking) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      const res = await fetch(`${API_BASE}/bookings/${booking.id}/upload-payment`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setBooking(updated);
        toast.success('Payment slip uploaded! Awaiting verification.');
      } else {
        toast.error('Upload failed. Try again.');
      }
    } catch {
      toast.error('Upload failed. Check network connection.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBanner = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: AlertCircle,
          title: 'Awaiting Payment Proof',
          desc: 'Transfer via GCash and upload the receipt screenshot below to keep your slot reserved.',
        };
      case 'payment_submitted':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Clock,
          title: 'Verification In Progress',
          desc: 'Your slip has been submitted. Admins typically review references within 15 minutes.',
        };
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: CheckCircle2,
          title: 'Booking Confirmed!',
          desc: 'Your court reservation is secured. Present this digital slip at reception upon arrival.',
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 border-red-200 text-red-800',
          icon: AlertCircle,
          title: 'Booking Cancelled',
          desc: 'This booking was cancelled by the host or admin.',
        };
      case 'expired':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: AlertCircle,
          title: 'Reservation Expired',
          desc: 'Payment was not verified within the time window. The slots have been released.',
        };
      case 'completed':
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: CheckCircle2,
          title: 'Session Completed',
          desc: 'Hope you had a great game! See you next time on the court.',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: Clock,
          title: 'Status Pending',
          desc: 'Your booking is currently being processed.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 sm:pt-20">
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            Realtime Lookup
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-800 sm:text-3xl">
            Track Reservation
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Check payment verification or update your transaction receipt.
          </p>
        </motion.div>

        {/* Lookup Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 mb-6 space-y-3.5"
        >
          <Input
            label="Booking Reference"
            placeholder="e.g. SOP-20260001"
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            leftIcon={<Hash size={16} />}
          />
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-slate-100" />
            <span className="absolute bg-white px-2 text-[10px] font-bold uppercase text-slate-400">
              or by email
            </span>
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
          />
          <Button
            variant="neon"
            size="lg"
            className="w-full mt-2 font-bold shadow-md"
            loading={loading}
            type="submit"
            leftIcon={<Search size={16} />}
          >
            Find Reservation
          </Button>
        </motion.form>

        {/* Booking Result View */}
        <AnimatePresence>
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Dynamic Status Alert Banner */}
              {(() => {
                const banner = getStatusBanner(booking.status);
                const Icon = banner.icon;
                return (
                  <div className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm shadow-sm ${banner.bg}`}>
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">{banner.title}</h4>
                      <p className="mt-0.5 leading-relaxed opacity-90 text-xs">
                        {banner.desc}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Digital Pass / Reservation Ticket */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header Ticket Banner */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-teal-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Center Court Facility
                    </span>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Reference & Copy Card */}
                  <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-teal-700">
                        Reference Number
                      </span>
                      <p className="font-mono text-lg font-black tracking-wider text-teal-800 sm:text-xl">
                        {booking.referenceCode}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(booking.referenceCode, 'ref', 'Reference code')
                      }
                      className="flex h-8 items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 text-xs font-bold text-teal-700 shadow-sm transition hover:border-teal-400 active:scale-95"
                    >
                      {copiedKey === 'ref' ? (
                        <>
                          <Check size={13} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Booking Metadata Breakdown */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <User size={14} className="text-teal-600" /> Player
                      </span>
                      <span className="font-semibold text-slate-800">{booking.customerName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={14} className="text-teal-600" /> Date
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-slate-50">
                      <span className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Clock size={14} className="text-teal-600" /> Slots
                      </span>
                      <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                        {booking.slots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((s) => (
                            <span
                              key={s.startTime}
                              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-700"
                            >
                              {format12h(s.startTime)} – {format12h(s.endTime)}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-slate-800">Amount Paid</span>
                      <span className="text-xl font-black text-teal-600">
                        ₱{booking.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* If Pending Payment: Quick Pay Assistance Card */}
              {booking.status === 'pending_payment' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Pending GCash Transfer
                    </h3>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white border border-amber-200 p-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Send Exact Total</p>
                      <p className="font-extrabold text-slate-800">
                        {GCASH_NUMBER} <span className="font-normal text-slate-500">(Side Out)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(GCASH_NUMBER, 'gcash', 'GCash number')}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 hover:border-teal-400 active:scale-95"
                    >
                      {copiedKey === 'gcash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Proof / Re-upload Component */}
              {(booking.status === 'pending_payment' || booking.status === 'payment_submitted') && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Verification Proof
                    </h3>
                    {booking.paymentScreenshot && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                        Slip Attached
                      </span>
                    )}
                  </div>

                  {booking.paymentScreenshot ? (
                    <div className="space-y-3">
                      <div className="relative max-h-52 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={booking.paymentScreenshot}
                          alt="Submitted receipt proof"
                          className="w-full h-full object-contain max-h-52"
                        />
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-98"
                      >
                        <RefreshCw size={13} className={uploading ? 'animate-spin' : ''} />
                        <span>{uploading ? 'Uploading Slip...' : 'Replace Receipt Image'}</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4 text-center transition hover:border-teal-400 hover:bg-teal-50/20 active:scale-98"
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 sm:text-sm">
                        {uploading ? 'Uploading Receipt...' : 'Tap to Upload GCash Receipt'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        JPG, PNG, or WebP screenshot
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotUpload}
                    disabled={uploading}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
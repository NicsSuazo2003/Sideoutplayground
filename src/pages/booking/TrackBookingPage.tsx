import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, Hash, Mail, User, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackBooking } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import type { Booking } from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5154/api';

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

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) {
      toast.error('Enter both reference code and email');
      return;
    }
    setLoading(true);
    try {
      const result = await trackBooking(reference.trim(), email.trim());
      setBooking(result);
    } catch {
      toast.error('Booking not found. Check your reference and email.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
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
        toast.success('Screenshot uploaded! Awaiting verification.');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_payment': return { color: 'text-yellow-400/80', msg: '⏰ Complete your GCash payment within 30 minutes. Upload your screenshot here.' };
      case 'payment_submitted': return { color: 'text-blue-400/80', msg: '📸 Payment screenshot submitted. Admin will verify shortly.' };
      case 'confirmed': return { color: 'text-green-400/80', msg: '✅ Booking confirmed! See you on the court.' };
      case 'cancelled': return { color: 'text-red-400/80', msg: '❌ Booking cancelled.' };
      case 'completed': return { color: 'text-gray-400/80', msg: '🏁 Session completed.' };
      case 'expired': return { color: 'text-red-400/80', msg: '⏰ Payment time expired. Slot released.' };
      default: return { color: 'text-yellow-400/80', msg: 'Pending confirmation.' };
    }
  };

  const statusInfo = booking ? getStatusMessage(booking.status) : null;

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Track Your Booking</h1>
          <p className="text-white/50 text-sm mt-2">Enter your booking reference and email to check your reservation status.</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleTrack} className="glass-card p-6 space-y-4 mb-6">
          <Input label="Booking Reference" placeholder="SOP-20260001" value={reference}
            onChange={e => setReference(e.target.value.toUpperCase())} leftIcon={<Hash size={16} />} />
          <Input label="Email Address" type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} />} />
          <Button variant="neon" size="lg" className="w-full" loading={loading} type="submit">
            <Search size={16} /> Track Booking
          </Button>
        </motion.form>

        {booking && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Booking Details</h2>
              <StatusBadge status={booking.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/60"><Hash size={14} className="text-[#7CFC00]" />{booking.referenceCode}</div>
              <div className="flex items-center gap-2 text-white/60"><User size={14} className="text-[#7CFC00]" />{booking.customerName}</div>
              <div className="flex items-center gap-2 text-white/60">
                <Calendar size={14} className="text-[#7CFC00]" />
                {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Clock size={14} className="text-[#7CFC00]" />
                {booking.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => format12h(s.startTime)).join(', ')} ({booking.slots.length}h)
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Hash size={14} className="text-[#7CFC00]" />₱{booking.totalAmount.toFixed(2)}
              </div>
            </div>

            {statusInfo && (
              <div className={`glass rounded-xl p-3 text-xs mt-2 ${statusInfo.color}`}>
                {statusInfo.msg}
              </div>
            )}

            {/* Payment Screenshot Upload */}
            {(booking.status === 'pending_payment' || booking.status === 'payment_submitted') && (
              <div className="glass-card p-4 space-y-3 mt-2">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Upload size={14} className="text-[#7CFC00]" /> Payment Screenshot
                </h3>
                {booking.paymentScreenshot ? (
                  <div>
                    <img src={booking.paymentScreenshot} alt="Payment proof" className="rounded-xl w-full max-h-48 object-cover" />
                    <p className="text-xs text-green-400 mt-1">✅ Screenshot submitted — awaiting admin verification.</p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={uploading}
                      className="text-sm text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#7CFC00] file:text-black file:font-semibold"
                    />
                    <p className="text-xs text-white/40 mt-1">Upload your GCash receipt screenshot</p>
                  </div>
                )}
              </div>
            )}

            {/* GCash Payment Info for pending */}
            {booking.status === 'pending_payment' && (
              <div className="glass rounded-xl p-3 text-xs text-white/50">
                <p className="font-semibold text-white mb-1">📱 GCash Payment Details</p>
                <p>Send <strong>₱{booking.totalAmount.toFixed(2)}</strong> to <strong>09058100973</strong></p>
                <p>Reference: <strong className="text-[#FF1493]">{booking.referenceCode}</strong></p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, User, Mail, Phone, Smartphone, Copy, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSession, registerForSession } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { OpenPlaySession, OpenPlayRegistration } from '../../types';

const GCASH_NUMBER = '09058100973';
const PAYMENT_MINUTES = 15;

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function OpenPlayRegisterPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<OpenPlaySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'payment' | 'upload'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registration, setRegistration] = useState<OpenPlayRegistration | null>(null);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_MINUTES * 60);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (sessionId) getSession(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (step === 'payment' && registration) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast.error('Payment time expired.');
            navigate('/openplay');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, registration]);

  if (loading) return <LoadingSpinner />;
  if (!session) return <div className="text-center py-12 text-slate-400">Session not found</div>;

  const spotsLeft = session.maxPlayers - session.registeredCount;
  const isFull = spotsLeft <= 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const copyGcash = () => { navigator.clipboard.writeText(GCASH_NUMBER); toast.success('GCash number copied!'); };
  const copyReference = () => {
    if (registration) { navigator.clipboard.writeText(registration.referenceCode); toast.success('Reference copied!'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      const reg = await registerForSession(sessionId!, { customerName: name, customerEmail: email, customerPhone: phone || undefined });
      setRegistration(reg);
      setStep('payment');
      toast.success(reg.status === 'waitlisted' ? 'Added to waitlist!' : 'Registered! Pay within 15 minutes.');
    } catch (err: any) { toast.error(err?.message || 'Registration failed'); }
    finally { setSaving(false); }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshot || !registration) return;
    setUploading(true);
    try {
      // Upload screenshot to the court booking upload endpoint (reuse)
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/${registration.id}/upload-payment`, {
        method: 'POST', body: formData,
      });
      if (res.ok) {
        toast.success('Payment proof uploaded!');
        navigate('/openplay');
      } else { toast.error('Upload failed'); }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  // STEP 1: Registration Details
  if (step === 'details') {
    return (
      <div className="pt-24 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Register for Open Play</h2>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Calendar size={14} className="text-teal-600" />{new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              <div className="flex items-center gap-2 text-slate-600"><Clock size={14} className="text-teal-600" />{format12h(session.startTime)} – {format12h(session.endTime)}</div>
              <div className="flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-teal-600" />{session.isExternalVenue ? session.externalVenueName : session.venue}</div>
              <div className="flex items-center gap-2 text-slate-600"><Users size={14} className="text-teal-600" />{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left · ₱{session.pricePerPerson}/person</div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input label="Full Name *" value={name} onChange={e => setName(e.target.value)} leftIcon={<User size={16} className="text-slate-500" />} />
              <Input label="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} className="text-slate-500" />} />
              <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} leftIcon={<Phone size={16} className="text-slate-500" />} />
              <Button variant="neon" size="lg" className="w-full" loading={saving} type="submit">
                {isFull ? 'Join Waitlist' : 'Register & Pay via GCash'} · ₱{session.pricePerPerson}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 2: Payment
  if (step === 'payment') {
    return (
      <div className="pt-24 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6 text-xs">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">1</span>
            <span className="text-teal-600 font-semibold">Payment</span>
            <span className="text-slate-300">→</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">2</span>
            <span className="text-slate-500">Upload</span>
          </div>

          <div className={`rounded-xl p-3 mb-4 text-center border ${timeLeft <= 60 ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
            <div className="text-slate-500 text-xs">Pay within</div>
            <div className={`text-2xl font-black ${timeLeft <= 60 ? 'text-red-500' : 'text-teal-600'}`}>{formatTime(timeLeft)}</div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-slate-800 font-bold">GCash Payment</h2>
            <p className="text-slate-500 text-sm">Send <strong>₱{session.pricePerPerson}</strong> to:</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">GCash Number</span>
                <span className="text-slate-800 font-bold">{GCASH_NUMBER} <button onClick={copyGcash} className="text-teal-600 text-xs hover:underline">Copy</button></span>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Reference</span>
                <span className="text-amber-600 font-bold">{registration?.referenceCode} <button onClick={copyReference} className="text-teal-600 text-xs hover:underline">Copy</button></span>
              </div>
              <p className="text-xs text-amber-600">⚠️ Put this reference in your GCash message!</p>
            </div>

            <Button variant="neon" size="lg" className="w-full" onClick={() => setStep('upload')}>Continue to Upload</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 3: Upload Screenshot
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-xs">
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">✓</span>
          <span className="text-teal-600 font-semibold">Payment</span>
          <span className="text-slate-300">→</span>
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</span>
          <span className="text-teal-600 font-semibold">Upload</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-slate-800 font-bold">Upload Payment Proof</h2>

          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="text-slate-800">₱{session.pricePerPerson}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Reference:</span><span className="text-amber-600">{registration?.referenceCode}</span></div>
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
        </motion.div>
      </div>
    </div>
  );
}
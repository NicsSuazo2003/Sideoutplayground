import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  Smartphone,
  Copy,
  Check,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSession, registerForSession } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { OpenPlaySession, OpenPlayRegistration } from '../../types';

const GCASH_NUMBER = '09058100973';
const GCASH_NAME = 'Side Out Playground';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (sessionId) {
      getSession(sessionId)
        .then(setSession)
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  // Payment hold countdown timer
  useEffect(() => {
    if ((step === 'payment' || step === 'upload') && registration) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast.error('Payment hold window expired.');
            navigate('/openplay');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, registration, navigate]);

  // Handle local thumbnail preview
  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <p className="text-slate-500 text-sm mb-4">Open Play session not found or has expired.</p>
        <Button variant="neon" size="md" onClick={() => navigate('/openplay')}>
          Browse Sessions
        </Button>
      </div>
    );
  }

  const spotsLeft = session.maxPlayers - session.registeredCount;
  const isFull = spotsLeft <= 0;

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const reg = await registerForSession(sessionId!, {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
      });
      setRegistration(reg);
      setStep('payment');
      toast.success(
        reg.status === 'waitlisted' ? 'Added to waitlist!' : 'Registered! Pay within 15 minutes.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshot || !registration) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/openplay/registrations/${registration.id}/upload-payment`,
        { method: 'POST', body: formData }
      );
      if (res.ok) {
        toast.success('Payment proof uploaded!');
        navigate('/openplay');
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
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 sm:pt-20">
      {/* Mobile Sticky Step & Timer Header */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
              {step === 'details' ? '1' : step === 'payment' ? '2' : '3'}
            </span>
            <span className="text-xs font-bold text-slate-800 capitalize">
              {step === 'details' ? 'Player Info' : step === 'payment' ? 'Send GCash' : 'Upload Receipt'}
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

      <div className="mx-auto max-w-lg px-4 py-5 sm:py-8 sm:px-6">
        {/* Desktop Step Indicators */}
        <div className="mb-6 hidden items-center justify-between sm:flex">
          {[
            { id: 'details', num: '1', title: 'Player Details' },
            { id: 'payment', num: '2', title: 'GCash Payment' },
            { id: 'upload', num: '3', title: 'Submit Slip' },
          ].map((s, idx, arr) => {
            const isDone =
              (s.id === 'details' && step !== 'details') ||
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

        {/* STEP 1: Registration Details */}
        {step === 'details' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">Join Open Play Session</h2>
                <button
                  onClick={() => navigate('/openplay')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  <ArrowLeft size={13} />
                  <span>Back to runs</span>
                </button>
              </div>

              {/* Match Card Preview */}
              <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate pr-2">{session.title}</span>
                  <span className="font-bold text-teal-700 shrink-0">₱{session.pricePerPerson} / player</span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-teal-600 shrink-0" />
                    <span>
                      {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-teal-600 shrink-0" />
                    <span>{format12h(session.startTime)} – {format12h(session.endTime)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate max-w-full">
                    <MapPin size={13} className="text-teal-600 shrink-0" />
                    <span className="truncate">
                      {session.isExternalVenue ? session.externalVenueName : session.venue}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-teal-200/50 text-[11px]">
                  <span className="text-slate-500 font-medium">Availability</span>
                  <span className={isFull ? 'text-rose-600 font-bold' : 'text-teal-700 font-semibold'}>
                    {isFull ? 'Waitlist only' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} available`}
                  </span>
                </div>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User size={16} className="text-slate-400" />}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} className="text-slate-400" />}
                />
                <Input
                  label="Contact Phone (Optional)"
                  placeholder="09xx-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone size={16} className="text-slate-400" />}
                />

                {/* Desktop Register Button */}
                <div className="hidden sm:block pt-2">
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full font-bold shadow-md"
                    loading={saving}
                    type="submit"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    {isFull ? 'Join Waitlist' : `Reserve Spot · ₱${session.pricePerPerson}`}
                  </Button>
                </div>

                {/* Mobile Sticky Bar */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-400">Total Fee</p>
                      <p className="text-lg font-black leading-tight text-teal-600">
                        ₱{session.pricePerPerson}
                      </p>
                    </div>
                    <Button
                      variant="neon"
                      size="md"
                      className="font-bold shrink-0"
                      loading={saving}
                      type="submit"
                      rightIcon={<ArrowRight size={16} />}
                    >
                      {isFull ? 'Join Waitlist' : 'Proceed to Pay'}
                    </Button>
                  </div>
                </div>
                <div className="h-16 sm:hidden" />
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 2: GCASH PAYMENT */}
        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Desktop Countdown Card */}
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
                  <p className="text-xs font-bold uppercase tracking-wider">Spot Hold Window</p>
                  <p className="text-xs opacity-80">Reserved for {PAYMENT_MINUTES} minutes</p>
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
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">GCash Transfer</h2>
                    <p className="text-[11px] text-slate-400">Pay fee to confirm your attendance</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                  Open Play
                </span>
              </div>

              {/* Account Quick-Copy Blocks */}
              <div className="space-y-2.5">
                {/* Number Block */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
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

                {/* Reference Code Block */}
                <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-700">Open Play Reference</span>
                    <p className="text-base font-black text-teal-800 font-mono tracking-wider">
                      {registration?.referenceCode}
                    </p>
                    <p className="text-[10px] text-teal-600">Add to your GCash message / notes</p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(registration?.referenceCode || '', 'ref', 'Reference code')
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

                {/* Amount Due Card */}
                <div className="flex items-center justify-between rounded-xl bg-slate-800 p-3 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Registration Fee</p>
                    <p className="text-xs text-slate-300">Exact payment required</p>
                  </div>
                  <div className="text-xl font-black text-teal-400">₱{session.pricePerPerson}</div>
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please attach your transaction screenshot on the next screen once sent.
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-3 pt-2">
              <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="w-2/3 font-bold"
                onClick={() => setStep('upload')}
                rightIcon={<ArrowRight size={16} />}
              >
                I Have Sent GCash
              </Button>
            </div>

            {/* Mobile Sticky Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep('details')} className="px-3">
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">Submit GCash Screenshot</h2>
                <p className="text-xs text-slate-400">
                  Registration Ref: <span className="font-mono font-bold text-teal-600">{registration?.referenceCode}</span>
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  screenshot
                    ? 'border-teal-500 bg-teal-50/20'
                    : 'border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <img src={previewUrl} alt="Receipt preview" className="h-full w-full object-cover" />
                    </div>
                    <p className="max-w-[220px] truncate text-xs font-bold text-slate-800">{screenshot?.name}</p>
                    <span className="text-[11px] font-semibold text-teal-600 underline">
                      Tap to replace screenshot
                    </span>
                  </div>
                ) : (
                  <div className="py-5 space-y-2">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 sm:text-sm">
                      Tap to select GCash Receipt
                    </p>
                    <p className="text-[11px] text-slate-400">JPG, PNG, or WebP</p>
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

              {/* Admin note */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100">
                <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                <span>Admins verify the receipt reference against our notifications.</span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-3 pt-2">
              <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep('payment')}>
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
                Confirm &amp; Complete
              </Button>
            </div>

            {/* Mobile Sticky Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep('payment')} className="px-3">
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
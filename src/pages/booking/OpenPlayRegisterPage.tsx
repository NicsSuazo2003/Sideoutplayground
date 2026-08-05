import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSession, registerForSession } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { OpenPlaySession, OpenPlayRegistration } from '../../types';

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
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registration, setRegistration] = useState<OpenPlayRegistration | null>(null);

  useEffect(() => {
    if (sessionId) getSession(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      const reg = await registerForSession(sessionId!, { customerName: name, customerEmail: email, customerPhone: phone || undefined });
      setRegistration(reg);
      toast.success(reg.status === 'waitlisted' ? 'Added to waitlist!' : 'Registered successfully!');
    } catch (err: any) { toast.error(err?.message || 'Registration failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!session) return <div className="text-center py-12 text-slate-400">Session not found</div>;

  const spotsLeft = session.maxPlayers - session.registeredCount;

  if (registration) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {registration.status === 'waitlisted' ? 'Waitlisted!' : 'Registered!'}
          </h2>
          <p className="text-slate-500 mb-4">
            {registration.status === 'waitlisted'
              ? "You're on the waitlist. You'll be notified if a spot opens."
              : `You're registered for ${session.title}!`}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm text-left space-y-2">
            <p><strong>Reference:</strong> {registration.referenceCode}</p>
            <p><strong>Session:</strong> {session.title}</p>
            <p><strong>Date:</strong> {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> {format12h(session.startTime)} – {format12h(session.endTime)}</p>
            <p><strong>Price:</strong> ₱{session.pricePerPerson}</p>
          </div>
          <Button variant="neon" size="lg" className="w-full" onClick={() => navigate('/openplay')}>
            Back to Open Play
          </Button>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name *" value={name} onChange={e => setName(e.target.value)} leftIcon={<User size={16} className="text-slate-500" />} />
            <Input label="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} className="text-slate-500" />} />
            <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} leftIcon={<Phone size={16} className="text-slate-500" />} />
            <Button variant="neon" size="lg" className="w-full" loading={saving} type="submit">
              {spotsLeft <= 0 ? 'Join Waitlist' : 'Confirm Registration'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
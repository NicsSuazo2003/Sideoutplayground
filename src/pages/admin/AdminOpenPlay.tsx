import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllSessions, createSession, deleteSession, updateSessionStatus, getRegistrations, updateRegistrationStatus } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { OpenPlaySession, OpenPlayRegistration } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function AdminOpenPlay() {
  const [sessions, setSessions] = useState<OpenPlaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', date: '', startTime: '', endTime: '',
    venue: 'Side Out Playground', isExternalVenue: false,
    externalVenueName: '', externalVenueAddress: '',
    maxPlayers: '12', pricePerPerson: '', notes: ''
  });
  const [selectedRegistrations, setSelectedRegistrations] = useState<OpenPlayRegistration[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try { setSessions(await getAllSessions()); }
    catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ title: '', date: '', startTime: '', endTime: '', venue: 'Side Out Playground', isExternalVenue: false, externalVenueName: '', externalVenueAddress: '', maxPlayers: '12', pricePerPerson: '', notes: '' });
    setShowCreate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.pricePerPerson) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      await createSession({
        title: form.title, date: form.date, startTime: form.startTime, endTime: form.endTime,
        venue: form.venue, isExternalVenue: form.isExternalVenue,
        externalVenueName: form.externalVenueName || undefined,
        externalVenueAddress: form.externalVenueAddress || undefined,
        maxPlayers: parseInt(form.maxPlayers), pricePerPerson: parseFloat(form.pricePerPerson),
        notes: form.notes || undefined
      });
      toast.success('Session created!');
      resetForm();
      fetchSessions();
    } catch { toast.error('Failed to create session'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return;
    try { await deleteSession(id); toast.success('Deleted'); fetchSessions(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateSessionStatus(id, status); toast.success(`Session ${status}`); fetchSessions(); }
    catch { toast.error('Failed to update'); }
  };

  const viewRegistrations = async (session: OpenPlaySession) => {
    try {
      const regs = await getRegistrations(session.id);
      setSelectedRegistrations(regs);
      setSelectedSessionTitle(session.title);
      setShowRegistrations(true);
    } catch { toast.error('Failed to load registrations'); }
  };

  const handleRegStatus = async (id: string, status: string) => {
    try { await updateRegistrationStatus(id, status); toast.success(`Updated to ${status}`); }
    catch { toast.error('Failed to update'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Open Play Management</h1>
          <p className="text-slate-500 text-sm mt-1">{sessions.length} sessions</p>
        </div>
        <Button variant="neon" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Session
        </Button>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={resetForm} title="Create Open Play Session" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Session Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Saturday Open Play" />
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Date *" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Start Time *" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            <Input label="End Time *" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600 block mb-1.5">Venue</label>
              <select value={form.venue} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, venue: v, isExternalVenue: v !== 'Side Out Playground' })); }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700">
                <option value="Side Out Playground">Side Out Playground (blocks court)</option>
                <option value="External">External Venue</option>
              </select>
            </div>
            <Input label="Max Players *" type="number" value={form.maxPlayers} onChange={e => setForm(f => ({ ...f, maxPlayers: e.target.value }))} />
          </div>
          {form.isExternalVenue && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Venue Name" value={form.externalVenueName} onChange={e => setForm(f => ({ ...f, externalVenueName: e.target.value }))} />
              <Input label="Venue Address" value={form.externalVenueAddress} onChange={e => setForm(f => ({ ...f, externalVenueAddress: e.target.value }))} />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Price per Person * (₱)" type="number" value={form.pricePerPerson} onChange={e => setForm(f => ({ ...f, pricePerPerson: e.target.value }))} />
            <Input label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <Button variant="neon" size="sm" type="submit" loading={saving}>Create Session</Button>
        </form>
      </Modal>

      {/* Registrations Modal */}
      <Modal open={showRegistrations} onClose={() => setShowRegistrations(false)} title={`Registrations: ${selectedSessionTitle}`} size="lg">
        {selectedRegistrations.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No registrations yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Phone</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Reference</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedRegistrations.map((r, i) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="p-3 text-slate-500">{i + 1}</td>
                    <td className="p-3 text-slate-800">{r.customerName}</td>
                    <td className="p-3 text-slate-500 text-xs">{r.customerEmail}</td>
                    <td className="p-3 text-slate-500">{r.customerPhone || '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        r.status === 'registered' || r.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                        r.status === 'waitlisted' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>{r.status}</span>
                    </td>
                    <td className="p-3 text-teal-600 text-xs font-mono">{r.referenceCode}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {r.status === 'registered' && <button onClick={() => handleRegStatus(r.id, 'confirmed')} className="text-xs text-green-600 hover:underline">Confirm</button>}
                        {r.status === 'waitlisted' && <button onClick={() => handleRegStatus(r.id, 'registered')} className="text-xs text-teal-600 hover:underline">Promote</button>}
                        {(r.status === 'registered' || r.status === 'waitlisted') && <button onClick={() => handleRegStatus(r.id, 'cancelled')} className="text-xs text-red-500 hover:underline">Cancel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map(session => (
          <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">{session.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} className="text-teal-600" />
                  {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} className="text-teal-600" />
                  {format12h(session.startTime)} – {format12h(session.endTime)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-teal-600" />
                  {session.isExternalVenue ? session.externalVenueName : session.venue}
                  {session.isExternalVenue && <span className="text-xs text-amber-600">(external)</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-teal-600" />
                  <span className="text-slate-500">{session.registeredCount}/{session.maxPlayers} · ₱{session.pricePerPerson}/person</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  session.status === 'open' ? 'bg-green-50 text-green-600' :
                  session.status === 'full' ? 'bg-amber-50 text-amber-600' :
                  session.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                  'bg-blue-50 text-blue-600'
                }`}>{session.status}</span>
                <Button variant="ghost" size="sm" onClick={() => viewRegistrations(session)}><Users size={14} /></Button>
                {session.status === 'open' && <Button variant="outline" size="sm" onClick={() => handleStatusChange(session.id, 'cancelled')}>Cancel</Button>}
                {session.status === 'cancelled' && <Button variant="outline" size="sm" onClick={() => handleStatusChange(session.id, 'open')}>Reopen</Button>}
                <button onClick={() => handleDelete(session.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getAllSessions,
  createSession,
  deleteSession,
  updateSessionStatus,
  getRegistrations,
  updateRegistrationStatus,
} from '../../services/openPlayService';
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
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: 'Side Out Playground',
    isExternalVenue: false,
    externalVenueName: '',
    externalVenueAddress: '',
    maxPlayers: '12',
    pricePerPerson: '',
    notes: '',
  });
  const [selectedRegistrations, setSelectedRegistrations] = useState<OpenPlayRegistration[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      setSessions(await getAllSessions());
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      venue: 'Side Out Playground',
      isExternalVenue: false,
      externalVenueName: '',
      externalVenueAddress: '',
      maxPlayers: '12',
      pricePerPerson: '',
      notes: '',
    });
    setShowCreate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.pricePerPerson) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await createSession({
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue,
        isExternalVenue: form.isExternalVenue,
        externalVenueName: form.externalVenueName || undefined,
        externalVenueAddress: form.externalVenueAddress || undefined,
        maxPlayers: parseInt(form.maxPlayers),
        pricePerPerson: parseFloat(form.pricePerPerson),
        notes: form.notes || undefined,
      });
      toast.success('Session created!');
      resetForm();
      fetchSessions();
    } catch {
      toast.error('Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this session?')) return;
    try {
      await deleteSession(id);
      toast.success('Session removed');
      fetchSessions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateSessionStatus(id, status);
      toast.success(`Session marked as ${status}`);
      fetchSessions();
    } catch {
      toast.error('Failed to update session');
    }
  };

  const viewRegistrations = async (session: OpenPlaySession) => {
    try {
      const regs = await getRegistrations(session.id);
      setSelectedRegistrations(regs);
      setSelectedSessionTitle(session.title);
      setShowRegistrations(true);
    } catch {
      toast.error('Failed to load registrations');
    }
  };

  const handleRegStatus = async (id: string, status: string) => {
    try {
      await updateRegistrationStatus(id, status);
      toast.success(`Updated status to ${status}`);
      const currentSessionId = selectedRegistrations.find((r) => r.id === id)?.sessionId;
      if (currentSessionId) {
        const regs = await getRegistrations(currentSessionId);
        setSelectedRegistrations(regs);
      }
      fetchSessions();
    } catch {
      toast.error('Failed to update registration');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl pb-24 sm:pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Open Play Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize social sessions, check player attendance, and verify GCash slips.
          </p>
        </div>
        <Button
          variant="neon"
          size="sm"
          onClick={() => setShowCreate(true)}
          leftIcon={<Plus size={15} />}
          className="font-bold text-xs shadow-xs self-start sm:self-auto"
        >
          New Session
        </Button>
      </div>

      {/* 1. SESSIONS FEED */}
      <div className="space-y-3.5">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs sm:text-sm">
            No Open Play sessions created yet. Tap "New Session" to schedule one.
          </div>
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Session Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {session.title}
                    </h3>
                    <span
                      className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        session.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : session.status === 'full'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : session.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 pt-0.5">
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
                      <span>
                        {format12h(session.startTime)} – {format12h(session.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      <MapPin size={13} className="text-teal-600 shrink-0" />
                      <span className="truncate">
                        {session.isExternalVenue ? session.externalVenueName : session.venue}
                      </span>
                      {session.isExternalVenue && (
                        <span className="text-[10px] text-amber-600 font-bold">(External)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                    <Users size={13} className="text-teal-600" />
                    <span className="text-slate-700">
                      {session.registeredCount} / {session.maxPlayers} Players Joined
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-teal-700 font-bold">₱{session.pricePerPerson} / player</span>
                  </div>
                </div>

                {/* Management Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 justify-between sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewRegistrations(session)}
                    leftIcon={<Users size={14} />}
                    className="font-bold text-xs"
                  >
                    Roster ({session.registeredCount})
                  </Button>

                  {session.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(session.id, 'cancelled')}
                      className="text-xs text-rose-600 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  )}

                  {session.status === 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(session.id, 'open')}
                      className="text-xs text-teal-600"
                    >
                      Reopen
                    </Button>
                  )}

                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 active:scale-95 transition"
                    aria-label="Delete session"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 2. CREATE SESSION MODAL */}
      <Modal open={showCreate} onClose={resetForm} title="Create Open Play Run" size="lg">
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <form onSubmit={handleCreate} className="space-y-3.5">
            <Input
              label="Session Title *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Saturday Night Open Play"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Date *"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
              <Input
                label="Start Time *"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
              <Input
                label="End Time *"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Venue Selection
                </label>
                <select
                  value={form.venue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      venue: v,
                      isExternalVenue: v !== 'Side Out Playground',
                    }));
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Side Out Playground">Side Out Playground (Main Facility)</option>
                  <option value="External">External Venue / Covered Gym</option>
                </select>
              </div>
              <Input
                label="Capacity (Max Players) *"
                type="number"
                value={form.maxPlayers}
                onChange={(e) => setForm((f) => ({ ...f, maxPlayers: e.target.value }))}
              />
            </div>

            {form.isExternalVenue && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="External Venue Name"
                  placeholder="e.g. Tandag City Gym"
                  value={form.externalVenueName}
                  onChange={(e) => setForm((f) => ({ ...f, externalVenueName: e.target.value }))}
                />
                <Input
                  label="Venue Address"
                  placeholder="Street / Barangay"
                  value={form.externalVenueAddress}
                  onChange={(e) => setForm((f) => ({ ...f, externalVenueAddress: e.target.value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Price Per Person (₱) *"
                type="number"
                value={form.pricePerPerson}
                onChange={(e) => setForm((f) => ({ ...f, pricePerPerson: e.target.value }))}
              />
              <Input
                label="Session Notes (Optional)"
                placeholder="Bring paddle, beginner friendly..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="md" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="neon" size="md" type="submit" loading={saving} className="font-bold">
                Publish Run
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 3. ROSTER / REGISTRATIONS MODAL */}
      <Modal
        open={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        title={`Roster: ${selectedSessionTitle}`}
        size="3xl"
      >
        {selectedRegistrations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Users className="mx-auto mb-2 h-8 w-8 opacity-30 text-teal-600" />
            <p>No players have registered for this session yet.</p>
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-3">
            {/* Mobile Card Roster View (< sm viewports) */}
            <div className="space-y-2.5 sm:hidden">
              {selectedRegistrations.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">#{i + 1}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        r.status === 'registered' || r.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : r.status === 'payment_submitted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : r.status === 'waitlisted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 text-sm">{r.customerName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{r.customerEmail}</p>
                    {r.customerPhone && (
                      <p className="text-slate-400 text-[10px]">{r.customerPhone}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="font-mono text-[11px] font-bold text-teal-700 select-all">
                      {r.referenceCode}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {r.paymentScreenshot && (
                        <button
                          onClick={() => setPreviewScreenshot(r.paymentScreenshot || null)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                        >
                          <Eye size={12} />
                          <span>Slip</span>
                        </button>
                      )}

                      {(r.status === 'registered' || r.status === 'payment_submitted') && (
                        <button
                          onClick={() => handleRegStatus(r.id, 'confirmed')}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                        >
                          Confirm
                        </button>
                      )}

                      {r.status === 'waitlisted' && (
                        <button
                          onClick={() => handleRegStatus(r.id, 'registered')}
                          className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200"
                        >
                          Promote
                        </button>
                      )}

                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => handleRegStatus(r.id, 'cancelled')}
                          className="text-[11px] font-bold text-rose-600 p-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= sm viewports) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Email &amp; Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedRegistrations.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {r.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <div>{r.customerEmail}</div>
                        {r.customerPhone && (
                          <div className="text-[10px] text-slate-400">{r.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            r.status === 'registered' || r.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : r.status === 'payment_submitted'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : r.status === 'waitlisted'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700 whitespace-nowrap select-all">
                        {r.referenceCode}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {r.paymentScreenshot && (
                            <button
                              onClick={() => setPreviewScreenshot(r.paymentScreenshot || null)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="View receipt slip"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {(r.status === 'registered' || r.status === 'payment_submitted') && (
                            <button
                              onClick={() => handleRegStatus(r.id, 'confirmed')}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              Confirm
                            </button>
                          )}

                          {r.status === 'waitlisted' && (
                            <button
                              onClick={() => handleRegStatus(r.id, 'registered')}
                              className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              Promote
                            </button>
                          )}

                          {r.status !== 'cancelled' && (
                            <button
                              onClick={() => handleRegStatus(r.id, 'cancelled')}
                              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. PAYMENT SLIP PREVIEW MODAL */}
      <Modal
        open={!!previewScreenshot}
        onClose={() => setPreviewScreenshot(null)}
        title="Submitted GCash Screenshot"
        size="md"
      >
        {previewScreenshot && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 max-h-[60vh] flex items-center justify-center">
              <img
                src={previewScreenshot}
                alt="GCash receipt preview"
                className="w-full h-full object-contain max-h-[60vh]"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewScreenshot(null)}
                className="font-bold text-xs"
              >
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
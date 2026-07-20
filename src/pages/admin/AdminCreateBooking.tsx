import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvailability } from '../../services/courtService';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import type { TimeSlot } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getDateStrip(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = -30; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AdminCreateBooking({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<'slots' | 'details'>('slots');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [dateOffset, setDateOffset] = useState(30);

  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, Math.min(dateOffset + 7, dates.length));

  useEffect(() => {
    if (open) { getAvailability(selectedDate).then(setAvailability); setSelectedSlots([]); setStep('slots'); }
  }, [selectedDate, open]);

  const toggleSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlots(prev => prev.find(s => s.id === slot.id) ? prev.filter(s => s.id !== slot.id) : [...prev, slot]);
  };

  const pricePerHour = availability[0]?.price || 0;
  const total = selectedSlots.reduce((sum, s) => sum + (s.price || pricePerHour), 0);

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error('Name is required'); return; }
    if (!customerEmail.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      await api.post('/bookings/admin-create', {
        customerName, customerEmail, customerPhone: customerPhone || undefined,
        date: selectedDate, slots: selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total, notes: notes || undefined, status: 'confirmed',
      });
      toast.success('Booking created!'); onCreated(); onClose();
    } catch { toast.error('Failed to create booking'); }
    finally { setSaving(false); }
  };

  const stepClass = (active: boolean) => `flex items-center gap-2 text-sm font-semibold ${active ? 'text-teal-600' : 'text-slate-400'}`;
  const stepCircle = (active: boolean) => `w-6 h-6 rounded-full flex items-center justify-center text-xs ${active ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`;

  return (
    <Modal open={open} onClose={onClose} title="Create Manual Booking" size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={stepClass(step === 'slots')}><span className={stepCircle(step === 'slots')}>1</span>Pick Slots</div>
          <div className="w-6 h-px bg-slate-200" />
          <div className={stepClass(step === 'details')}><span className={stepCircle(step === 'details')}>2</span>Details</div>
        </div>

        {step === 'slots' ? (
          <>
            <div className="flex items-center gap-2">
              <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronLeft size={14} /></button>
              <div className="flex gap-1 flex-1 overflow-x-auto">
                {visibleDates.map(d => {
                  const isSelected = d === selectedDate;
                  const dateObj = new Date(d + 'T12:00:00');
                  const isToday = d === new Date().toISOString().split('T')[0];
                  return (
                    <button key={d} onClick={() => setSelectedDate(d)}
                      className={`flex-shrink-0 flex flex-col items-center py-1.5 px-2 rounded-lg text-xs transition-all ${isSelected ? 'bg-teal-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                      <span>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-bold">{dateObj.getDate()}</span>
                      {isToday && <span className="text-[8px] text-teal-600">TODAY</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))} disabled={dateOffset >= dates.length - 7} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availability.map(slot => {
                const isSelected = selectedSlots.some(s => s.id === slot.id);
                return (
                  <button key={slot.id} onClick={() => toggleSlot(slot)}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected ? 'bg-teal-600 text-white border-teal-600'
                      : !slot.isAvailable ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 text-slate-600 hover:border-teal-400'}`}>
                    <div>{format12h(slot.startTime)}</div>
                    <div className="text-[10px] opacity-60">₱{slot.price || pricePerHour}</div>
                  </button>
                );
              })}
            </div>

            {selectedSlots.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 text-sm border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span>
                  <span className="text-teal-600 font-bold">₱{total}</span>
                </div>
                <div className="text-slate-400 text-xs mt-1">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
            )}

            <Button variant="neon" size="sm" className="w-full" disabled={selectedSlots.length === 0} onClick={() => setStep('details')}>Continue to Details</Button>
          </>
        ) : (
          <>
            <div className="bg-slate-50 rounded-xl p-3 mb-2 text-sm text-slate-500 border border-slate-200">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedSlots.length}h · ₱{total}
            </div>
            <Input label="Full Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} leftIcon={<User size={16} className="text-slate-500" />} />
            <Input label="Email *" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} leftIcon={<Mail size={16} className="text-slate-500" />} />
            <Input label="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} leftIcon={<Phone size={16} className="text-slate-500" />} />
            <Input label="Notes (e.g., Messenger booking, Walk-in)" value={notes} onChange={e => setNotes(e.target.value)} leftIcon={<FileText size={16} className="text-slate-500" />} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('slots')}>← Back</Button>
              <Button variant="neon" size="sm" className="flex-1" loading={saving} onClick={handleCreate}>Create Booking</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
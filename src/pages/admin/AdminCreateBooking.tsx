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
  // Start from 7 days ago
  for (let i = -7; i < 14; i++) {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [dateOffset, setDateOffset] = useState(7); // Start at today (index 7)

  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, Math.min(dateOffset + 7, dates.length));

  useEffect(() => {
    if (open) {
      getAvailability(selectedDate).then(setAvailability);
      setSelectedSlots([]);
      setStep('slots');
    }
  }, [selectedDate, open]);

  const toggleSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlots(prev =>
      prev.find(s => s.id === slot.id)
        ? prev.filter(s => s.id !== slot.id)
        : [...prev, slot]
    );
  };

  const pricePerHour = availability[0]?.price || 0;
  const total = selectedSlots.reduce((sum, s) => sum + (s.price || pricePerHour), 0);

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error('Name is required'); return; }
    if (!customerEmail.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      await api.post('/bookings/admin-create', {
        customerName, customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total,
        notes: notes || undefined,
        status: 'confirmed',
      });
      toast.success('Booking created!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Manual Booking" size="lg">
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'slots' ? 'text-[#7CFC00]' : 'text-white/40'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'slots' ? 'bg-[#7CFC00] text-black' : 'bg-white/10'}`}>1</span>
            Pick Slots
          </div>
          <div className="w-6 h-px bg-white/10" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'details' ? 'text-[#7CFC00]' : 'text-white/40'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'details' ? 'bg-[#7CFC00] text-black' : 'bg-white/10'}`}>2</span>
            Details
          </div>
        </div>

        {step === 'slots' ? (
          <>
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <div className="flex gap-1 flex-1 overflow-x-auto">
                {visibleDates.map(d => {
                  const isSelected = d === selectedDate;
                  const dateObj = new Date(d + 'T12:00:00');
                  const isToday = d === new Date().toISOString().split('T')[0];
                  return (
                    <button key={d} onClick={() => setSelectedDate(d)}
                      className={`flex-shrink-0 flex flex-col items-center py-1.5 px-2 rounded-lg text-xs transition-all ${isSelected ? 'bg-[#7CFC00] text-black' : 'hover:bg-white/8 text-white/70'}`}>
                      <span>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-bold">{dateObj.getDate()}</span>
                      {isToday && <span className="text-[8px] text-[#7CFC00]">TODAY</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))} disabled={dateOffset >= dates.length - 7}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availability.map(slot => {
                const isSelected = selectedSlots.some(s => s.id === slot.id);
                return (
                  <button key={slot.id} onClick={() => toggleSlot(slot)}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected ? 'bg-[#7CFC00] text-black border-[#7CFC00]'
                      : !slot.isAvailable ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
                      : 'border-white/15 text-white/70 hover:border-[#7CFC00]/50'}`}>
                    <div>{format12h(slot.startTime)}</div>
                    <div className="text-[10px] opacity-60">₱{slot.price || pricePerHour}</div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            {selectedSlots.length > 0 && (
              <div className="glass rounded-xl p-3 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span>
                  <span className="text-[#7CFC00] font-bold">₱{total}</span>
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            )}

            <Button variant="neon" size="sm" className="w-full" disabled={selectedSlots.length === 0}
              onClick={() => setStep('details')}>
              Continue to Details
            </Button>
          </>
        ) : (
          <>
            <div className="glass rounded-xl p-3 mb-2 text-sm text-white/50">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedSlots.length}h · ₱{total}
            </div>

            <Input label="Full Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} leftIcon={<User size={16} />} />
            <Input label="Email *" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} leftIcon={<Mail size={16} />} />
            <Input label="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} leftIcon={<Phone size={16} />} />
            <Input label="Notes (e.g., Messenger booking, Walk-in)" value={notes} onChange={e => setNotes(e.target.value)} leftIcon={<FileText size={16} />} />

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('slots')}>← Back</Button>
              <Button variant="neon" size="sm" className="flex-1" loading={saving} onClick={handleCreate}>
                Create Booking
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
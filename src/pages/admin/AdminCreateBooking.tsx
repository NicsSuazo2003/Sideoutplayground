import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
} from 'lucide-react';
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

const isFixedSlot = (slot: TimeSlot): boolean => {
  return slot.startTime === '16:00' && slot.endTime === '18:00';
};

const isPrimeSubSlot = (slot: TimeSlot): boolean => {
  return (
    (slot.startTime === '16:00' && slot.endTime === '17:00') ||
    (slot.startTime === '17:00' && slot.endTime === '18:00')
  );
};

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
    if (open) {
      getAvailability(selectedDate).then(setAvailability);
      setSelectedSlots([]);
      setStep('slots');
    }
  }, [selectedDate, open]);

  // Process availability: merge 16–17 + 17–18 into a single bookable 16–18 prime slot.
  // The prime slot is only bookable when BOTH underlying hours are actually available.
  const processedAvailability = useMemo(() => {
    const filtered = availability.filter((slot) => !isPrimeSubSlot(slot));
    const has4to6 = filtered.some((slot) => isFixedSlot(slot));
    if (has4to6) return filtered;

    const slot4to5 = availability.find(
      (s) => s.startTime === '16:00' && s.endTime === '17:00'
    );
    const slot5to6 = availability.find(
      (s) => s.startTime === '17:00' && s.endTime === '18:00'
    );

    // If the backend no longer returns either hour (e.g. filtered out because booked),
    // do NOT synthesize a bookable prime slot.
    if (!slot4to5 && !slot5to6) return filtered;

    const is4to6Available =
      slot4to5?.isAvailable === true && slot5to6?.isAvailable === true;

    const basePrice =
      slot4to5?.price ??
      slot5to6?.price ??
      availability[0]?.price ??
      0;

    const fixedSlot: TimeSlot = {
      id: `fixed-${selectedDate}-16-18`,
      date: selectedDate,
      startTime: '16:00',
      endTime: '18:00',
      isAvailable: is4to6Available,
      price: basePrice * 2,
    };

    return [...filtered, fixedSlot].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [availability, selectedDate]);

  const toggleSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlots((prev) =>
      prev.find((s) => s.id === slot.id) ? prev.filter((s) => s.id !== slot.id) : [...prev, slot]
    );
  };

  const pricePerHour = availability[0]?.price || 0;
  const total = selectedSlots.reduce((sum, s) => sum + (s.price || pricePerHour), 0);

  const handleCreate = async () => {
    if (!customerName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!customerEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    setSaving(true);
    try {
      // Expand any selected prime (16:00–18:00) slot into two real 1-hour slots
      // so the backend marks both 16–17 and 17–18 as taken.
      const apiSlots = selectedSlots.flatMap((s) => {
        if (isFixedSlot(s)) {
          const half = (s.price || 0) / 2;
          return [
            { startTime: '16:00', endTime: '17:00', price: half },
            { startTime: '17:00', endTime: '18:00', price: half },
          ];
        }
        return [{ startTime: s.startTime, endTime: s.endTime, price: s.price }];
      });

      await api.post('/bookings/admin-create', {
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        date: selectedDate,
        slots: apiSlots.map(({ startTime, endTime }) => ({ startTime, endTime })),
        totalAmount: total,
        notes: notes || undefined,
        status: 'confirmed',
      });
      toast.success('Manual booking created!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manual Walk-in / Phone Booking" size="lg">
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div
            className={`flex items-center gap-2 text-xs font-bold ${
              step === 'slots' ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                step === 'slots' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </span>
            <span>Select Hours</span>
          </div>

          <div className="h-px w-6 bg-slate-200" />

          <div
            className={`flex items-center gap-2 text-xs font-bold ${
              step === 'details' ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                step === 'details' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span>Player Details</span>
          </div>
        </div>

        {step === 'slots' ? (
          <>
            {/* Date Navigator */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                disabled={dateOffset === 0}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-25 transition"
                aria-label="Previous day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="-mx-1 flex flex-1 gap-1 overflow-x-auto no-scrollbar snap-x px-1">
                {visibleDates.map((d) => {
                  const isSelected = d === selectedDate;
                  const dateObj = new Date(d + 'T12:00:00');
                  const isToday = d === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`flex min-w-[50px] flex-1 snap-center flex-col items-center justify-center rounded-lg py-1.5 px-1 transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                      }`}
                    >
                      <span className="text-[9px] font-semibold uppercase leading-none">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-black leading-tight my-0.5">
                        {dateObj.getDate()}
                      </span>
                      {isToday && (
                        <span
                          className={`text-[7px] font-black uppercase ${
                            isSelected ? 'text-teal-100' : 'text-teal-600'
                          }`}
                        >
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))}
                disabled={dateOffset >= dates.length - 7}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-25 transition"
                aria-label="Next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {processedAvailability.map((slot) => {
                const isSelected = selectedSlots.some((s) => s.id === slot.id);
                const fixed = isFixedSlot(slot);

                return (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlot(slot)}
                    disabled={!slot.isAvailable}
                    className={`relative flex min-h-[54px] flex-col items-center justify-center rounded-xl p-2 text-center text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : !slot.isAvailable
                        ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                        : fixed
                        ? 'border-amber-300 bg-amber-50 text-slate-800 hover:bg-amber-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500'
                    }`}
                  >
                    {fixed && (
                      <span className="absolute -top-1.5 right-1.5 flex items-center gap-0.5 bg-amber-400 text-white text-[7px] font-black px-1 rounded-full shadow-2xs">
                        <Star size={7} fill="currentColor" /> 2hr
                      </span>
                    )}

                    <div className="font-bold leading-tight">{format12h(slot.startTime)}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-teal-100' : fixed ? 'text-amber-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      ₱{slot.price || pricePerHour}
                    </div>

                    {isSelected && (
                      <Check size={11} className="absolute top-1 right-1 text-white" />
                    )}
                    {!slot.isAvailable && (
                      <Lock size={10} className="absolute top-1 right-1 text-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection Overview Banner */}
            {selectedSlots.length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">
                    {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-base font-black text-teal-600">₱{total}</span>
              </div>
            )}

            <Button
              variant="neon"
              size="md"
              className="w-full font-bold"
              disabled={selectedSlots.length === 0}
              onClick={() => setStep('details')}
              rightIcon={<ArrowRight size={14} />}
            >
              Continue to Details
            </Button>
          </>
        ) : (
          /* Step 2: Customer Input Form */
          <>
            <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50/50 p-2.5 text-xs text-slate-600">
              <span>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {selectedSlots.length}h
              </span>
              <span className="font-bold text-teal-700">Total: ₱{total}</span>
            </div>

            <div className="space-y-3">
              <Input
                label="Customer / Group Name *"
                placeholder="Walk-in Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                leftIcon={<User size={15} className="text-slate-400" />}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                leftIcon={<Mail size={15} className="text-slate-400" />}
              />
              <Input
                label="Contact Phone"
                placeholder="09xx-xxx-xxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                leftIcon={<Phone size={15} className="text-slate-400" />}
              />
              <Input
                label="Administrative Notes"
                placeholder="e.g. Paid in Cash, Messenger Reservation, Walk-in"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                leftIcon={<FileText size={15} className="text-slate-400" />}
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep('slots')}
                leftIcon={<ArrowLeft size={14} />}
              >
                Back
              </Button>
              <Button
                variant="neon"
                size="md"
                className="flex-1 font-bold shadow-md"
                loading={saving}
                onClick={handleCreate}
              >
                Confirm &amp; Create Booking
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
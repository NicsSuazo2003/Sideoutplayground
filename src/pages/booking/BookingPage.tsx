import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  Zap,
  Wind,
  Shield,
  Droplets,
  ParkingCircle,
  Tv2,
  Users,
  User,
  Mail,
  Phone,
  FileText,
  CalendarDays,
  ArrowRight,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../../stores/bookingStore';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Input } from '../../components/ui/Input';
import type { TimeSlot } from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5154';

function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  'LED Lighting': Zap,
  'Air Conditioning': Wind,
  'Professional Nets': Shield,
  'Seating Area': Users,
  'Water Station': Droplets,
  'Locker Rooms': Shield,
  'Pro Shop': Tv2,
  Parking: ParkingCircle,
};

function getDateStrip(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function BookingPage() {
  const navigate = useNavigate();
  const {
    court,
    selectedDate,
    selectedSlots,
    availability,
    isLoading,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setNotes,
    fetchCourt,
    fetchAvailability,
    setSelectedDate,
    selectSlot,
    deselectSlot,
  } = useBookingStore();

  const [dateOffset, setDateOffset] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, dateOffset + 7);

  useEffect(() => {
    fetchCourt();
  }, []);

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    const already = selectedSlots.find((s) => s.id === slot.id);
    if (already) deselectSlot(slot.id);
    else selectSlot(slot);
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0) {
      toast.error('Select at least one time slot');
      return;
    }
    setShowDetailsForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error('Valid email is required');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    navigate('/book/checkout');
  };

  const pricePerHour = court?.pricePerHour || 20;
  const subtotal = selectedSlots.reduce((sum, slot) => sum + (slot.price || pricePerHour), 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Court Banner Info */}
        {court && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                <img
                  src={getImageUrl(court.imageUrl)}
                  alt={court.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent sm:hidden" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 sm:hidden">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 backdrop-blur-sm">
                    {court.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="hidden items-center gap-2 mb-1 sm:flex">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                        {court.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                      </span>
                      <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-600">
                        Active
                      </span>
                    </div>
                    <h1 className="truncate text-lg font-black text-slate-800 sm:text-xl">
                      {court.name}
                    </h1>
                    <p className="text-xs text-slate-400 sm:text-sm">
                      {court.dimensions} · {court.surface}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xl font-black text-teal-600 sm:text-2xl">
                      ₱{court.pricePerHour}
                      <span className="text-xs font-normal text-slate-400 sm:text-sm">/hr</span>
                    </div>
                    <StarRating rating={court.rating} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {court.amenities.slice(0, 5).map((a) => {
                    const Icon = AMENITY_ICONS[a] || Zap;
                    return (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 sm:text-xs"
                      >
                        <Icon size={12} className="text-teal-600 shrink-0" />
                        <span className="truncate">{a}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step Indicator */}
        <div className="mb-5 flex items-center gap-3 px-1">
          <div
            className={`flex items-center gap-2 text-xs font-bold sm:text-sm ${
              !showDetailsForm ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shadow-sm sm:h-7 sm:w-7 ${
                !showDetailsForm ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </span>
            <span>Select Slots</span>
          </div>

          <div className="h-px w-6 bg-slate-200 sm:w-10" />

          <div
            className={`flex items-center gap-2 text-xs font-bold sm:text-sm ${
              showDetailsForm ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shadow-sm sm:h-7 sm:w-7 ${
                showDetailsForm ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span>Your Details</span>
          </div>
        </div>

        {!showDetailsForm ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {/* Responsive Date Selector */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">Choose Date</h2>
                  </div>

                  <div className="hidden gap-1 sm:flex">
                    <button
                      onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                      disabled={dateOffset === 0}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25"
                      aria-label="Previous dates"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setDateOffset(Math.min(7, dateOffset + 1))}
                      disabled={dateOffset >= 7}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25"
                      aria-label="Next dates"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Mobile Snap-Scroll Track */}
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                  <div className="flex gap-2 sm:grid sm:grid-cols-7 sm:gap-1.5 snap-x">
                    {visibleDates.map((d) => {
                      const isSelected = d === selectedDate;
                      const dateObj = new Date(d + 'T12:00:00');
                      const isToday = d === new Date().toISOString().split('T')[0];

                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`relative flex min-w-[56px] flex-1 snap-center flex-col items-center justify-center rounded-xl py-2 px-1.5 transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25 ring-2 ring-teal-600 ring-offset-2'
                              : 'bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80'
                          }`}
                        >
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-tight ${
                              isSelected ? 'text-teal-100' : 'text-slate-400'
                            }`}
                          >
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>

                          <span className="my-0.5 text-base font-extrabold sm:text-lg">
                            {dateObj.getDate()}
                          </span>

                          <span
                            className={`text-[9px] uppercase font-bold tracking-tighter ${
                              isToday
                                ? isSelected
                                  ? 'text-white'
                                  : 'text-teal-600'
                                : 'opacity-0'
                            }`}
                          >
                            TODAY
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                      Available Slots
                    </h2>
                    <p className="text-xs text-slate-400">
                      <span className="sm:hidden">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="hidden sm:inline">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Compact Status Indicator */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full border border-slate-300 bg-white" />
                      Open
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-teal-600" />
                      Picked
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                      Locked
                    </span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center">
                    <LoadingSpinner size={28} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {availability.map((slot) => {
                      const isSelected = selectedSlots.some((s) => s.id === slot.id);

                      return (
                        <motion.button
                          key={slot.id}
                          whileTap={slot.isAvailable ? { scale: 0.96 } : {}}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!slot.isAvailable}
                          className={`relative flex min-h-[58px] flex-col items-center justify-center rounded-xl p-2 text-center transition-all border ${
                            isSelected
                              ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20'
                              : !slot.isAvailable
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50/50'
                          }`}
                        >
                          <div className="text-xs font-bold leading-tight sm:text-sm">
                            {format12h(slot.startTime)}
                          </div>
                          <div
                            className={`text-[10px] font-medium leading-none mt-0.5 ${
                              isSelected ? 'text-teal-100' : 'text-slate-400'
                            }`}
                          >
                            ₱{slot.price || pricePerHour}
                          </div>

                          {isSelected && (
                            <Check size={13} className="absolute top-1.5 right-1.5 text-white" />
                          )}
                          {!slot.isAvailable && (
                            <Lock size={11} className="absolute top-1.5 right-1.5 text-slate-300" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Booking Summary Sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-bold text-slate-800">Booking Summary</h2>
                <div className="mb-4 mt-1 text-xs text-slate-400">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">
                    Pick any available time slots to review reservation
                  </div>
                ) : (
                  <>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {selectedSlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                          >
                            <span className="font-semibold text-slate-700">
                              {format12h(slot.startTime)} – {format12h(slot.endTime)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-500">
                                ₱{slot.price || pricePerHour}
                              </span>
                              <button
                                onClick={() => deselectSlot(slot.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          Total ({selectedSlots.length} {selectedSlots.length === 1 ? 'hr' : 'hrs'})
                        </span>
                        <span className="text-xl font-black text-teal-600">₱{subtotal}</span>
                      </div>
                    </div>

                    <Button
                      variant="neon"
                      size="lg"
                      className="mt-4 w-full"
                      onClick={handleBookNow}
                    >
                      Book Now
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          /* Step 2: Contact Form */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">Your Details</h2>
                <button
                  onClick={() => setShowDetailsForm(false)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  ← Modify slots
                </button>
              </div>

              <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Reservation:</span>{' '}
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {selectedSlots.length} {selectedSlots.length === 1 ? 'hr' : 'hrs'} ·{' '}
                <span className="font-bold text-teal-600">₱{subtotal}</span>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <Input
                  label="Full Name *"
                  placeholder="Juan Dela Cruz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  leftIcon={<User size={16} />}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="you@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                />
                <Input
                  label="Contact Phone *"
                  placeholder="09xx-xxx-xxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  leftIcon={<Phone size={16} />}
                />
                <Input
                  label="Special Notes (Optional)"
                  placeholder="Paddle rental, instructor request..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  leftIcon={<FileText size={16} />}
                />
                <Button variant="neon" size="lg" className="w-full mt-2" type="submit">
                  Proceed to Checkout
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      {/* Persistent Floating Bottom Bar on Mobile */}
      <AnimatePresence>
        {!showDetailsForm && selectedSlots.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500">
                  {selectedSlots.length} {selectedSlots.length === 1 ? 'hour' : 'hours'} chosen
                </p>
                <p className="text-lg font-black leading-tight text-teal-600">₱{subtotal}</p>
              </div>

              <Button
                variant="neon"
                size="md"
                onClick={handleBookNow}
                className="shrink-0 font-bold"
                rightIcon={<ArrowRight size={16} />}
              >
                Proceed
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Safe Bottom Spacer */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
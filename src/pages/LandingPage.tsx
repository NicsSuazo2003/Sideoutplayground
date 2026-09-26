import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Wind,
  Droplets,
  Tv2,
  ParkingCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  User,
  Mail,
  Phone,
  FileText,
  Star,
  CalendarDays,
  CreditCard,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../stores/bookingStore';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import type { TimeSlot } from '../types';

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

function formatTimeRange(start: string, end: string): string {
  return `${format12h(start)} - ${format12h(end)}`;
}

const AMENITY_ICONS: Record<string, typeof Zap> = {
  'LED Lighting': Zap,
  'Air Conditioning': Wind,
  'Professional Nets': Shield,
  'Seating Area': Tv2,
  'Water Station': Droplets,
  'Locker Rooms': Shield,
  'Pro Shop': Tv2,
  Parking: ParkingCircle,
};

function getDateStrip(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const isFixedSlot = (slot: TimeSlot): boolean => {
  return slot.startTime === '16:00' && slot.endTime === '18:00';
};

const isRemovedSlot = (slot: TimeSlot): boolean => {
  return (
    (slot.startTime === '16:00' && slot.endTime === '17:00') ||
    (slot.startTime === '17:00' && slot.endTime === '18:00')
  );
};

export function LandingPage() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [isHoveringImg, setIsHoveringImg] = useState(false);

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
  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, Math.min(dateOffset + 7, dates.length));

  const allImages = court?.images?.length
    ? court.images
    : court?.imageUrl
    ? [court.imageUrl]
    : [];

  useEffect(() => {
    fetchCourt();
  }, []);

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (allImages.length <= 1 || isHoveringImg) return;
    const timer = setInterval(() => setCurrentImg((i) => (i + 1) % allImages.length), 4500);
    return () => clearInterval(timer);
  }, [allImages.length, isHoveringImg]);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getProcessedAvailability = (): TimeSlot[] => {
    const filtered = availability.filter((slot) => !isRemovedSlot(slot));
    const has4to6 = filtered.some((slot) => isFixedSlot(slot));

    if (!has4to6) {
      const slot4to5 = availability.find((s) => s.startTime === '16:00' && s.endTime === '17:00');
      const slot5to6 = availability.find((s) => s.startTime === '17:00' && s.endTime === '18:00');
      const is4to6Available =
        slot4to5?.isAvailable !== false && slot5to6?.isAvailable !== false;

      const basePrice = court?.pricePerHour || 150;
      const fixedSlot: TimeSlot = {
        id: `fixed-${selectedDate}-16-18`,
        date: selectedDate,
        startTime: '16:00',
        endTime: '18:00',
        isAvailable: is4to6Available,
        price: basePrice * 2,
      };
      return [...filtered, fixedSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return filtered;
  };

  const processedAvailability = getProcessedAvailability();

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    const already = selectedSlots.find((s) => s.id === slot.id);
    if (already) deselectSlot(slot.id);
    else selectSlot(slot);
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0) {
      toast.error('Select at least one slot');
      return;
    }
    setShowDetailsForm(true);
    scrollToBooking();
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

  const pricePerHour = court?.pricePerHour || 150;
  const subtotal = selectedSlots.reduce((sum, slot) => sum + (slot.price || pricePerHour), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-teal-800 text-white min-h-[85vh] flex items-center pt-20 pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={
              allImages.length > 0
                ? getImageUrl(allImages[currentImg])
                : 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1600'
            }
            alt="Side Out Playground Court"
            className="h-full w-full object-cover object-center transition-all duration-700 brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900/85 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                <Zap size={13} className="fill-current" /> Instant Online Confirmation
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-4">
              Sideout <br />
              <span className="text-amber-300">Playground</span>
            </h1>

            <p className="text-teal-100 text-sm sm:text-lg mb-8 max-w-lg leading-relaxed">
              Experience premier pickleball action at Side Out Playground. Pick your preferred slots, pay seamlessly via Online Payment, and hit the court.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="neon"
                size="lg"
                onClick={scrollToBooking}
                leftIcon={<CalendarDays size={18} />}
                className="font-bold shadow-lg shadow-teal-900/30"
              >
                Reserve a Slot
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/track')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl font-bold"
              >
                Track My Booking
              </Button>
            </div>

            {/* Quick Specs Pill Row */}
            <div className="mt-10 pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6 max-w-md">
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-300">₱{pricePerHour}</p>
                <p className="text-[11px] text-teal-200">Rate / Hour</p>
              </div>
              <div className="border-l border-white/15 pl-3 sm:pl-6">
                <p className="text-xs sm:text-sm font-bold text-white mt-1">
                  {court ? `${format12h(court.openTime)} - ${format12h(court.closeTime)}` : '5AM - 12AM'}
                </p>
                <p className="text-[11px] text-teal-200">Daily Hours</p>
              </div>
              <div className="border-l border-white/15 pl-3 sm:pl-6">
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-white">{court?.rating || '4.9'}</span>
                </div>
                <p className="text-[11px] text-teal-200">Court Score</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Reservation Section */}
      <section ref={bookingSectionRef} className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Select Your Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick your game date, tap preferred hours, and complete your reservation details.
            </p>
          </div>

          {!showDetailsForm ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Responsive Date Strip */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-teal-600" />
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">Choose Date</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => datePickerRef.current?.showPicker()}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition"
                        title="Jump to date"
                      >
                        <CalendarDays size={16} />
                      </button>
                      <input
                        ref={datePickerRef}
                        type="date"
                        className="sr-only"
                        min={dates[0]}
                        max={dates[dates.length - 1]}
                        value={selectedDate}
                        onChange={(e) => {
                          const picked = e.target.value;
                          if (picked) {
                            setSelectedDate(picked);
                            const today = new Date();
                            const pickedDate = new Date(picked + 'T12:00:00');
                            const diffDays = Math.floor(
                              (pickedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            setDateOffset(Math.max(0, Math.min(diffDays, dates.length - 7)));
                          }
                        }}
                      />
                      <button
                        onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                        disabled={dateOffset === 0}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))}
                        disabled={dateOffset >= dates.length - 7}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scroll on Mobile */}
                  <div className="-mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 no-scrollbar">
                    <div className="flex gap-2 sm:grid sm:grid-cols-7 snap-x">
                      {visibleDates.map((d) => {
                        const isSelected = d === selectedDate;
                        const dateObj = new Date(d + 'T12:00:00');
                        const isToday = d === new Date().toISOString().split('T')[0];

                        return (
                          <button
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={`flex min-w-[56px] flex-1 snap-center flex-col items-center justify-center rounded-xl py-2 px-1 transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white font-bold shadow-md ring-2 ring-teal-600 ring-offset-2'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-semibold uppercase ${
                                isSelected ? 'text-teal-100' : 'text-slate-400'
                              }`}
                            >
                              {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-base sm:text-lg font-black my-0.5">
                              {dateObj.getDate()}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold ${
                                isToday ? (isSelected ? 'text-white' : 'text-teal-600') : 'opacity-0'
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

                {/* Available Time Slots Grid */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                        Available Hours
                      </h3>
                      <p className="text-xs text-slate-400">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Dot Legend */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full border border-slate-300 bg-white" />
                        Open
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-teal-600" />
                        Selected
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        2hr Prime
                      </span>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <LoadingSpinner size={28} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {processedAvailability.map((slot) => {
                        const isSelected = selectedSlots.some((s) => s.id === slot.id);
                        const fixed = isFixedSlot(slot);

                        return (
                          <motion.button
                            key={slot.id}
                            whileTap={slot.isAvailable ? { scale: 0.97 } : {}}
                            onClick={() => handleSlotClick(slot)}
                            disabled={!slot.isAvailable}
                            className={`relative flex min-h-[60px] flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all border ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                                : !slot.isAvailable
                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                : fixed
                                ? 'border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50/50'
                            }`}
                          >
                            {fixed && (
                              <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-amber-950 uppercase shadow-sm">
                                2hr prime
                              </span>
                            )}

                            <div className="text-xs font-bold leading-tight">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </div>
                            <div
                              className={`text-[10px] font-semibold mt-0.5 ${
                                isSelected ? 'text-teal-100' : fixed ? 'text-amber-700' : 'text-slate-400'
                              }`}
                            >
                              ₱{slot.price || pricePerHour}
                            </div>

                            {isSelected && (
                              <Check size={14} className="absolute top-1.5 right-1.5 text-white" />
                            )}
                            {!slot.isAvailable && (
                              <Lock size={12} className="absolute top-1.5 right-1.5 text-slate-300" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Sticky Summary Sidebar */}
              <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-base">Booking Summary</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  {selectedSlots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">
                      Tap available hours to add to your reservation
                    </div>
                  ) : (
                    <>
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {selectedSlots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot) => {
                            const fixed = isFixedSlot(slot);
                            return (
                              <div
                                key={slot.id}
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                                  fixed ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'
                                }`}
                              >
                                <span className={fixed ? 'font-bold text-amber-900' : 'font-semibold text-slate-700'}>
                                  {formatTimeRange(slot.startTime, slot.endTime)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-600">₱{slot.price || pricePerHour}</span>
                                  <button
                                    onClick={() => deselectSlot(slot.id)}
                                    className="text-slate-400 hover:text-red-500 transition"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-slate-500">
                            Subtotal ({selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''})
                          </span>
                          <span className="text-xl font-black text-teal-600">₱{subtotal}</span>
                        </div>
                      </div>

                      <Button
                        variant="neon"
                        size="lg"
                        className="mt-4 w-full font-bold shadow-md"
                        onClick={handleBookNow}
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Proceed with Booking
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Details Contact Form */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg">Contact Information</h3>
                  <button
                    onClick={() => setShowDetailsForm(false)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    ← Modify slots
                  </button>
                </div>

                <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Reservation:</span>{' '}
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} ·{' '}
                  <span className="font-bold text-teal-600">₱{subtotal}</span>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Juan Dela Cruz"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    leftIcon={<User size={16} className="text-slate-400" />}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="name@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    leftIcon={<Mail size={16} className="text-slate-400" />}
                  />
                  <Input
                    label="Mobile Phone *"
                    placeholder="09xx-xxx-xxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    leftIcon={<Phone size={16} className="text-slate-400" />}
                  />
                  <Input
                    label="Special Notes (Optional)"
                    placeholder="e.g. paddle rental, beginner briefing"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    leftIcon={<FileText size={16} className="text-slate-400" />}
                  />
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full font-bold shadow-md mt-2"
                    type="submit"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Proceed to Payment Checkout
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Facility Features & Court Info Section */}
      {court && (
        <section className="py-14 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  Facility Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 mb-3">
                  {court.name}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                  {court.indoor ? 'Indoor tournament court' : 'Outdoor ventilated court'} featuring professional {court.surface} sports surfacing. Built for both fast-paced casual open play and competitive match sessions.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Hourly Rate</p>
                    <p className="text-xl font-black text-teal-600">₱{pricePerHour}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Dimensions</p>
                    <p className="text-sm font-bold text-slate-700">{court.dimensions || '20 x 44 ft'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Included Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {court.amenities.map((a) => {
                      const Icon = AMENITY_ICONS[a] || CheckCircle;
                      return (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          <Icon size={13} className="text-teal-600" /> {a}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Court Media Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-72 sm:h-96">
                <img
                  src={
                    allImages.length > 0
                      ? getImageUrl(allImages[0])
                      : 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg'
                  }
                  alt={court.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-md backdrop-blur-sm">
                  <MapPin size={15} className="text-teal-600" />
                  <span>Purok Million, Dawis, Tandag City</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Grid */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Quick Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">How It Works</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: CalendarDays, step: '01', title: 'Pick a Date', desc: 'Choose any date up to 30 days ahead.' },
              { icon: Clock, step: '02', title: 'Select Slots', desc: 'Tap one or multiple slots matching your game.' },
              { icon: Users, step: '03', title: 'Player Details', desc: 'Provide contact info for instant confirmation.' },
              { icon: CreditCard, step: '04', title: 'GCash Payment', desc: 'Upload your receipt slip to verify reservation.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative">
                <span className="absolute top-3 right-3 text-3xl font-black text-slate-100">
                  {item.step}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-3">
                  <item.icon size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Sticky Reservation Bottom Bar */}
      <AnimatePresence>
        {!showDetailsForm && selectedSlots.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500">
                  {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-lg font-black leading-tight text-teal-600">₱{subtotal}</p>
              </div>
              <Button
                variant="neon"
                size="md"
                onClick={handleBookNow}
                className="font-bold shrink-0"
                rightIcon={<ArrowRight size={16} />}
              >
                Proceed
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 sm:hidden" />
    </div>
  );
}
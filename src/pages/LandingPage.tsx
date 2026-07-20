import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap, Shield, Wind, Droplets, Tv2, ParkingCircle, ChevronLeft, ChevronRight, Lock, Check, User, Mail, Phone, FileText, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../stores/bookingStore';
import { getCourt } from '../services/courtService';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import type { Court, TimeSlot } from '../types';

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

const amenityIcons: Record<string, typeof Zap> = {
  'LED Lighting': Zap, 'Air Conditioning': Wind, 'Professional Nets': Shield,
  'Seating Area': Tv2, 'Water Station': Droplets, 'Locker Rooms': Shield,
  'Pro Shop': Tv2, 'Parking': ParkingCircle,
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

const isFixedSlot = (slot: TimeSlot): boolean => {
  return slot.startTime === '16:00' && slot.endTime === '18:00';
};

const isRemovedSlot = (slot: TimeSlot): boolean => {
  return (slot.startTime === '16:00' && slot.endTime === '17:00') ||
         (slot.startTime === '17:00' && slot.endTime === '18:00') ||
         (slot.startTime === '18:00' && slot.endTime === '19:00');
};

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'book'>('about');
  const [court, setCourt] = useState<Court | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isHoveringImg, setIsHoveringImg] = useState(false);

  const {
    selectedDate, selectedSlots, availability, isLoading,
    customerName, customerEmail, customerPhone, notes,
    setCustomerName, setCustomerEmail, setCustomerPhone, setNotes,
    fetchCourt, fetchAvailability, setSelectedDate, selectSlot, deselectSlot,
  } = useBookingStore();

  const [dateOffset, setDateOffset] = useState(0);
  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, Math.min(dateOffset + 7, dates.length));

  const allImages = court?.images?.length ? court.images : court?.imageUrl ? [court.imageUrl] : [];

  useEffect(() => {
    if (allImages.length <= 1 || isHoveringImg) return;
    const timer = setInterval(() => setCurrentImg(i => (i + 1) % allImages.length), 4000);
    return () => clearInterval(timer);
  }, [allImages.length, isHoveringImg]);

  useEffect(() => { getCourt().then(setCourt).catch(() => {}); }, []);
  useEffect(() => { fetchCourt(); }, []);
  
  useEffect(() => {
    if (activeTab === 'book') {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'about') {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      fetchAvailability(today);
    }
  }, [activeTab]);

  const getProcessedAvailability = (): TimeSlot[] => {
    const filtered = availability.filter(slot => !isRemovedSlot(slot));
    const has4to6 = filtered.some(slot => isFixedSlot(slot));
    if (!has4to6) {
      const basePrice = court?.pricePerHour || 150;
      const fixedSlot: TimeSlot = {
        id: `fixed-${selectedDate}-16-18`,
        date: selectedDate,
        startTime: '16:00',
        endTime: '18:00',
        isAvailable: true,
        price: basePrice * 2,
      };
      return [...filtered, fixedSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return filtered;
  };

  const processedAvailability = getProcessedAvailability();

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    const already = selectedSlots.find(s => s.id === slot.id);
    if (already) deselectSlot(slot.id);
    else selectSlot(slot);
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0) { toast.error('Select at least one slot'); return; }
    setShowDetailsForm(true);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { toast.error('Name is required'); return; }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) { toast.error('Valid email is required'); return; }
    if (!customerPhone.trim()) { toast.error('Phone number is required'); return; }
    navigate('/book/checkout');
  };

  const nextImg = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImg((i) => (i + 1) % allImages.length); };
  const prevImg = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImg((i) => (i === 0 ? allImages.length - 1 : i - 1)); };

  const pricePerHour = court?.pricePerHour || 20;
  const subtotal = selectedSlots.reduce((sum, slot) => sum + (slot.price || pricePerHour), 0);

  return (
    <div className="pt-16">
      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          <button onClick={() => { setActiveTab('about'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            About
          </button>
          <button onClick={() => { setActiveTab('book'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            Book a Court
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* ABOUT TAB */}
      {/* ========================================== */}
      {activeTab === 'about' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Hero */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4 bg-gradient-to-b from-teal-600 to-teal-700">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px]" />
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto relative z-10">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
                <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                  <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
                </div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
                One Court.{' '}<span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">Infinite </span>
                <span className="text-white">Games.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="text-white/80 text-lg sm:text-xl max-w-xl mx-auto mb-8">
                Book your slot at our premium pickleball court — fresh air, open space, and ready for play.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-3">
                <Button variant="neon" size="lg" onClick={() => setActiveTab('book')}>
                  <Zap size={18} /> Book a Slot
                </Button>
                <span className="text-white/70 text-sm">Starting at <span className="text-amber-400 font-bold">₱{pricePerHour}/hr</span></span>
              </motion.div>
            </motion.div>
          </section>

          {/* Court Showcase */}
          <section className="py-12 px-4 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-teal-600 text-sm font-bold tracking-widest uppercase mb-2">Our Facility</div>
                <h2 className="text-4xl font-black text-slate-800">{court?.name || 'Side Out Arena'}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group border border-slate-200 shadow-md" 
                     onClick={() => setActiveTab('book')}
                     onMouseEnter={() => setIsHoveringImg(true)}
                     onMouseLeave={() => setIsHoveringImg(false)}>
                  <AnimatePresence mode="wait">
                    <motion.img key={currentImg} src={allImages.length > 0 ? getImageUrl(allImages[currentImg]) : 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg'}
                      alt="Court" className="w-full h-full object-cover absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                  
                  {allImages.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-0 flex items-center px-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={prevImg} className="p-2 rounded-full bg-slate-800/50 text-white hover:bg-slate-800/80 backdrop-blur-md"><ChevronLeft size={20} /></button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={nextImg} className="p-2 rounded-full bg-slate-800/50 text-white hover:bg-slate-800/80 backdrop-blur-md"><ChevronRight size={20} /></button>
                      </div>
                      <div className="absolute bottom-4 right-0 left-0 flex justify-center gap-1">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className="p-1 cursor-pointer" aria-label={`Go to slide ${i + 1}`}>
                            <div className={`h-2 rounded-full transition-all ${i === currentImg ? 'bg-teal-600 w-6' : 'bg-white/40 w-2 hover:bg-white/70'}`} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">{court?.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    <span className="px-3 py-1 rounded-full bg-teal-600/20 text-teal-600 border border-teal-600/30 text-xs font-semibold capitalize">{court?.status || 'Active'}</span>
                  </div>
                </div>
                
                <div>
                  <StarRating rating={court?.rating || 4.9} />
                  <h3 className="text-3xl font-bold text-slate-800 mt-3 mb-2">{court?.name || 'Side Out Arena'}</h3>
                  <p className="text-slate-500 text-sm mb-1">{court?.dimensions || '60ft x 30ft'} - {court?.surface || 'Acrylic Hard Court'}</p>
                  <div className="text-4xl font-black text-teal-600 mb-6">₱{pricePerHour}<span className="text-xl font-normal text-slate-400">/hr</span></div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(court?.amenities || ['LED Lighting', 'Air Conditioning', 'Professional Nets', 'Seating Area', 'Water Station', 'Locker Rooms', 'Pro Shop', 'Parking']).map(a => {
                      const Icon = amenityIcons[a] || Zap;
                      return <div key={a} className="flex items-center gap-2 text-slate-600 text-sm"><Icon size={16} className="text-teal-600 shrink-0" />{a}</div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hours & Location */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="glass-card p-6 border border-slate-200 flex flex-col h-full">
                  <h3 className="text-slate-800 font-bold mb-3">🕐 Operating Hours</h3>
                  <p className="text-slate-600 text-sm">Open Daily: {court ? `${format12h(court.openTime)} – ${format12h(court.closeTime)}` : '3:00 PM – 12:00 AM'}</p>
                  <p className="text-slate-500 text-xs mt-2">Book up to 7 days in advance.</p>
                </div>
                <div className="glass-card p-6 border border-slate-200 flex flex-col h-full">
                  <h3 className="text-slate-800 font-bold mb-3">📍 Location</h3>
                  <p className="text-slate-600 text-sm">Purok Million, Barangay San Agustin Sur</p>
                  <p className="text-slate-600 text-sm mb-4">Tandag City, Surigao del Sur 8300</p>
                  
                  <div className="mt-auto space-y-3">
                    <a href="tel:+639058100973" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm transition-colors w-fit">
                      <Phone size={16} /> 0905 810 0973
                    </a>
                    <a 
                      href="https://maps.google.com/?q=Purok+Million,+Barangay+San+Agustin+Sur,+Tandag+City" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors w-fit"
                    >
                      <ParkingCircle size={14} /> Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Availability Preview */}
          <section className="py-12 px-4 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-teal-600 text-sm font-bold tracking-widest uppercase mb-2">Today's Schedule</div>
                <h2 className="text-3xl font-black text-slate-800">Court Availability</h2>
                <p className="text-slate-500 text-sm mt-2">Tap an open slot below to secure it.</p>
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                {isLoading ? <LoadingSpinner size={24} /> : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {processedAvailability.map(slot => {
                      const fixed = isFixedSlot(slot);
                      return (
                        <div 
                          key={slot.id} 
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-colors relative ${
                            slot.isAvailable 
                              ? fixed 
                                ? 'border-amber-400/50 bg-amber-50 text-slate-800 cursor-pointer hover:bg-amber-100' 
                                : 'border-teal-600/30 bg-teal-50 text-slate-800 cursor-pointer hover:bg-teal-100'
                              : 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed'
                          }`} 
                          onClick={() => { 
                            if(slot.isAvailable) {
                              selectSlot(slot);
                              setActiveTab('book'); 
                            }
                          }}
                        >
                          {fixed && (
                            <span className="absolute top-0.5 right-0.5 flex items-center gap-0.5 bg-amber-400 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                              <Star size={8} fill="currentColor" /> 2hr
                            </span>
                          )}
                          <span className="font-bold text-xs">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                          {slot.isAvailable ? (
                            <span className={`text-xs font-semibold mt-1 ${fixed ? 'text-amber-600' : 'text-teal-600'}`}>
                              ₱{slot.price || pricePerHour}
                            </span>
                          ) : (
                            <Lock size={12} className="mt-1 opacity-30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* ========================================== */}
      {/* BOOK TAB */}
      {/* ========================================== */}
      {activeTab === 'book' && !showDetailsForm && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">Reserve a Court</h2>
            <p className="text-slate-500 text-sm">₱{pricePerHour}/hour • Book up to 1 week in advance</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Date Picker */}
              <div className="glass-card p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-slate-800 font-bold">Select Date</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))} disabled={dateOffset >= dates.length - 7} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {visibleDates.map(d => {
                    const isSelected = d === selectedDate;
                    const dateObj = new Date(d + 'T12:00:00');
                    const isToday = d === new Date().toISOString().split('T')[0];
                    return (
                      <button key={d} onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 ${isSelected ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
                        <span className="text-[10px] font-semibold uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className={`text-lg font-black leading-none mt-0.5`}>{dateObj.getDate()}</span>
                        <span className="text-[9px] text-slate-400">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                        {isToday && <span className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-teal-600'}`}>TODAY</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="glass-card p-4 border border-slate-200">
                <h2 className="text-slate-800 font-bold mb-3">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {isLoading ? <LoadingSpinner size={24} /> : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {processedAvailability.map(slot => {
                      const isSelected = selectedSlots.some(s => s.id === slot.id);
                      const fixed = isFixedSlot(slot);
                      return (
                        <motion.button 
                          key={slot.id} 
                          whileHover={slot.isAvailable ? { scale: 1.04 } : {}} 
                          whileTap={slot.isAvailable ? { scale: 0.97 } : {}}
                          onClick={() => handleSlotClick(slot)}
                          className={`relative p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                              : !slot.isAvailable 
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                : fixed
                                  ? 'border-amber-400/50 bg-amber-50 text-slate-700 hover:border-amber-400 hover:bg-amber-100'
                                  : 'border-slate-200 text-slate-600 hover:border-teal-600/50 hover:bg-teal-50 hover:text-slate-800'
                          }`}
                        >
                          {fixed && (
                            <span className="absolute top-0.5 right-0.5 flex items-center gap-0.5 bg-amber-400 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                              <Star size={8} fill="currentColor" /> 2hr
                            </span>
                          )}
                          <div className="text-center">
                            <div className={`font-bold text-xs leading-tight ${fixed && !isSelected ? 'text-amber-600' : ''}`}>
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </div>
                            <div className={`text-[10px] mt-0.5 ${fixed && !isSelected ? 'text-amber-500' : isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                              ₱{slot.price || pricePerHour}
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="absolute top-1.5 right-1.5 text-white" />}
                          {!slot.isAvailable && <Lock size={12} className="absolute top-1.5 right-1.5 text-slate-300" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-slate-200 inline-block" />Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-600 inline-block" />Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 inline-block" />Unavailable</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400/50 border border-amber-400/50 inline-block" />2hr Fixed</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Booking Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="glass-card p-5 border border-slate-200">
                <h2 className="text-slate-800 font-bold mb-4">Booking Summary</h2>
                <div className="text-slate-500 text-sm mb-4">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {selectedSlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Tap vacant slots to add to your booking</div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => {
                        const fixed = isFixedSlot(slot);
                        return (
                          <div key={slot.id} className={`flex items-center justify-between text-sm ${fixed ? 'bg-amber-50 rounded-lg px-2 py-1' : ''}`}>
                            <span className={fixed ? 'text-amber-600' : 'text-slate-600'}>
                              {formatTimeRange(slot.startTime, slot.endTime)}
                              {fixed && <span className="ml-1 text-[10px] text-amber-500 font-bold">2hr Fixed</span>}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={fixed ? 'text-amber-600' : 'text-slate-500'}>₱{slot.price || pricePerHour}</span>
                              <button onClick={() => deselectSlot(slot.id)} className="text-slate-400 hover:text-red-500">×</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between font-black text-lg">
                        <span className="text-slate-800">{selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}</span>
                        <span className="text-teal-600">₱{subtotal}</span>
                      </div>
                    </div>
                    <Button variant="neon" size="lg" className="w-full mt-5" onClick={handleBookNow}>Book Now</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS FORM */}
      {activeTab === 'book' && showDetailsForm && (
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="glass-card p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-800 font-bold">Your Details</h2>
              <button onClick={() => setShowDetailsForm(false)} className="text-xs text-slate-400 hover:text-slate-600">← Back</button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm text-slate-500">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} · ₱{subtotal}
            </div>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <Input label="Full Name *" placeholder="Juan Dela Cruz" value={customerName} onChange={e => setCustomerName(e.target.value)} leftIcon={<User size={16} />} />
              <Input label="Email *" type="email" placeholder="you@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} leftIcon={<Mail size={16} />} />
              <Input label="Phone *" placeholder="09xx-xxx-xxxx" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} leftIcon={<Phone size={16} />} />
              <Input label="Notes (optional)" placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} leftIcon={<FileText size={16} />} />
              <Button variant="neon" size="lg" className="w-full" type="submit">Proceed to Checkout</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
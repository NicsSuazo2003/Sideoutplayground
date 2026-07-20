import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap, Shield, Wind, Droplets, Tv2, ParkingCircle, ChevronLeft, ChevronRight, Lock, Check, User, Mail, Phone, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBookingStore } from '../stores/bookingStore';
import { getCourt } from '../services/courtService';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import type { Court, TimeSlot } from '../types';
import { CalendarDays, CreditCard, MapPin, Star, Users, Wifi, Lightbulb, Clock, CheckCircle } from 'lucide-react';

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
      <div>
      {/* Tab Navigation */}
      <div className="bg-teal-600 pt-4 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
            <button onClick={() => { setActiveTab('about'); setShowDetailsForm(false); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-white text-teal-700 shadow-md' : 'text-teal-100 hover:text-white'}`}>
              About
            </button>
            <button onClick={() => { setActiveTab('book'); setShowDetailsForm(false); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-white text-teal-700 shadow-md' : 'text-teal-100 hover:text-white'}`}>
              Book a Court
            </button>
          </div>
        </div>
      </div>

     {/* ABOUT TAB */}
{activeTab === 'about' && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {/* Hero */}
    <section className="relative bg-teal-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700/80 to-teal-500/60" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Side Out Playground" className="w-12 h-12 object-contain rounded-xl bg-white/10 p-2" />
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium">
              <Zap size={13} fill="currentColor" /> Now Open for Bookings
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Book Your<br />
            <span className="text-amber-300">Pickleball Court</span><br />
            in Seconds
          </h1>
          <p className="text-lg text-teal-100 mb-8 max-w-lg">
            Enjoy pickleball facility at SideOut Playground. Easy online booking, instant confirmation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="pink" size="lg" onClick={() => setActiveTab('book')}>
              <CalendarDays size={18} /> Book a Court
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/track')} className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl">
              Track Booking
            </Button>
          </div>
          {court && (
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-300">₱{pricePerHour}</p>
                <p className="text-xs text-teal-200">per hour</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{court ? `${format12h(court.openTime)} – ${format12h(court.closeTime)}` : '5AM – 12AM'}</p>
                <p className="text-xs text-teal-200">operating hours</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="flex justify-center"><StarRating rating={court?.rating || 4.9} /></div>
                <p className="text-xs text-teal-200">court rating</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>

    {/* Today's Availability */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Today's Availability</h2>
          <p className="text-slate-500">Check what time slots are open for today</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : availability.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>No slots available today</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availability.map((slot) => (
              <motion.div
                key={slot.id}
                whileHover={{ y: -2 }}
                onClick={() => { if(slot.isAvailable) { selectSlot(slot); setActiveTab('book'); } }}
                className={`rounded-xl p-3 text-center border-2 transition-all cursor-pointer ${
                  slot.isAvailable
                    ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <p className="text-xs font-medium mb-1">{format12h(slot.startTime)} – {format12h(slot.endTime)}</p>
                <p className={`text-xs font-semibold ${slot.isAvailable ? 'text-teal-600' : 'text-slate-400'}`}>
                  {slot.isAvailable ? `₱${slot.price || pricePerHour}` : 'Booked'}
                </p>
                <span className={`mt-1.5 inline-block w-2 h-2 rounded-full ${slot.isAvailable ? 'bg-teal-500' : 'bg-slate-300'}`} />
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Button size="lg" onClick={() => setActiveTab('book')}>
            <CalendarDays size={17} /> Book a Slot Now
          </Button>
        </div>
      </div>
    </section>

    {/* Court Info */}
    {court && (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">The Court</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2 mb-4">{court.name}</h2>
              <p className="text-slate-500 mb-6">
                {court.indoor ? 'Indoor' : 'Outdoor'} court with {court.surface} surface.
                {court.dimensions && ` Dimensions: ${court.dimensions}.`}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">Price per Hour</p>
                  <p className="text-xl font-bold text-teal-600">₱{pricePerHour}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">Operating Hours</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {format12h(court.openTime)} – {format12h(court.closeTime)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-3">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {court.amenities.map((a) => {
                    const Icon = amenityIcons[a] || CheckCircle;
                    return (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium">
                        <Icon size={12} /> {a}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={allImages.length > 0 ? getImageUrl(allImages[0]) : 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg'}
                alt={court.name}
                className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-600" />
                  <span className="text-sm font-medium text-slate-700">Purok Million, Dawis, Tandag City</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* How It Works */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">How It Works</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: CalendarDays, step: '01', title: 'Pick a Date', desc: 'Choose from the next 7 available days that works for you.' },
            { icon: Clock, step: '02', title: 'Select Slots', desc: 'Pick one or more time slots that fit your schedule.' },
            { icon: Users, step: '03', title: 'Fill Details', desc: 'Enter your name, email, and contact number.' },
            { icon: CreditCard, step: '04', title: 'Pay via GCash', desc: 'Send payment and upload your screenshot to confirm.' },
          ].map((item, idx) => (
            <div key={item.step} className="relative bg-gray-50 rounded-2xl p-6 border border-slate-100">
              <span className="absolute top-4 right-4 text-4xl font-bold text-slate-100">{item.step}</span>
              <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <item.icon size={20} className="text-teal-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
              {idx < 3 && <ChevronRight size={20} className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 z-10" />}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-teal-600 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <Star size={32} className="mx-auto mb-4 text-amber-300" fill="currentColor" />
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-teal-100 mb-8 text-lg">
          Book your court now and experience the best pickleball facilities in town.
        </p>
        <Button variant="pink" size="lg" onClick={() => setActiveTab('book')}>
          Book a Court Now
        </Button>
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-800 font-bold">Your Details</h2>
        <button onClick={() => setShowDetailsForm(false)} className="text-xs text-slate-400 hover:text-slate-600">← Back</button>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm text-slate-500">
        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} · ₱{subtotal}
      </div>
      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <Input label="Full Name *" placeholder="Juan Dela Cruz" value={customerName} onChange={e => setCustomerName(e.target.value)} leftIcon={<User size={16} className="text-slate-500" />} />
        <Input label="Email *" type="email" placeholder="you@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} leftIcon={<Mail size={16} className="text-slate-500" />} />
        <Input label="Phone *" placeholder="09xx-xxx-xxxx" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} leftIcon={<Phone size={16} className="text-slate-500" />} />
        <Input label="Notes (optional)" placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} leftIcon={<FileText size={16} className="text-slate-500" />} />
        <Button variant="neon" size="lg" className="w-full" type="submit">Proceed to Checkout</Button>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
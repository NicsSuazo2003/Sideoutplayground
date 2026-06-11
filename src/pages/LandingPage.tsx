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

const amenityIcons: Record<string, typeof Zap> = {
  'LED Lighting': Zap, 'Air Conditioning': Wind, 'Professional Nets': Shield,
  'Seating Area': Tv2, 'Water Station': Droplets, 'Locker Rooms': Shield,
  'Pro Shop': Tv2, 'Parking': ParkingCircle,
};

function getDateStrip(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'book'>('about');
  const [court, setCourt] = useState<Court | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(false);

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
    if (allImages.length <= 1) return;
    const timer = setInterval(() => setCurrentImg(i => (i + 1) % allImages.length), 4000);
    return () => clearInterval(timer);
  }, [allImages.length]);

  useEffect(() => { getCourt().then(setCourt).catch(() => {}); }, []);
  useEffect(() => { fetchCourt(); }, []);
  useEffect(() => { if (activeTab === 'book') fetchAvailability(selectedDate); }, [selectedDate, activeTab]);

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

  const pricePerHour = court?.pricePerHour || 20;
  const subtotal = selectedSlots.reduce((sum, slot) => sum + (slot.price || pricePerHour), 0);
  const hoursCount = court ? (parseInt(court.closeTime.split(':')[0]) - parseInt(court.openTime.split(':')[0])) : 16;

  return (
    <div className="pt-16">
      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-1 p-1 glass rounded-xl">
          <button onClick={() => { setActiveTab('about'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-[#7CFC00] text-black' : 'text-white/60 hover:text-white'}`}>
            About
          </button>
          <button onClick={() => { setActiveTab('book'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-[#7CFC00] text-black' : 'text-white/60 hover:text-white'}`}>
            Book a Court
          </button>
        </div>
      </div>

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <>
          {/* Hero */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CFC00]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF1493]/5 rounded-full blur-3xl" />
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto relative z-10">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
                </div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl sm:text-5xl font-bold text-white/80 mb-4 leading-tight">
                One Court.{' '}<span className="text-[#7CFC00] text-glow-green">Infinite </span>
                <span className="text-[#FF1493]" style={{ textShadow: '0 0 8px #FF1493' }}>Games.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="text-white/60 text-lg sm:text-xl max-w-xl mx-auto mb-8">
                Book your slot at our premium pickleball court — fresh air, open space, and ready for play.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-3">
                <Button variant="neon" size="lg" onClick={() => setActiveTab('book')}>
                  <Zap size={18} /> Book a Slot
                </Button>
                <span className="text-white/40 text-sm">Starting at <span className="text-[#7CFC00] font-bold">₱{pricePerHour}/hr</span></span>
              </motion.div>
            </motion.div>
          </section>

          {/* Court Showcase */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Our Facility</div>
                <h2 className="text-4xl font-black text-white">{court?.name || 'Side Out Arena'}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer" onClick={() => setActiveTab('book')}>
                  <AnimatePresence mode="wait">
                    <motion.img key={currentImg} src={allImages.length > 0 ? getImageUrl(allImages[currentImg]) : 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt="Court" className="w-full h-full object-cover absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">{court?.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    <span className="px-3 py-1 rounded-full bg-[#7CFC00]/20 text-[#7CFC00] border border-[#7CFC00]/30 text-xs font-semibold capitalize">{court?.status || 'Active'}</span>
                  </div>
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-[#7CFC00] w-4' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <StarRating rating={court?.rating || 4.9} />
                  <h3 className="text-2xl font-bold text-white mt-3 mb-2">{court?.name || 'Side Out Arena'}</h3>
                  <p className="text-white/50 text-sm mb-1">{court?.dimensions || '60ft x 30ft'} - {court?.surface || 'Acrylic Hard Court'}</p>
                  <div className="text-3xl font-black text-[#7CFC00] mb-6">₱{pricePerHour}<span className="text-lg font-normal text-white/50">/hour</span></div>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(court?.amenities || ['LED Lighting', 'Air Conditioning', 'Professional Nets', 'Seating Area', 'Water Station', 'Locker Rooms', 'Pro Shop', 'Parking']).map(a => {
                      const Icon = amenityIcons[a] || Zap;
                      return <div key={a} className="flex items-center gap-2 text-white/70 text-sm"><Icon size={14} className="text-[#7CFC00] shrink-0" />{a}</div>;
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
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-3">🕐 Operating Hours</h3>
                  <p className="text-white/60 text-sm">Open Daily: {court ? `${format12h(court.openTime)} – ${format12h(court.closeTime)}` : '3:00 PM – 12:00 AM'}</p>
                  <p className="text-white/40 text-xs mt-2">Book up to 7 days in advance.</p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-3">📍 Location</h3>
                  <p className="text-white/60 text-sm">Purok Million, Barangay San Agustin Sur</p>
                  <p className="text-white/60 text-sm">Tandag City, Surigao del Sur 8300</p>
                  <p className="text-[#7CFC00] text-sm mt-2">📞 09058100973</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* BOOK TAB */}
      {activeTab === 'book' && !showDetailsForm && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white">Reserve a Court</h2>
            <p className="text-white/50 text-sm">₱{pricePerHour}/hour • Book up to 1 week in advance</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Date Picker */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold">Select Date</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))} disabled={dateOffset >= dates.length - 7} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {visibleDates.map(d => {
                    const isSelected = d === selectedDate;
                    const dateObj = new Date(d + 'T12:00:00');
                    const isToday = d === new Date().toISOString().split('T')[0];
                    return (
                      <button key={d} onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 ${isSelected ? 'bg-[#7CFC00] text-black glow-green' : 'hover:bg-white/8 text-white/70 hover:text-white'}`}>
                        <span className="text-[10px] font-semibold uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className={`text-lg font-black leading-none mt-0.5 ${isSelected ? 'text-black' : ''}`}>{dateObj.getDate()}</span>
                        <span className="text-[9px] text-white/40">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                        {isToday && <span className={`text-[9px] font-bold ${isSelected ? 'text-black/70' : 'text-[#7CFC00]'}`}>TODAY</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-white/20 inline-block" />Vacant</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#7CFC00] inline-block" />Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/5 inline-block" />Booked</span>
              </div>

              {/* Time Slots */}
              <div className="glass-card p-4">
                <h2 className="text-white font-bold mb-3">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {isLoading ? <LoadingSpinner size={24} /> : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availability.map(slot => {
                      const isSelected = selectedSlots.some(s => s.id === slot.id);
                      return (
                        <motion.button key={slot.id} whileHover={slot.isAvailable ? { scale: 1.04 } : {}} whileTap={slot.isAvailable ? { scale: 0.97 } : {}}
                          onClick={() => handleSlotClick(slot)}
                          className={`relative p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                            isSelected ? 'bg-[#7CFC00] text-black border-[#7CFC00] glow-green'
                            : !slot.isAvailable ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
                            : 'border-white/15 text-white/80 hover:border-[#7CFC00]/50 hover:bg-[#7CFC00]/8 hover:text-white'}`}>
                          <div className="text-center">
                            <div className="font-bold">{format12h(slot.startTime)}</div>
                            <div className="text-[10px] text-white/50">₱{slot.price || pricePerHour}</div>
                          </div>
                          {isSelected && <Check size={14} className="absolute top-1.5 right-1.5 text-black" />}
                          {!slot.isAvailable && <Lock size={12} className="absolute top-1.5 right-1.5 text-white/20" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="glass-card p-5">
                <h2 className="text-white font-bold mb-4">Booking Summary</h2>
                <div className="text-white/50 text-sm mb-4">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {selectedSlots.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">Tap vacant slots to add to your booking</div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                        <div key={slot.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{format12h(slot.startTime)} – {format12h(slot.endTime)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">₱{slot.price || pricePerHour}</span>
                            <button onClick={() => deselectSlot(slot.id)} className="text-white/30 hover:text-red-400">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/8 pt-4">
                      <div className="flex justify-between font-black text-lg">
                        <span className="text-white">{selectedSlots.length}h</span>
                        <span className="text-[#7CFC00]">₱{subtotal}</span>
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
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Your Details</h2>
              <button onClick={() => setShowDetailsForm(false)} className="text-xs text-white/50 hover:text-white">← Back</button>
            </div>
            <div className="glass rounded-xl p-3 mb-4 text-sm text-white/50">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedSlots.length}h · ₱{subtotal}
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
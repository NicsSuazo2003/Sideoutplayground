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
  for (let i = 0; i < 14; i++) {
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
    const timer = setInterval(() => setCurrentImg(i => (i + 1) % allImages.length), 5000);
    return () => clearInterval(timer);
  }, [allImages.length, isHoveringImg]);

  useEffect(() => { getCourt().then(setCourt).catch(() => {}); }, []);
  useEffect(() => { fetchCourt(); }, []);
  useEffect(() => { if (activeTab === 'book') fetchAvailability(selectedDate); }, [selectedDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'about') {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      fetchAvailability(today);
    }
  }, [activeTab]);

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
    <div className="pt-16 pb-24 lg:pb-8">
      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl">
          <button onClick={() => { setActiveTab('about'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-[#7CFC00] text-black shadow-[0_0_15px_rgba(124,252,0,0.3)]' : 'text-white/60 hover:text-white'}`}>
            About
          </button>
          <button onClick={() => { setActiveTab('book'); setShowDetailsForm(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-[#7CFC00] text-black shadow-[0_0_15px_rgba(124,252,0,0.3)]' : 'text-white/60 hover:text-white'}`}>
            Book a Court
          </button>
        </div>
      </div>

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Hero */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CFC00]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF1493]/10 rounded-full blur-[100px]" />
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto relative z-10">
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl sm:text-6xl font-black text-white/90 mb-4 leading-tight">
                One Court.{' '}<span className="text-[#7CFC00] drop-shadow-[0_0_15px_rgba(124,252,0,0.5)]">Infinite </span>
                <span className="text-[#FF1493] drop-shadow-[0_0_15px_rgba(255,20,147,0.5)]">Games.</span>
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
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Our Facility</div>
                <h2 className="text-4xl font-black text-white">{court?.name || 'Side Out Arena'}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Carousel */}
                <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group border border-white/10" 
                     onClick={() => setActiveTab('book')}
                     onMouseEnter={() => setIsHoveringImg(true)}
                     onMouseLeave={() => setIsHoveringImg(false)}>
                  <AnimatePresence mode="wait">
                    <motion.img key={currentImg} src={allImages.length > 0 ? getImageUrl(allImages[currentImg]) : 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg'}
                      alt="Court" className="w-full h-full object-cover absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Carousel Controls */}
                  {allImages.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-0 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={prevImg} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md"><ChevronLeft size={20} /></button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={nextImg} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md"><ChevronRight size={20} /></button>
                      </div>
                      <div className="absolute bottom-4 right-0 left-0 flex justify-center gap-2">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} 
                                  className={`h-2 rounded-full transition-all ${i === currentImg ? 'bg-[#7CFC00] w-6' : 'bg-white/40 w-2 hover:bg-white/70'}`} />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">{court?.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    <span className="px-3 py-1 rounded-full bg-[#7CFC00]/20 text-[#7CFC00] border border-[#7CFC00]/30 text-xs font-semibold capitalize">{court?.status || 'Active'}</span>
                  </div>
                </div>
                
                {/* Details */}
                <div>
                  <StarRating rating={court?.rating || 4.9} />
                  <h3 className="text-3xl font-bold text-white mt-3 mb-2">{court?.name || 'Side Out Arena'}</h3>
                  <p className="text-white/50 text-sm mb-1">{court?.dimensions || '60ft x 30ft'} - {court?.surface || 'Acrylic Hard Court'}</p>
                  <div className="text-4xl font-black text-[#7CFC00] mb-6">₱{pricePerHour}<span className="text-xl font-normal text-white/50">/hr</span></div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(court?.amenities || ['LED Lighting', 'Air Conditioning', 'Professional Nets', 'Seating Area', 'Water Station', 'Locker Rooms', 'Pro Shop', 'Parking']).map(a => {
                      const Icon = amenityIcons[a] || Zap;
                      return <div key={a} className="flex items-center gap-2 text-white/80 text-sm"><Icon size={16} className="text-[#7CFC00] shrink-0" />{a}</div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Availability Preview (Grid instead of Table) */}
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Today's Schedule</div>
                <h2 className="text-3xl font-black text-white">Court Availability</h2>
                <p className="text-white/50 text-sm mt-2">See what's open today — switch to the Book tab to reserve.</p>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
                {isLoading ? <LoadingSpinner size={24} /> : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availability.map(slot => (
                      <div key={slot.id} className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                        slot.isAvailable ? 'border-[#7CFC00]/30 bg-[#7CFC00]/5 text-white cursor-pointer hover:bg-[#7CFC00]/10' : 'border-white/5 bg-white/3 text-white/30 cursor-not-allowed'
                      }`} onClick={() => { if(slot.isAvailable) setActiveTab('book'); }}>
                        <span className="font-bold text-sm">{format12h(slot.startTime)}</span>
                        {slot.isAvailable ? (
                          <span className="text-[#7CFC00] text-[10px] font-semibold mt-1">₱{slot.price || pricePerHour}</span>
                        ) : (
                          <Lock size={12} className="mt-1 opacity-50" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* BOOK TAB (With AnimatePresence for Form Slider) */}
      {activeTab === 'book' && (
        <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {!showDetailsForm ? (
              <motion.div key="booking-grid" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }} className="grid lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN — Date picker + Time slots */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Date Picker */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white font-bold">Select Date</h2>
                      <div className="flex gap-2">
                        <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => setDateOffset(Math.min(dates.length - 7, dateOffset + 1))} disabled={dateOffset >= dates.length - 7} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <motion.div className="flex gap-2" layout>
                        <AnimatePresence mode="popLayout">
                          {visibleDates.map(d => {
                            const isSelected = d === selectedDate;
                            const dateObj = new Date(d + 'T12:00:00');
                            const isToday = d === new Date().toISOString().split('T')[0];
                            return (
                              <motion.button key={d} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} layout
                                onClick={() => setSelectedDate(d)}
                                className={`flex-1 min-w-[60px] flex flex-col items-center py-3 px-1 rounded-xl transition-colors duration-200 border ${isSelected ? 'bg-[#7CFC00] text-black border-[#7CFC00] shadow-[0_0_15px_rgba(124,252,0,0.3)]' : 'bg-white/5 border-transparent hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                <span className="text-[11px] font-semibold uppercase tracking-wider">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className={`text-xl font-black leading-none my-1 ${isSelected ? 'text-black' : 'text-white'}`}>{dateObj.getDate()}</span>
                                <span className="text-[10px] opacity-70">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                {isToday && <span className={`text-[9px] font-bold mt-1 ${isSelected ? 'text-black/70' : 'text-[#7CFC00]'}`}>TODAY</span>}
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                    <h2 className="text-white font-bold mb-4">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                    {isLoading ? <div className="py-10 flex justify-center"><LoadingSpinner size={32} /></div> : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {availability.map(slot => {
                          const isSelected = selectedSlots.some(s => s.id === slot.id);
                          return (
                            <motion.button key={slot.id} whileHover={slot.isAvailable ? { scale: 1.02 } : {}} whileTap={slot.isAvailable ? { scale: 0.95 } : {}}
                              onClick={() => handleSlotClick(slot)}
                              className={`relative p-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                isSelected ? 'bg-[#7CFC00] text-black border-[#7CFC00] shadow-[0_0_15px_rgba(124,252,0,0.3)]'
                                : !slot.isAvailable ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-white/5 border-white/10 text-white/80 hover:border-[#7CFC00]/50 hover:bg-[#7CFC00]/10 hover:text-white'}`}>
                              <div className="text-center">
                                <div className="font-bold text-base">{format12h(slot.startTime)}</div>
                                <div className="text-[11px] opacity-70 mt-0.5">₱{slot.price || pricePerHour}</div>
                              </div>
                              {isSelected && <Check size={16} className="absolute top-2 right-2 text-black" />}
                              {!slot.isAvailable && <Lock size={14} className="absolute top-2 right-2 text-white/20" />}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN — Booking Summary (Desktop) */}
                <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                    <h2 className="text-white font-bold mb-2">Booking Summary</h2>
                    <div className="text-[#7CFC00] text-sm mb-6 font-medium">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    {selectedSlots.length === 0 ? (
                      <div className="text-center py-10 px-4 border border-dashed border-white/20 rounded-xl text-white/40 text-sm">
                        Tap vacant slots on the left to build your booking.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                            <div key={slot.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                              <span className="text-white/90 text-sm font-medium">{format12h(slot.startTime)} – {format12h(slot.endTime)}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[#7CFC00] text-sm font-bold">₱{slot.price || pricePerHour}</span>
                                <button onClick={() => deselectSlot(slot.id)} className="p-1 rounded-md text-white/30 hover:text-red-400 hover:bg-white/10 transition-colors"><Lock size={14} className="hidden" /> ×</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-white/10 pt-4 mb-6">
                          <div className="flex justify-between items-end">
                            <span className="text-white/60 text-sm">Total ({selectedSlots.length} hours)</span>
                            <span className="text-3xl font-black text-white">₱{subtotal}</span>
                          </div>
                        </div>
                        <Button variant="neon" size="lg" className="w-full" onClick={handleBookNow}>Proceed to Checkout</Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* DETAILS FORM SLIDER */
              <motion.div key="details-form" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-lg mx-auto">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">Your Details</h2>
                    <button onClick={() => setShowDetailsForm(false)} className="text-sm font-medium text-white/50 hover:text-[#7CFC00] transition-colors flex items-center gap-1">
                      <ChevronLeft size={16} /> Back
                    </button>
                  </div>
                  
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-white/50 text-sm">{selectedSlots.length} hours selected</div>
                    </div>
                    <div className="text-2xl font-black text-[#7CFC00]">₱{subtotal}</div>
                  </div>
                  
                  <form onSubmit={handleDetailsSubmit} className="space-y-5">
                    {/* Assuming Input component handles styling, but if not, wrapper adds structure */}
                    <div className="space-y-4">
                      <Input label="Full Name *" placeholder="Juan Dela Cruz" value={customerName} onChange={e => setCustomerName(e.target.value)} leftIcon={<User size={16} />} />
                      <Input label="Email *" type="email" placeholder="you@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} leftIcon={<Mail size={16} />} />
                      <Input label="Phone *" placeholder="09xx-xxx-xxxx" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} leftIcon={<Phone size={16} />} />
                      <Input label="Notes (optional)" placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} leftIcon={<FileText size={16} />} />
                    </div>
                    <Button variant="neon" size="lg" className="w-full mt-4" type="submit">Complete Booking</Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <AnimatePresence>
        {activeTab === 'book' && !showDetailsForm && selectedSlots.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div>
                <div className="text-white/70 text-sm font-medium">{selectedSlots.length} Hours Selected</div>
                <div className="text-[#7CFC00] text-xl font-black">₱{subtotal}</div>
              </div>
              <Button variant="neon" size="md" onClick={handleBookNow} className="px-8">
                Book Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Check, Zap, Wind, Shield, Droplets, ParkingCircle, Tv2, Users, User, Mail, Phone, FileText } from 'lucide-react';
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
  'LED Lighting': Zap, 'Air Conditioning': Wind, 'Professional Nets': Shield,
  'Seating Area': Users, 'Water Station': Droplets, 'Locker Rooms': Shield,
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

export function BookingPage() {
  const navigate = useNavigate();
  const {
    court, selectedDate, selectedSlots, availability, isLoading,
    customerName, customerEmail, customerPhone, notes,
    setCustomerName, setCustomerEmail, setCustomerPhone, setNotes,
    fetchCourt, fetchAvailability, setSelectedDate, selectSlot, deselectSlot,
  } = useBookingStore();
  const [dateOffset, setDateOffset] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const dates = getDateStrip();
  const visibleDates = dates.slice(dateOffset, dateOffset + 7);

  useEffect(() => { fetchCourt(); }, []);
  useEffect(() => { fetchAvailability(selectedDate); }, [selectedDate]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    const already = selectedSlots.find(s => s.id === slot.id);
    if (already) deselectSlot(slot.id);
    else selectSlot(slot);
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }
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
  const subtotal = selectedSlots.length * pricePerHour;

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Court Info */}
        {court && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden shrink-0">
              <img src={getImageUrl(court.imageUrl)} alt={court.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">{court.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#7CFC00]/15 text-[#7CFC00] border border-[#7CFC00]/25 font-semibold">Active</span>
                  </div>
                  <h1 className="text-xl font-black text-white">{court.name}</h1>
                  <p className="text-white/40 text-sm">{court.dimensions} · {court.surface}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#7CFC00]">₱{court.pricePerHour}<span className="text-sm font-normal text-white/40">/hr</span></div>
                  <StarRating rating={court.rating} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {court.amenities.slice(0, 5).map(a => {
                  const Icon = AMENITY_ICONS[a] || Zap;
                  return (
                    <span key={a} className="flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-1">
                      <Icon size={11} className="text-[#7CFC00]" /> {a}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 text-sm font-semibold ${!showDetailsForm ? 'text-[#7CFC00]' : 'text-white/40'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${!showDetailsForm ? 'bg-[#7CFC00] text-black' : 'bg-white/10 text-white/50'}`}>1</span>
            Select Slots
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${showDetailsForm ? 'text-[#7CFC00]' : 'text-white/40'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${showDetailsForm ? 'bg-[#7CFC00] text-black' : 'bg-white/10 text-white/50'}`}>2</span>
            Your Details
          </div>
        </div>

        {!showDetailsForm ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Date Picker */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold">Select Date</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setDateOffset(Math.min(7, dateOffset + 1))} disabled={dateOffset >= 7}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 disabled:opacity-30 transition-colors">
                      <ChevronRight size={16} />
                    </button>
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
                        {isToday && <span className={`text-[9px] font-bold ${isSelected ? 'text-black/70' : 'text-[#7CFC00]'}`}>TODAY</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="glass-card p-4">
                <h2 className="text-white font-bold mb-3">
                  Available Slots — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                            <div className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-white/40'}`}>to {format12h(slot.endTime)}</div>
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
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <h2 className="text-white font-bold mb-4">Booking Summary</h2>
                <div className="text-white/50 text-sm mb-4">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">Select time slots to see your booking summary</div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                        <div key={slot.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{format12h(slot.startTime)} – {format12h(slot.endTime)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">₱{pricePerHour}</span>
                            <button onClick={() => deselectSlot(slot.id)} className="text-white/30 hover:text-red-400 transition-colors">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/8 pt-4">
                      <div className="flex justify-between font-black text-lg">
                        <span className="text-white">{selectedSlots.length} {selectedSlots.length === 1 ? 'hour' : 'hours'}</span>
                        <span className="text-[#7CFC00]">₱{subtotal}</span>
                      </div>
                    </div>
                    <Button variant="neon" size="lg" className="w-full mt-5" onClick={handleBookNow}>
                      Book Now
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Your Details</h2>
                <button onClick={() => setShowDetailsForm(false)} className="text-xs text-white/50 hover:text-white">← Back to slots</button>
              </div>
              {/* Mini summary */}
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
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
    if (selectedSlots.length === 0) { toast.error('Select at least one time slot'); return; }
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

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Court Info */}
        {court && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden shrink-0">
              <img src={getImageUrl(court.imageUrl)} alt={court.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/30" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200 font-semibold">{court.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-600 border border-teal-200 font-semibold">Active</span>
                  </div>
                  <h1 className="text-xl font-black text-slate-800">{court.name}</h1>
                  <p className="text-slate-400 text-sm">{court.dimensions} · {court.surface}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-teal-600">₱{court.pricePerHour}<span className="text-sm font-normal text-slate-400">/hr</span></div>
                  <StarRating rating={court.rating} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {court.amenities.slice(0, 5).map(a => {
                  const Icon = AMENITY_ICONS[a] || Zap;
                  return (
                    <span key={a} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                      <Icon size={11} className="text-teal-600" /> {a}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 text-sm font-semibold ${!showDetailsForm ? 'text-teal-600' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${!showDetailsForm ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            Select Slots
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${showDetailsForm ? 'text-teal-600' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${showDetailsForm ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            Your Details
          </div>
        </div>

        {!showDetailsForm ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Date Picker */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-slate-800 font-bold">Select Date</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setDateOffset(Math.min(7, dateOffset + 1))} disabled={dateOffset >= 7}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors">
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
                        className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 ${isSelected ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
                        <span className="text-[10px] font-semibold uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-black leading-none mt-0.5">{dateObj.getDate()}</span>
                        {isToday && <span className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-teal-600'}`}>TODAY</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <h2 className="text-slate-800 font-bold mb-3">
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
                            isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                            : !slot.isAvailable ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-600 hover:border-teal-400 hover:bg-teal-50 hover:text-slate-800'}`}>
                          <div className="text-center">
                            <div className="font-bold">{format12h(slot.startTime)}</div>
                            <div className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>₱{slot.price || pricePerHour}</div>
                          </div>
                          {isSelected && <Check size={14} className="absolute top-1.5 right-1.5 text-white" />}
                          {!slot.isAvailable && <Lock size={12} className="absolute top-1.5 right-1.5 text-slate-300" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-slate-200 inline-block" />Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-600 inline-block" />Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 inline-block" />Unavailable</span>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h2 className="text-slate-800 font-bold mb-4">Booking Summary</h2>
                <div className="text-slate-500 text-sm mb-4">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Select time slots to see your booking summary</div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                        <div key={slot.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{format12h(slot.startTime)} – {format12h(slot.endTime)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">₱{slot.price || pricePerHour}</span>
                            <button onClick={() => deselectSlot(slot.id)} className="text-slate-400 hover:text-red-500 transition-colors">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between font-black text-lg">
                        <span className="text-slate-800">{selectedSlots.length} {selectedSlots.length === 1 ? 'hour' : 'hours'}</span>
                        <span className="text-teal-600">₱{subtotal}</span>
                      </div>
                    </div>
                    <Button variant="neon" size="lg" className="w-full mt-5" onClick={handleBookNow}>Book Now</Button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-800 font-bold">Your Details</h2>
                <button onClick={() => setShowDetailsForm(false)} className="text-xs text-slate-400 hover:text-slate-600">← Back to slots</button>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm text-slate-500">
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
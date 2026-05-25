import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Zap, Shield, Wind, Droplets, Tv2, ParkingCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { getCourt } from '../services/courtService';
import type { Court } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5154';

function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

const amenityIcons: Record<string, typeof Zap> = {
  'LED Lighting': Zap,
  'Air Conditioning': Wind,
  'Professional Nets': Shield,
  'Seating Area': Tv2,
  'Water Station': Droplets,
  'Locker Rooms': Shield,
  'Pro Shop': Tv2,
  'Parking': ParkingCircle,
};

const testimonials = [
  { name: 'Alex Rivera', title: 'Regular Player', quote: "The court surface is absolutely pristine. I've played at dozens of facilities and Side Out Arena is by far the best indoor pickleball court in the region.", rating: 5 },
  { name: 'Jordan Kim', title: 'Weekly Player', quote: "Booking is seamless, the facility is immaculate, and the staff is incredibly helpful. I play here 3x a week and couldn't imagine going anywhere else.", rating: 5 },
  { name: 'Riley Chen', title: 'Tournament Player', quote: "The lighting and climate control make it perfect year-round. My game has improved significantly — the court conditions are always tournament-quality.", rating: 5 },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [court, setCourt] = useState<Court | null>(null);
  const [currentImg, setCurrentImg] = useState(0);

  const allImages = court?.images?.length
    ? court.images
    : court?.imageUrl ? [court.imageUrl] : [];

  // Auto-rotate images
  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => setCurrentImg(i => (i + 1) % allImages.length), 4000);
    return () => clearInterval(timer);
  }, [allImages.length]);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getCourt().then(setCourt).catch(() => {});
  }, []);

  const hoursCount = court
    ? (parseInt(court.closeTime.split(':')[0]) - parseInt(court.openTime.split(':')[0]))
    : 16;

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CFC00]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF1493]/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          {/* Logo + Brand Name */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-80 h-80 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
              <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
            </div>
          </motion.div>

          {/* Slogan */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-5xl font-bold text-white/80 mb-4 leading-tight"
          >
            One Court.{' '}
            <span className="text-[#7CFC00] text-glow-green">Infinite </span>
            <span className="text-[#FF1493]" style={{ textShadow: '0 0 8px #FF1493' }}>Games.</span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-white/60 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Book your slot at our simple yet exciting outdoor pickleball court — fresh air, open space, and ready for play.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="neon" size="lg" onClick={() => navigate('/book')}>
              <Zap size={18} />
              Book a Slot
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 mt-12 text-white/40 text-sm"
          >
            <div className="text-center">
              <div className="text-2xl font-black text-white">500+</div>
              <div>Happy Players</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#7CFC00]">{court?.rating || '4.9'}</div>
              <div>Court Rating</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">{hoursCount}h</div>
              <div>Daily Access</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Court Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Our Facility</div>
            <h2 className="text-4xl font-black text-white">{court?.name || 'Side Out Arena'}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden aspect-video"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImg}
                  src={allImages.length > 0
                    ? getImageUrl(allImages[currentImg])
                    : 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt="Court"
                  className="w-full h-full object-cover absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                  {court?.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#7CFC00]/20 text-[#7CFC00] border border-[#7CFC00]/30 text-xs font-semibold capitalize">
                  {court?.status || 'Active'}
                </span>
              </div>
              {/* Dot indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-[#7CFC00] w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <StarRating rating={court?.rating || 4.9} />
              <h3 className="text-2xl font-bold text-white mt-3 mb-2">{court?.name || 'Side Out Arena'}</h3>
              <p className="text-white/50 text-sm mb-1">{court?.dimensions || '60ft x 30ft'} - {court?.surface || 'Acrylic Hard Court'}</p>
              <div className="text-3xl font-black text-[#7CFC00] mb-6">
                ₱{court?.pricePerHour || 20}<span className="text-lg font-normal text-white/50">/hour</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {(court?.amenities || ['LED Lighting', 'Air Conditioning', 'Professional Nets', 'Seating Area', 'Water Station', 'Locker Rooms', 'Pro Shop', 'Parking']).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Zap;
                  return (
                    <div key={amenity} className="flex items-center gap-2 text-white/70 text-sm">
                      <Icon size={14} className="text-[#7CFC00] shrink-0" />
                      {amenity}
                    </div>
                  );
                })}
              </div>
              <Button variant="neon" size="lg" onClick={() => navigate('/book')}>
                Check Availability
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="text-[#7CFC00] text-sm font-bold tracking-widest uppercase mb-2">Testimonials</div>
            <h2 className="text-4xl font-black text-white">Players Love It</h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-6 italic">"{testimonials[testimonialIdx].quote}"</p>
                <div className="w-12 h-12 rounded-full bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-bold text-lg mx-auto mb-2">
                  {testimonials[testimonialIdx].name.charAt(0)}
                </div>
                <div className="text-white font-semibold">{testimonials[testimonialIdx].name}</div>
                <div className="text-white/40 text-sm">{testimonials[testimonialIdx].title}</div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-xl glass hover:border-[#7CFC00]/30 transition-colors text-white/50 hover:text-[#7CFC00]">
                <ChevronLeft size={18} />
              </button>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'bg-[#7CFC00] w-6' : 'bg-white/20'}`}
                />
              ))}
              <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}
                className="p-2 rounded-xl glass hover:border-[#7CFC00]/30 transition-colors text-white/50 hover:text-[#7CFC00]">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7CFC00] to-[#FF1493]" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7CFC00]/5 rounded-full blur-2xl" />
            <h2 className="text-4xl font-black text-white mb-3">Ready to Play?</h2>
            <p className="text-white/50 mb-8">Slots fill fast - secure your court time today.</p>
            <Button variant="neon" size="lg" onClick={() => navigate('/book')}>
              <Zap size={18} />
              Book Your Slot Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
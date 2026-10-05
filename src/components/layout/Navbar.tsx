import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarDays, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { usePendingBooking } from '../../hooks/usePendingBooking';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Book Court', href: '/book' },
  { label: 'My Bookings', href: '/my-bookings' },
  { label: 'Open Play', href: '/openplay' },
  { label: 'Track Booking', href: '/track' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { booking: pendingBooking } = usePendingBooking();
  const hasPending = !!pendingBooking;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-teal-700 shadow-md shadow-teal-950/15 py-0'
          : 'bg-teal-600 py-1 sm:py-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white group">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-1 border border-white/20 shadow-xs transition group-hover:scale-105">
              <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-sm tracking-tight block">SIDEOUT</span>
              <span className="text-[9px] text-teal-200 tracking-widest font-black uppercase block -mt-0.5">PLAYGROUND</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const showDot = link.href === '/my-bookings' && hasPending;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {showDot && (
                    <span
                      aria-label="You have a pending booking"
                      className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse"
                    />
                  )}
                </Link>
              );
            })}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="ml-1 px-3 py-1.5 rounded-lg text-xs font-black bg-amber-400 text-teal-950 hover:bg-amber-300 transition-colors shadow-xs"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop Quick Right Action */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-teal-100 font-semibold">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button
                variant="neon"
                size="sm"
                onClick={() => navigate('/book')}
                className="bg-white text-teal-800 hover:bg-teal-50 border-0 font-black text-xs shadow-xs"
                leftIcon={<CalendarDays size={14} />}
              >
                Book Court
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11 text-teal-100 hover:text-white active:bg-white/10 rounded-xl transition relative"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
            {!menuOpen && hasPending && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-teal-500/60 bg-teal-800 shadow-xl"
          >
            <nav className="p-4 space-y-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const showDot = link.href === '/my-bookings' && hasPending;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-teal-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {showDot && (
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  </Link>
                );
              })}

              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black bg-amber-400 text-teal-950 mt-2"
                >
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-200 hover:bg-white/10 text-left transition"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              )}

              {!isAuthenticated && (
                <div className="pt-2">
                  <Button
                    variant="neon"
                    size="md"
                    onClick={() => navigate('/book')}
                    className="w-full font-bold shadow-md"
                    leftIcon={<CalendarDays size={16} />}
                  >
                    Book a Court Now
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
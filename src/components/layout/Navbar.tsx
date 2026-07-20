import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Book Now', href: '/book' },
  { label: 'Track Booking', href: '/track' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-teal-700 shadow-lg shadow-teal-900/20' : 'bg-teal-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <img src="/logo.png" alt="Side Out Playground" className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1" />
            <span className="hidden sm:block">SideOut Playground</span>
            <span className="sm:hidden">SideOut</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-white/20 text-white'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-400 text-teal-900 hover:bg-amber-300 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user?.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-teal-100 hover:text-white">
                Sign Out
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-teal-500/50"
          >
            <nav className="px-4 pb-4 pt-2 flex flex-col gap-1 bg-teal-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-white/20 text-white'
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-400 text-teal-900 mt-1">
                    Admin Panel
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-2.5 rounded-lg text-sm font-medium text-teal-100 hover:text-white hover:bg-white/10 text-left">
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
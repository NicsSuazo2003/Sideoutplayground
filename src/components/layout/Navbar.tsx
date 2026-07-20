import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Track Booking', href: '/track' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm">
              <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
            </div>
            <div className="leading-none">
              <div className="font-black text-slate-800 text-sm tracking-tight">SIDE OUT</div>
              <div className="text-[10px] text-teal-600 tracking-widest font-semibold">PLAYGROUND</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${location.pathname === link.href ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user?.role === 'admin' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Admin</Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Sign Out</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Admin</Button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-white border-l border-slate-200 p-6 flex flex-col md:hidden shadow-xl"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-slate-800">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                {isAuthenticated && user?.role === 'admin' ? (
                  <>
                    <Button variant="outline" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>Admin Panel</Button>
                    <Button variant="ghost" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Admin Sign In</Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
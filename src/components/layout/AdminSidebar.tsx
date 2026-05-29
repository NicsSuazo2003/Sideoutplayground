import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, MapPin, BarChart3, DollarSign, Zap } from 'lucide-react';

const links = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Court', href: '/admin/court', icon: MapPin },
  { label: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-1 p-4 h-full">
      {/* Brand */}
      <Link to="/admin" className="flex items-center gap-2.5 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-[#7CFC00] flex items-center justify-center">
          <Zap size={16} className="text-black fill-black" />
        </div>
        <div className="leading-none">
          <div className="font-black text-white text-xs">SIDE OUT</div>
          <div className="text-[9px] text-[#7CFC00] tracking-widest font-semibold">ADMIN</div>
        </div>
      </Link>

      {/* Links */}
      {links.map(link => (
        <Link
          key={link.href}
          to={link.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive(link.href)
              ? 'text-[#7CFC00] bg-[#7CFC00]/10 border-l-2 border-[#7CFC00] shadow-[0_0_10px_rgba(124,252,0,0.1)]'
              : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
          }`}
        >
          <link.icon size={18} />
          {link.label}
        </Link>
      ))}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/8">
        <Link to="/" className="text-xs text-white/30 hover:text-white/50 transition-colors px-3">
          ← Back to Site
        </Link>
      </div>
    </nav>
  );
}
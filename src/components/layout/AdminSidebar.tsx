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
    <nav className="flex flex-col gap-1 p-4 h-full bg-slate-50 border-r border-slate-200">
      {/* Brand */}
      <Link to="/admin" className="flex items-center gap-2.5 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <div className="leading-none">
          <div className="font-black text-slate-800 text-xs">SIDE OUT</div>
          <div className="text-[9px] text-teal-600 tracking-widest font-semibold">ADMIN</div>
        </div>
      </Link>

      {/* Links */}
      {links.map(link => (
        <Link
          key={link.href}
          to={link.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive(link.href)
              ? 'text-teal-600 bg-teal-50 border-l-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white border-l-2 border-transparent'
          }`}
        >
          <link.icon size={18} />
          {link.label}
        </Link>
      ))}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-3">
          ← Back to Site
        </Link>
      </div>
    </nav>
  );
}
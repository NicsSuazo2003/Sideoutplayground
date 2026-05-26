import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, MapPin, BarChart3 } from 'lucide-react';

const links = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Court', href: '/admin/court', icon: MapPin },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4 px-2">
        <div className="font-black text-white text-sm">SIDE OUT</div>
        <div className="text-[10px] text-[#7CFC00] tracking-widest font-semibold">ADMIN</div>
      </div>
      {links.map(link => (
        <Link key={link.href} to={link.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? 'text-[#7CFC00] bg-[#7CFC00]/10 border-l-3 border-[#7CFC00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
          <link.icon size={18} />
          {link.label}
        </Link>
      ))}
    </div>
  );
}
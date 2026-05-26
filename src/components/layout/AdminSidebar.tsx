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

  return (
<aside className="w-56 shrink-0 glass border-r border-white/8 min-h-screen p-4">
      <div className="mb-8 px-2">
        <div className="font-black text-white text-sm">SIDE OUT</div>
        <div className="text-[10px] text-[#7CFC00] tracking-widest font-semibold">ADMIN</div>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(link => (
          <Link key={link.href} to={link.href}
            className={`sidebar-link ${(link.href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.href)) ? 'active' : ''}`}>
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
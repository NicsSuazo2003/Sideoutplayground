import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, BarChart2, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Settings, label: 'Court Settings', href: '/admin/court' },
  { icon: BarChart2, label: 'Reports', href: '/admin/reports' },
];

export function AdminSidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 glass border-r border-white/8 min-h-screen flex-col hidden md:flex">
      <div className="p-5 border-b border-white/8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF1493] flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <div className="leading-none">
            <div className="font-black text-white text-xs">SIDE OUT</div>
            <div className="text-[9px] text-[#FF1493] tracking-widest font-semibold">ADMIN PANEL</div>
          </div>
        </NavLink>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-0.5">
          {links.map(({ icon: Icon, label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/8 space-y-0.5">
        <NavLink to="/dashboard" className="sidebar-link text-sm">
          <LayoutDashboard size={17} />
          <span>User Dashboard</span>
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="sidebar-link w-full text-left hover:text-red-400"
        >
          <LogOut size={17} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

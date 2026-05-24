import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CreditCard, User, Bell, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';

const links = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Calendar, label: 'My Bookings', href: '/dashboard/my-bookings' },
  { icon: CreditCard, label: 'Membership', href: '/dashboard/membership' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

export function DashboardSidebar() {
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 glass border-r border-white/8 min-h-screen flex flex-col hidden md:flex">
      <div className="p-5 border-b border-white/8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7CFC00] flex items-center justify-center">
            <Zap size={16} className="text-black fill-black" />
          </div>
          <div className="leading-none">
            <div className="font-black text-white text-xs">SIDE OUT</div>
            <div className="text-[9px] text-[#7CFC00] tracking-widest font-semibold">PLAYGROUND</div>
          </div>
        </NavLink>
      </div>

      <div className="p-4 flex-1">
        <div className="glass-card p-3 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-bold text-sm shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-white/40 text-xs capitalize">{user?.membershipTier} member</div>
          </div>
        </div>

        <nav className="space-y-0.5">
          {links.map(({ icon: Icon, label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span className="text-sm">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-[#FF1493] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/8">
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

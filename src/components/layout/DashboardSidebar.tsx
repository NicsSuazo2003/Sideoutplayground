import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, Bell, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';

const links = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Calendar, label: 'My Bookings', href: '/dashboard/my-bookings' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

export function DashboardSidebar() {
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-200 p-4 shrink-0 select-none">
      {/* Brand */}
      <NavLink to="/" className="flex items-center gap-2.5 mb-6 px-2 py-1">
        <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <div className="leading-tight">
          <span className="font-black text-slate-900 text-xs tracking-tight block">
            SIDE OUT
          </span>
          <span className="text-[9px] text-teal-600 tracking-widest font-black uppercase block -mt-0.5">
            PLAYGROUND
          </span>
        </div>
      </NavLink>

      {/* User card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="text-slate-800 text-sm font-bold truncate">{user?.name}</div>
          <div className="text-slate-400 text-xs truncate">{user?.email}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {links.map(({ icon: Icon, label, href }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`}
                />
                <span>{label}</span>
                {label === 'Notifications' && unreadCount > 0 ? (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : isActive ? (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

/** Mobile-only bottom nav — render once at layout level. */
export function DashboardMobileNav() {
  const { unreadCount } = useNotificationStore();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] shadow-lg">
      <div className="flex items-center justify-around gap-1 py-1">
        {links.map(({ icon: Icon, label, href }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all ${
                isActive ? 'text-teal-600 font-black' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={18} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                  {label === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {isActive && label !== 'Notifications' && (
                    <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-teal-600" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
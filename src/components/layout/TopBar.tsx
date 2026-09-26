import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';

interface TopBarProps {
  notificationsPath?: string;
  profilePath?: string;
}

function getBreadcrumbs(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));
}

export function TopBar({
  notificationsPath = '/dashboard/notifications',
  profilePath = '/dashboard/profile',
}: TopBarProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-2 px-4 sm:px-6 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1">
        {crumbs.length === 0 ? (
          <span className="text-slate-900 font-bold">Home</span>
        ) : (
          crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5 shrink-0">
              {i > 0 && <ChevronRight size={13} className="text-slate-300 shrink-0" />}
              <span
                className={`truncate ${
                  i === crumbs.length - 1
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500'
                }`}
              >
                {c}
              </span>
            </span>
          ))
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => navigate(notificationsPath)}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition active:scale-95"
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 text-slate-700 transition active:scale-95"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
            {user?.name?.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
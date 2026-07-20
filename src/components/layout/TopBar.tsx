import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';

function getBreadcrumbs(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));
}

export function TopBar() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} />}
            <span className={i === crumbs.length - 1 ? 'text-slate-800 font-medium' : ''}>{c}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm hover:bg-teal-200 transition-colors"
        >
          {user?.name.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
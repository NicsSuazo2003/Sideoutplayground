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
    <header className="h-14 glass border-b border-white/8 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-1.5 text-sm text-white/50">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} />}
            <span className={i === crumbs.length - 1 ? 'text-white font-medium' : ''}>{c}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF1493] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-8 h-8 rounded-full bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-bold text-sm hover:bg-[#7CFC00]/30 transition-colors"
        >
          {user?.name.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}

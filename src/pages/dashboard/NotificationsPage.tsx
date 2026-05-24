import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, CreditCard, Trophy, Settings, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { NotificationType } from '../../types';

const typeIcon: Record<NotificationType, typeof Bell> = {
  booking: Calendar,
  membership: CreditCard,
  tournament: Trophy,
  system: Settings,
};

const typeColor: Record<NotificationType, string> = {
  booking: '#7CFC00',
  membership: '#FFD700',
  tournament: '#FF1493',
  system: '#94a3b8',
};

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function NotificationsPage() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllRead } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-white/50 text-sm mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <EmptyState icon={<Bell size={24} />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = typeIcon[n.type];
            const color = typeColor[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`glass-card p-4 flex gap-4 cursor-pointer transition-all hover:border-white/15 ${!n.read ? 'border-l-[#7CFC00] border-l-2' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${n.read ? 'text-white/70' : 'text-white'}`}>{n.title}</span>
                    <span className="text-white/30 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#7CFC00] shrink-0 mt-1.5" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

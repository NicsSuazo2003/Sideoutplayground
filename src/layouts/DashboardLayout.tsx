import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { TopBar } from '../components/layout/TopBar';
import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

export function DashboardLayout() {
  const { fetchNotifications } = useNotificationStore();
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-bg flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

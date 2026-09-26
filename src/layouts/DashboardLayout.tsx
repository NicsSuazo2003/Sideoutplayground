import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import {
  DashboardSidebar,
  DashboardMobileNav,
} from '../components/layout/DashboardSidebar';
import { TopBar } from '../components/layout/TopBar';
import { useNotificationStore } from '../stores/notificationStore';

export function DashboardLayout() {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      <DashboardMobileNav />
    </div>
  );
}
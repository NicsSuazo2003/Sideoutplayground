import { Outlet } from 'react-router-dom';
import { AdminSidebar, AdminMobileNav } from '../components/layout/AdminSidebar';
import { TopBar } from '../components/layout/TopBar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar (hides itself below md) */}
      <AdminSidebar />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          notificationsPath="/admin"
          profilePath="/admin"
        />
        {/* pb-24 keeps content clear of the fixed bottom nav on mobile */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav — the ONLY mobile navigation now */}
      <AdminMobileNav />
    </div>
  );
}
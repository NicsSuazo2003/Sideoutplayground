import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { AdminSidebar, AdminMobileNav } from '../components/layout/AdminSidebar';
import { TopBar } from '../components/layout/TopBar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            {/* Force the desktop sidebar to render inside the drawer */}
            <div className="flex-1 flex flex-col [&>aside]:!flex [&>aside]:!w-full [&>aside]:!h-auto [&>aside]:!border-r-0">
              <AdminSidebar />
            </div>
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          notificationsPath="/admin"
          profilePath="/admin"
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
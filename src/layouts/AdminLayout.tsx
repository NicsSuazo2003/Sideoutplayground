import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { Link } from 'react-router-dom';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 glass border-r border-white/8 min-h-screen">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 glass border-r border-white/8 z-50">
            <div className="flex justify-end p-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <AdminSidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-4 p-4 border-b border-white/8 glass">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
            <Menu size={20} className="text-white/70" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-xs text-white/40 hover:text-white transition-colors lg:hidden">
            View Site
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
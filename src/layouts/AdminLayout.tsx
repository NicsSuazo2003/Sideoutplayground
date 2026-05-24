import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { TopBar } from '../components/layout/TopBar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function PublicLayout() {
  const { pathname } = useLocation();

  // Automatically scroll to top on every page transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 antialiased selection:bg-teal-600 selection:text-white">
      {/* Fixed/Sticky Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer with mobile safe bottom padding so fixed drawers never hide links */}
      <div className="pb-safe sm:pb-0">
        <Footer />
      </div>
    </div>
  );
}
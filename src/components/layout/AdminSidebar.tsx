import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  BarChart3,
  DollarSign,
  Zap,
  Trophy,
  ArrowLeft,
} from 'lucide-react';

const links = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Open Play', href: '/admin/openplay', icon: Trophy },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Court', href: '/admin/court', icon: MapPin },
  { label: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible md and up)                    */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-200 p-4 shrink-0 select-none">
        {/* Brand Header */}
        <Link to="/admin" className="flex items-center gap-2.5 mb-6 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <div className="leading-tight">
            <span className="font-black text-slate-900 text-xs tracking-tight block">SIDE OUT</span>
            <span className="text-[9px] text-teal-600 tracking-widest font-black uppercase block -mt-0.5">
              MANAGEMENT
            </span>
          </div>
        </Link>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-teal-50 text-teal-700 font-extrabold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    active ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{link.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Return Action */}
        <div className="pt-4 border-t border-slate-100">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            <span>Return to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION (Visible on small screens)    */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around overflow-x-auto no-scrollbar gap-1 py-1">
          {links.slice(0, 5).map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all ${
                  active ? 'text-teal-600 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon size={18} className={active ? 'text-teal-600' : 'text-slate-400'} />
                  {active && (
                    <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 leading-none">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
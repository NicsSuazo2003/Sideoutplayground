import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAdminStore } from '../../stores/adminStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/Badge';

function format12h(time?: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-md backdrop-blur-xs">
        <div className="mb-1 text-slate-400 font-medium">{label}</div>
        <div className="font-extrabold text-teal-600 text-sm">
          {typeof payload[0].value === 'number'
            ? payload[0].value.toLocaleString()
            : payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const { analytics, bookings, isLoading, fetchAnalytics, fetchAllBookings } = useAdminStore();

  useEffect(() => {
    fetchAnalytics();
    fetchAllBookings();
  }, [fetchAnalytics, fetchAllBookings]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  const cards = [
    {
      label: 'Total Revenue',
      value: `₱${(analytics?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      growth: analytics?.revenueGrowth ?? 0,
      color: '#0d9488',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
    },
    {
      label: 'Total Bookings',
      value: (analytics?.totalBookings ?? 0).toLocaleString(),
      icon: Calendar,
      growth: analytics?.bookingsGrowth ?? 0,
      color: '#f59e0b',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: 'Active Customers',
      value: (analytics?.activeUsers ?? 0).toLocaleString(),
      icon: Users,
      growth: analytics?.usersGrowth ?? 0,
      color: '#3b82f6',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 sm:pb-8">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Realtime performance metrics for Side Out Playground
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Sparkles size={13} className="text-teal-600" />
          <span>Updated just now</span>
        </div>
      </div>

      {isLoading && !analytics ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <>
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {cards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
                    <c.icon size={20} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      c.growth >= 0
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                        : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                    }`}
                  >
                    {c.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(c.growth)}%</span>
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-0.5">
                  {c.value}
                </div>
                <div className="text-xs font-medium text-slate-400">{c.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Graphical Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Revenue Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Revenue (Past 14 Days)
                </h2>
                <span className="text-[11px] font-bold text-teal-600">Daily Trend</span>
              </div>
              <div className="h-48 sm:h-56 w-full -ml-3 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics?.revenueByDay.slice(-14) ?? []}
                    margin={{ top: 5, right: 15, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={(d: string) => d.slice(5)}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#0d9488' }}
                      activeDot={{ r: 5, fill: '#0d9488' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bookings Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Bookings Volume (7 Days)
                </h2>
                <span className="text-[11px] font-bold text-amber-600">Hourly Slots</span>
              </div>
              <div className="h-48 sm:h-56 w-full -ml-3 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.bookingsByDay.slice(-7) ?? []}
                    margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={(d: string) => d.slice(5)}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="bookings"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Today's Schedule Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Today's Court Runs
                </h2>
                <p className="text-[11px] text-slate-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {todayBookings.length} scheduled
              </span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Clock className="mx-auto mb-2 h-7 w-7 opacity-30 text-teal-600" />
                <p>No court bookings scheduled for today.</p>
              </div>
            ) : (
              <>
                {/* Mobile Feed (< sm viewports) */}
                <div className="space-y-2.5 sm:hidden">
                  {todayBookings.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          <Clock size={13} className="text-teal-600 shrink-0" />
                          <span>
                            {format12h(b.slots[0]?.startTime)} – {format12h(b.slots[b.slots.length - 1]?.endTime)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate font-semibold mt-0.5">
                          {b.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {b.slots.length} {b.slots.length === 1 ? 'hour' : 'hours'} · Ref: {b.referenceCode}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Clean Data Table (>= sm viewports) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-2.5 text-left font-bold">Time Window</th>
                        <th className="pb-2.5 text-left font-bold">Customer</th>
                        <th className="pb-2.5 text-left font-bold">Ref Code</th>
                        <th className="pb-2.5 text-left font-bold">Duration</th>
                        <th className="pb-2.5 text-right font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {todayBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 font-bold text-slate-800">
                            {format12h(b.slots[0]?.startTime)} – {format12h(b.slots[b.slots.length - 1]?.endTime)}
                          </td>
                          <td className="py-2.5 font-medium text-slate-700">{b.customerName}</td>
                          <td className="py-2.5 font-mono text-[11px] text-teal-700 font-bold">
                            {b.referenceCode}
                          </td>
                          <td className="py-2.5 text-slate-500 font-medium">
                            {b.slots.length} {b.slots.length === 1 ? 'hr' : 'hrs'}
                          </td>
                          <td className="py-2.5 text-right">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
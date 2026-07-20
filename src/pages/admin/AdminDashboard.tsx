import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAdminStore } from '../../stores/adminStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/Badge';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 text-xs">
        <div className="text-slate-400 mb-1">{label}</div>
        <div className="text-teal-600 font-bold">{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const { analytics, bookings, isLoading, fetchAnalytics, fetchAllBookings } = useAdminStore();

  useEffect(() => { fetchAnalytics(); fetchAllBookings(); }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  const cards = [
    { label: 'Total Revenue', value: `₱${analytics?.totalRevenue.toLocaleString() || 0}`, icon: DollarSign, growth: analytics?.revenueGrowth || 0, color: '#0d9488' },
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: Calendar, growth: analytics?.bookingsGrowth || 0, color: '#f59e0b' },
    { label: 'Active Customers', value: analytics?.activeUsers || 0, icon: Users, growth: analytics?.usersGrowth || 0, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of Side Out Playground performance</p>
      </div>

      {isLoading && !analytics ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}15` }}>
                    <c.icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${c.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {c.growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(c.growth)}%
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-800 mb-1">{c.value}</div>
                <div className="text-slate-400 text-sm">{c.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h2 className="text-slate-800 font-bold mb-4">Revenue (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics?.revenueByDay.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h2 className="text-slate-800 font-bold mb-4">Bookings (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.bookingsByDay.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-slate-800 font-bold mb-4">Today's Schedule</h2>
            {todayBookings.length === 0 ? (
              <p className="text-slate-400 text-sm">No bookings scheduled for today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs border-b border-slate-200">
                      <th className="text-left pb-2 font-semibold">Time</th>
                      <th className="text-left pb-2 font-semibold">Player</th>
                      <th className="text-left pb-2 font-semibold">Duration</th>
                      <th className="text-left pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayBookings.map(b => (
                      <tr key={b.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-600">{b.slots[0]?.startTime}</td>
                        <td className="py-2 text-slate-800">{b.customerName}</td>
                        <td className="py-2 text-slate-500">{b.slots.length}h</td>
                        <td className="py-2"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
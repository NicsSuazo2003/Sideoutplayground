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
      <div className="glass-card p-3 text-xs">
        <div className="text-white/50 mb-1">{label}</div>
        <div className="text-[#7CFC00] font-bold">{payload[0].value}</div>
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
    { label: 'Total Revenue', value: `₱${analytics?.totalRevenue.toLocaleString() || 0}`, icon: DollarSign, growth: analytics?.revenueGrowth || 0, color: '#7CFC00' },
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: Calendar, growth: analytics?.bookingsGrowth || 0, color: '#FF1493' },
    { label: 'Active Users', value: analytics?.activeUsers || 0, icon: Users, growth: analytics?.usersGrowth || 0, color: '#FFD700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Overview of Side Out Playground performance</p>
      </div>

      {isLoading && !analytics ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}15` }}>
                    <c.icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${c.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(c.growth)}%
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">{c.value}</div>
                <div className="text-white/40 text-sm">{c.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-4">Revenue (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics?.revenueByDay.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#7CFC00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-4">Bookings (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.bookingsByDay.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="#FF1493" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <h2 className="text-white font-bold mb-4">Today's Schedule</h2>
            {todayBookings.length === 0 ? (
              <p className="text-white/40 text-sm">No bookings scheduled for today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs border-b border-white/8">
                      <th className="text-left pb-2 font-semibold">Time</th>
                      <th className="text-left pb-2 font-semibold">Player</th>
                      <th className="text-left pb-2 font-semibold">Duration</th>
                      <th className="text-left pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {todayBookings.map(b => (
                      <tr key={b.id} className="border-b border-white/5">
                        <td className="py-2 text-white/70">{b.slots[0]?.startTime}</td>
                        <td className="py-2 text-white/80">{b.userName}</td>
                        <td className="py-2 text-white/50">{b.slots.length}h</td>
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

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminReports() {
  const { analytics, isLoading, fetchAnalytics } = useAdminStore();
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-24');

  useEffect(() => { fetchAnalytics(); }, []);

  const filtered = analytics?.revenueByDay.filter(d => d.date >= dateFrom && d.date <= dateTo) || [];
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalDays = filtered.length;

  const monthlyData = analytics?.revenueByDay.reduce<Record<string, number>>((acc, d) => {
    const month = d.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + d.revenue;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Reports</h1>
          <p className="text-white/50 text-sm mt-1">Revenue and booking analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('CSV export coming soon!')}>
            <Download size={14} /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('PDF export coming soon!')}>
            <Download size={14} /> Export PDF
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[#7CFC00]" /> Date Range Filter
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-white/50 block mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full input-glass rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-white/50 block mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full input-glass rounded-xl px-4 py-2.5 text-sm" />
          </div>
        </div>
      </motion.div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, color: '#7CFC00' },
              { label: 'Days in Range', value: totalDays, color: '#FF1493' },
              { label: 'Avg. Daily Revenue', value: `₱${totalDays > 0 ? Math.round(totalRevenue / totalDays) : 0}`, color: '#FFD700' },
            ].map(c => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                <div className="text-2xl font-black mb-1" style={{ color: c.color }}>{c.value}</div>
                <div className="text-white/50 text-sm">{c.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <h2 className="text-white font-bold mb-4">Monthly Revenue Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-white/40 text-xs">
                    <th className="text-left p-3 font-semibold">Month</th>
                    <th className="text-left p-3 font-semibold">Revenue</th>
                    <th className="text-left p-3 font-semibold">% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyData).sort(([a], [b]) => b.localeCompare(a)).map(([month, rev]) => (
                    <tr key={month} className="border-b border-white/5">
                      <td className="p-3 text-white/70">{new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                      <td className="p-3 text-[#7CFC00] font-semibold">₱{rev.toLocaleString()}</td>
                      <td className="p-3 text-white/50">{analytics ? Math.round((rev / analytics.totalRevenue) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  CalendarDays,
  Percent,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

function getISODateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function AdminReports() {
  const { analytics, isLoading, fetchAnalytics } = useAdminStore();
  const [dateFrom, setDateFrom] = useState(() => getISODateDaysAgo(30));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filtered =
    analytics?.revenueByDay.filter((d) => d.date >= dateFrom && d.date <= dateTo) || [];
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalDays = filtered.length;

  const monthlyData =
    analytics?.revenueByDay.reduce<Record<string, number>>((acc, d) => {
      const month = d.date.slice(0, 7);
      acc[month] = (acc[month] || 0) + d.revenue;
      return acc;
    }, {}) || {};

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No data available in selected range');
      return;
    }
    const headers = 'Date,Revenue\n';
    const rows = filtered.map((d) => `${d.date},${d.revenue}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenue-report-${dateFrom}-to-${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  const handlePresetSelect = (preset: '7d' | '30d' | 'thisMonth' | 'ytd') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setDateTo(todayStr);

    if (preset === '7d') {
      setDateFrom(getISODateDaysAgo(7));
    } else if (preset === '30d') {
      setDateFrom(getISODateDaysAgo(30));
    } else if (preset === 'thisMonth') {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      setDateFrom(firstOfMonth);
    } else if (preset === 'ytd') {
      const firstOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      setDateFrom(firstOfYear);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl pb-24 sm:pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Revenue &amp; Analytics Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit historical booking performance, daily revenues, and monthly share.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileSpreadsheet size={14} className="text-teal-600" />}
            className="text-xs font-bold shadow-2xs"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('PDF statement generator queued')}
            leftIcon={<FileText size={14} className="text-amber-600" />}
            className="text-xs font-bold shadow-2xs"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Section Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Date Filter</h2>
              <p className="text-[11px] text-slate-400">Select reporting period</p>
            </div>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'ytd', label: 'Year to Date' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-xs font-semibold transition active:scale-95 shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <>
          {/* Key Stat Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                label: 'Selected Revenue',
                value: `₱${totalRevenue.toLocaleString()}`,
                color: 'text-teal-600',
                bg: 'bg-teal-50',
                icon: DollarSign,
              },
              {
                label: 'Active Days in Window',
                value: totalDays,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                icon: CalendarDays,
              },
              {
                label: 'Daily Average',
                value: `₱${(totalDays > 0 ? Math.round(totalRevenue / totalDays) : 0).toLocaleString()}`,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                icon: TrendingUp,
              },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.color}`}>
                    <c.icon size={18} />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-black tracking-tight ${c.color} mb-0.5`}>
                  {c.value}
                </div>
                <div className="text-xs font-medium text-slate-400">{c.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Monthly Revenue Breakdown Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Monthly Performance Breakdown
                </h2>
                <p className="text-[11px] text-slate-400">Total volume grouped by calendar month</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                {Object.keys(monthlyData).length} Months
              </span>
            </div>

            {/* Mobile Card Stack (< sm viewports) */}
            <div className="space-y-2.5 sm:hidden">
              {Object.entries(monthlyData)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, rev]) => {
                  const share =
                    analytics && analytics.totalRevenue > 0
                      ? Math.round((rev / analytics.totalRevenue) * 100)
                      : 0;

                  return (
                    <div
                      key={month}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {new Date(month + '-01T12:00:00').toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs font-black text-teal-600">
                          ₱{rev.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>Contribution Share</span>
                          <span>{share}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Desktop Structured Table (>= sm viewports) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Billing Month</th>
                    <th className="py-2.5 px-4 font-bold">Gross Revenue</th>
                    <th className="py-2.5 px-4 font-bold">Percentage of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(monthlyData)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, rev]) => {
                      const share =
                        analytics && analytics.totalRevenue > 0
                          ? Math.round((rev / analytics.totalRevenue) * 100)
                          : 0;

                      return (
                        <tr key={month} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            {new Date(month + '-01T12:00:00').toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-black text-teal-600">
                            ₱{rev.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-600">
                            <div className="flex items-center gap-2 max-w-[140px]">
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-teal-600 h-full rounded-full"
                                  style={{ width: `${Math.min(share, 100)}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 shrink-0">
                                {share}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
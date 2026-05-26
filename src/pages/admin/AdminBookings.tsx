import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Booking, BookingStatus } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const PAGE_SIZE = 10;

export function AdminBookings() {
  const { bookings, isLoading, fetchAllBookings, manageBooking } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => { fetchAllBookings(); }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        b.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
                        b.id.includes(search);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async (id: string, status: BookingStatus) => {
    try {
      await manageBooking(id, status);
      toast.success(`Booking ${status}`);
      setSelected(null);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Booking Management</h1>
        <p className="text-white/50 text-sm mt-1">{filtered.length} bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search by name, reference, or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} className="sm:w-72" />
        <div className="flex gap-1 p-1 glass rounded-xl">
          {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-[#7CFC00] text-black' : 'text-white/50 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/40 text-xs">
                  <th className="text-left p-4 font-semibold">Reference</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Time</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 text-[#7CFC00] text-xs font-mono">{b.referenceCode}</td>
                    <td className="p-4">
                      <div className="text-white/80 font-medium">{b.customerName}</div>
                      <div className="text-white/40 text-xs">{b.customerEmail}</div>
                    </td>
                    <td className="p-4 text-white/60">{b.date}</td>
                    <td className="p-4 text-white/60">
                      {b.slots.length > 0
                        ? `${format12h(b.slots[0]?.startTime)} – ${format12h(b.slots[b.slots.length-1]?.endTime)}`
                        : '—'}
                      <div className="text-white/30 text-xs">{b.slots.length}h</div>
                    </td>
                    <td className="p-4 text-[#7CFC00] font-semibold">₱{b.totalAmount}</td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                          <Eye size={14} />
                        </button>
                        {b.status === 'pending' && <button onClick={() => handleAction(b.id, 'confirmed')} className="px-2 py-1 rounded-lg bg-green-900/30 text-green-400 text-xs font-semibold hover:bg-green-900/50 transition-colors">Confirm</button>}
                        {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => handleAction(b.id, 'cancelled')} className="px-2 py-1 rounded-lg bg-red-900/30 text-red-400 text-xs font-semibold hover:bg-red-900/50 transition-colors">Cancel</button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/8">
              <span className="text-white/40 text-xs">Page {page} of {pageCount}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Reference', selected.referenceCode],
                ['Customer', selected.customerName],
                ['Email', selected.customerEmail],
                ['Phone', selected.customerPhone || '—'],
                ['Date', selected.date],
                ['Time', selected.slots.length > 0
                  ? `${format12h(selected.slots[0]?.startTime)} – ${format12h(selected.slots[selected.slots.length-1]?.endTime)}`
                  : '—'],
                ['Duration', `${selected.slots.length} hour(s)`],
                ['Amount', `₱${selected.totalAmount.toFixed(2)}`],
                ['Notes', selected.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-xl p-3">
                  <div className="text-white/40 text-xs mb-0.5">{k}</div>
                  <div className="text-white font-medium text-xs">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StatusBadge status={selected.status} />
              {selected.status === 'pending' && <Button variant="neon" size="sm" onClick={() => handleAction(selected.id, 'confirmed')}>Confirm</Button>}
              {(selected.status === 'pending' || selected.status === 'confirmed') && <Button variant="destructive" size="sm" onClick={() => handleAction(selected.id, 'cancelled')}>Cancel</Button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
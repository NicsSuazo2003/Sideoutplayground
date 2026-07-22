import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Plus, ArrowUpDown, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Booking, BookingStatus } from '../../types';
import { AdminCreateBooking } from './AdminCreateBooking';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function isPastBooking(booking: Booking): boolean {
  if (!booking.slots.length) return false;
  const lastSlot = booking.slots[booking.slots.length - 1];
  const bookingEnd = new Date(booking.date + 'T' + lastSlot.endTime);
  return bookingEnd < new Date();
}

const PAGE_SIZE = 10;

const calendarStyles = `
  .react-calendar {
    background: transparent;
    border: none;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }
  .react-calendar__navigation button { color: #1e293b; font-weight: 600; }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus { background: #f1f5f9; border-radius: 8px; }
  .react-calendar__tile {
    padding: 12px 6px;
    border-radius: 10px;
    font-weight: 500;
    color: #1e293b;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus { background: #e2e8f0; }
  .react-calendar__tile--now { background: #fef3c7; color: #92400e; font-weight: 700; }
  .react-calendar__tile--active { background: #0d9488 !important; color: white !important; }
  .react-calendar__month-view__days__day--weekend { color: #ef4444; }
  .react-calendar__month-view__weekdays__weekday { color: #64748b; font-weight: 600; font-size: 0.75rem; }
  .tile-booked { background: #fee2e2 !important; color: #dc2626 !important; font-weight: 600; }
  .tile-partial { background: #fef3c7 !important; color: #92400e !important; font-weight: 600; }
  .tile-available { background: #dcfce7 !important; color: #16a34a !important; font-weight: 600; }
`;

export function AdminBookings() {
  const { bookings, isLoading, fetchAllBookings, manageBooking } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  useEffect(() => { fetchAllBookings(); }, []);

  const filtered = bookings
    .filter(b => {
      const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          b.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.includes(search);
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchDate = !dateFilter || b.date === dateFilter;
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortNewest ? timeB - timeA : timeA - timeB;
    });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async (id: string, status: BookingStatus) => {
    try { await manageBooking(id, status); toast.success(`Booking ${status}`); setSelected(null); }
    catch { toast.error('Action failed'); }
  };

  // Calendar helpers
  const getDateStatus = (date: Date): 'fully-booked' | 'partial' | 'available' => {
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled' && b.status !== 'expired');
    if (dayBookings.length === 0) return 'available';
    const bookedHours = dayBookings.reduce((sum, b) => sum + b.slots.length, 0);
    if (bookedHours >= 16) return 'fully-booked';
    return 'partial';
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const status = getDateStatus(date);
    if (status === 'fully-booked') return 'tile-booked';
    if (status === 'partial') return 'tile-partial';
    return 'tile-available';
  };

  const handleCalendarClick = (value: any) => {
    if (value instanceof Date) {
      setDateFilter(value.toISOString().split('T')[0]);
      setCalendarDate(value);
      setShowCalendar(false);
    }
  };

  return (
    <div className="space-y-5">
      <style>{calendarStyles}</style>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Booking Management</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCalendar(true)}>
            <CalendarIcon size={14} /> Calendar
          </Button>
          <Button variant="neon" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Booking
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search by name, reference, or ID..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} className="sm:w-56" />
        <input 
          type="date" 
          value={dateFilter} 
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-teal-500"
        />
        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          {(['all', 'pending_payment', 'payment_submitted', 'confirmed', 'cancelled', 'completed', 'expired'] as string[]).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s as BookingStatus); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              {s === 'all' ? 'All' : s === 'pending_payment' ? 'Pending' : s === 'payment_submitted' ? 'Submitted' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setSortNewest(!sortNewest)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
          <ArrowUpDown size={12} /> {sortNewest ? 'Latest' : 'Oldest'}
        </button>
      </div>

      {/* Calendar Modal */}
      <Modal open={showCalendar} onClose={() => setShowCalendar(false)} title="Court Calendar" size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Fully Booked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 inline-block" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Available</span>
          </div>
          <Calendar
            onChange={handleCalendarClick}
            value={calendarDate}
            tileClassName={getTileClassName}
            className="!w-full"
          />
        </div>
      </Modal>

      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs">
                  <th className="text-left p-4 font-semibold">Reference</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Game Date</th>
                  <th className="text-left p-4 font-semibold">Time</th>
                  <th className="text-left p-4 font-semibold">Booked On</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-teal-600 text-xs font-mono">{b.referenceCode}</td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">{b.customerName}</div>
                      <div className="text-slate-400 text-xs">{b.customerEmail}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{b.date}</td>
                    <td className="p-4 text-slate-600">
                      {b.slots.length > 0
                        ? (() => { const sorted = [...b.slots].sort((a, b) => a.startTime.localeCompare(b.startTime)); return `${format12h(sorted[0]?.startTime)} – ${format12h(sorted[sorted.length-1]?.endTime)}`; })()
                        : '—'}
                      <div className="text-slate-400 text-xs">{b.slots.length}h</div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <div className="text-slate-400 text-[10px]">{new Date(b.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 text-teal-600 font-semibold">₱{b.totalAmount}</td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Eye size={14} /></button>
                        {b.status === 'pending_payment' && <button onClick={() => handleAction(b.id, 'expired')} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">Cancel</button>}
                        {b.status === 'payment_submitted' && (<>
                          <button onClick={() => handleAction(b.id, 'confirmed')} className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors">Confirm</button>
                          <button onClick={() => handleAction(b.id, 'cancelled')} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">Reject</button>
                        </>)}
                        {b.status === 'confirmed' && isPastBooking(b) && <button onClick={() => handleAction(b.id, 'completed')} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">Complete</button>}
                        {b.status === 'confirmed' && <button onClick={() => handleAction(b.id, 'cancelled')} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">Cancel</button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <span className="text-slate-400 text-xs">Page {page} of {pageCount}</span>
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
            {selected.paymentScreenshot && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-slate-400 text-xs mb-2">Payment Screenshot</div>
                <img src={selected.paymentScreenshot} alt="Payment proof" className="rounded-lg max-h-48 w-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Reference', selected.referenceCode], ['Customer', selected.customerName], ['Email', selected.customerEmail],
                ['Phone', selected.customerPhone || '—'], ['Game Date', selected.date],
                ['Time', selected.slots.length > 0 ? (() => { const sorted = [...selected.slots].sort((a, b) => a.startTime.localeCompare(b.startTime)); return `${format12h(sorted[0]?.startTime)} – ${format12h(sorted[sorted.length-1]?.endTime)}`; })() : '—'],
                ['Booked On', new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date(selected.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })],
                ['Duration', `${selected.slots.length} hour(s)`], ['Amount', `₱${selected.totalAmount.toFixed(2)}`], ['Notes', selected.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="text-slate-400 text-xs mb-0.5">{k}</div>
                  <div className="text-slate-800 font-medium text-xs">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StatusBadge status={selected.status} />
              {selected.status === 'pending_payment' && <Button variant="destructive" size="sm" onClick={() => handleAction(selected.id, 'expired')}>Cancel</Button>}
              {selected.status === 'payment_submitted' && (<>
                <Button variant="neon" size="sm" onClick={() => handleAction(selected.id, 'confirmed')}>Confirm Payment</Button>
                <Button variant="destructive" size="sm" onClick={() => handleAction(selected.id, 'cancelled')}>Reject</Button>
              </>)}
              {selected.status === 'confirmed' && isPastBooking(selected) && <Button variant="outline" size="sm" onClick={() => handleAction(selected.id, 'completed')}>Mark Complete</Button>}
              {selected.status === 'confirmed' && <Button variant="destructive" size="sm" onClick={() => handleAction(selected.id, 'cancelled')}>Cancel</Button>}
            </div>
          </div>
        )}
      </Modal>
      <AdminCreateBooking open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={fetchAllBookings} />
    </div>
  );
}
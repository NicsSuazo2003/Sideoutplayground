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
  const [calendarDate] = useState<Date>(new Date());
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayLabel, setSelectedDayLabel] = useState('');

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

  return (
    <div className="space-y-5">
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

      {/* ==================== CALENDAR MODAL ==================== */}
      <Modal open={showCalendar} onClose={() => setShowCalendar(false)} title="Court Calendar" size="xl">
        <style>{`
          .react-calendar { background: transparent; border: none; font-family: 'Inter', sans-serif; width: 100%; }
          .react-calendar__navigation { margin-bottom: 16px; }
          .react-calendar__navigation button { color: #1e293b; font-weight: 700; font-size: 1rem; }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus { background: #f1f5f9; border-radius: 8px; }
          .react-calendar__month-view__weekdays__weekday { color: #64748b; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; }
          .react-calendar__tile { height: 110px; padding: 4px; vertical-align: top; text-align: left; font-size: 0.75rem; border-radius: 8px; border: 1px solid #f1f5f9 !important; overflow: hidden; background: white; cursor: pointer; }
          .react-calendar__tile:enabled:hover { background: #f8fafc; }
          .react-calendar__tile--now { background: #fefce8; }
          .react-calendar__tile--now .day-number { color: #92400e; font-weight: 800; }
          .react-calendar__month-view__days__day--neighboringMonth { opacity: 0.3; }
          .day-number { font-weight: 600; font-size: 0.8rem; color: #1e293b; margin-bottom: 2px; display: block; }
          .event-tag { font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
          .event-tag.confirmed { background: #0d9488; color: white; }
          .event-tag.pending { background: #f59e0b; color: white; }
          .event-tag.submitted { background: #3b82f6; color: white; }
        `}</style>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-600 inline-block" /> Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Submitted</span>
          </div>
          <Calendar
            value={calendarDate}
            onClickDay={(value: Date) => {
              const dateStr = value.toISOString().split('T')[0];
              const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled' && b.status !== 'expired');
              setSelectedDayBookings(dayBookings);
              setSelectedDayLabel(value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
              setShowDayModal(true);
            }}
            tileContent={({ date }) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled' && b.status !== 'expired');
              if (dayBookings.length === 0) return null;
              return (
                <div className="space-y-0.5 mt-1">
                  {dayBookings.slice(0, 3).map(b => (
                    <div key={b.id} className={`event-tag ${b.status === 'confirmed' ? 'confirmed' : b.status === 'pending_payment' ? 'pending' : 'submitted'}`}>
                      {b.slots[0]?.startTime ? format12h(b.slots[0].startTime) : ''} {b.customerName.split(' ')[0]}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[0.55rem] text-slate-400 pl-1">+{dayBookings.length - 3} more</div>
                  )}
                </div>
              );
            }}
            className="!w-full"
          />
        </div>
      </Modal>

      {/* ==================== DAY DETAILS MODAL ==================== */}
      <Modal open={showDayModal} onClose={() => setShowDayModal(false)} title={selectedDayLabel} size="lg">
        {selectedDayBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No bookings for this date</div>
        ) : (
          <div className="space-y-3">
            {selectedDayBookings.map(b => (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-teal-600 text-xs font-mono">{b.referenceCode}</span>
                  </div>
                  <span className="text-teal-600 font-bold">₱{b.totalAmount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div><span className="text-slate-400">Customer:</span> {b.customerName}</div>
                  <div><span className="text-slate-400">Email:</span> {b.customerEmail}</div>
                  <div><span className="text-slate-400">Time:</span> {b.slots.length > 0 
                    ? (() => { const sorted = [...b.slots].sort((a, b) => a.startTime.localeCompare(b.startTime)); return `${format12h(sorted[0]?.startTime)} – ${format12h(sorted[sorted.length-1]?.endTime)}`; })() 
                    : '—'}</div>
                  <div><span className="text-slate-400">Duration:</span> {b.slots.length}h</div>
                  {b.notes && <div className="col-span-2"><span className="text-slate-400">Notes:</span> {b.notes}</div>}
                  <div className="col-span-2 text-slate-400">
                    Booked: {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(b.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
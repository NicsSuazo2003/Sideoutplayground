import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Plus,
  ArrowUpDown,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Mail,
  Phone,
  ZoomIn,
} from 'lucide-react';
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

// ============================================================
// HELPERS
// ============================================================

function format12h(time: string): string {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function toDay(iso: string | undefined | null): string {
  return iso ? iso.slice(0, 10) : '';
}

function localDayString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPastBooking(booking: Booking): boolean {
  if (!booking.slots?.length) return false;
  const lastSlot = booking.slots[booking.slots.length - 1];
  const end = (lastSlot as any).endTime ?? (lastSlot as any).end_time;
  if (!end) return false;
  return new Date(booking.date + 'T' + end) < new Date();
}

function calculateDuration(slots: any[]): string {
  if (!slots || slots.length === 0) return '—';
  const sorted = [...slots].sort((a, b) =>
    String(a.startTime ?? a.start_time).localeCompare(String(b.startTime ?? b.start_time))
  );
  const start = sorted[0]?.startTime ?? sorted[0]?.start_time;
  const end = sorted[sorted.length - 1]?.endTime ?? sorted[sorted.length - 1]?.end_time;
  if (start && end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diffHours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    return `${diffHours}h`;
  }
  return `${slots.length}h`;
}

function getTimeRange(slots: any[]): string {
  if (!slots || slots.length === 0) return '—';
  const sorted = [...slots].sort((a, b) =>
    String(a.startTime ?? a.start_time).localeCompare(String(b.startTime ?? b.start_time))
  );
  const start = sorted[0]?.startTime ?? sorted[0]?.start_time;
  const end = sorted[sorted.length - 1]?.endTime ?? sorted[sorted.length - 1]?.end_time;
  return `${format12h(start)} – ${format12h(end)}`;
}

function timeLeft(deadline?: string | null): string | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return 'Deadline passed';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min left`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m left`;
}

// ============================================================
// CONFIG
// ============================================================

const PAGE_SIZE = 15;

type TabKey = 'review' | 'unpaid' | 'confirmed' | 'history' | 'all';

const TABS: { key: TabKey; label: string; statuses: BookingStatus[] | null }[] = [
  { key: 'review', label: 'Needs review', statuses: ['payment_submitted'] },
  { key: 'unpaid', label: 'Unpaid', statuses: ['pending_payment'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
  {
    key: 'history',
    label: 'History',
    statuses: ['completed', 'cancelled', 'expired', 'refunded'],
  },
  { key: 'all', label: 'All', statuses: null },
];

type DateFilter = 'all' | 'today' | 'week' | 'upcoming';

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'upcoming', label: 'Upcoming' },
];

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

interface ActionDef {
  to: BookingStatus;
  label: string;
  helper: string;
  variant: ButtonVariant;
  icon?: ReactNode;
  confirm?: {
    title: string;
    message: string;
    confirmLabel: string;
    askReason?: boolean;
  };
  adminOnly?: boolean;
  requiresStarted?: boolean;
}

const ACTIONS: Partial<Record<BookingStatus, ActionDef[]>> = {
  pending_payment: [
    {
      to: 'confirmed',
      label: 'Mark paid & confirm',
      helper: 'Use only if you already received payment (cash on-site or GCash outside the app).',
      variant: 'success',
      icon: <CheckCircle2 className="h-4 w-4" />,
      confirm: {
        title: 'Confirm without payment proof?',
        message:
          'This confirms the booking without verifying a payment in the app. Only continue if you have already received the money.',
        confirmLabel: 'Mark paid & confirm',
      },
    },
    {
      to: 'expired',
      label: 'Mark expired',
      helper: 'Customer never paid in time. The slot becomes available again.',
      variant: 'secondary',
      icon: <Clock className="h-4 w-4" />,
      confirm: {
        title: 'Mark as expired?',
        message: 'The time slot will be released for other customers. This cannot be undone.',
        confirmLabel: 'Mark expired',
      },
    },
    {
      to: 'cancelled',
      label: 'Cancel booking',
      helper: 'Booking is called off before any payment.',
      variant: 'danger',
      icon: <XCircle className="h-4 w-4" />,
      confirm: {
        title: 'Cancel this booking?',
        message: 'The slot will be released. This cannot be undone.',
        confirmLabel: 'Cancel booking',
        askReason: true,
      },
    },
  ],
  payment_submitted: [
    {
      to: 'confirmed',
      label: 'Approve payment',
      helper: 'Payment proof looks valid. Confirms the booking.',
      variant: 'success',
      icon: <CheckCircle2 className="h-4 w-4" />,
      confirm: {
        title: 'Approve this payment?',
        message: 'Make sure the amount and reference number match what you received.',
        confirmLabel: 'Approve & confirm',
      },
    },
    {
      to: 'cancelled',
      label: 'Reject payment',
      helper: 'Proof is invalid or the amount is wrong. The slot is released.',
      variant: 'danger',
      icon: <XCircle className="h-4 w-4" />,
      confirm: {
        title: 'Reject this payment?',
        message: 'The booking will be cancelled and the slot released. This cannot be undone.',
        confirmLabel: 'Reject payment',
        askReason: true,
      },
    },
  ],
  confirmed: [
    {
      to: 'completed',
      label: 'Mark completed',
      helper: 'The customer has played. Available once the booking date arrives.',
      variant: 'primary',
      icon: <CheckCircle2 className="h-4 w-4" />,
      requiresStarted: true,
      confirm: {
        title: 'Mark as completed?',
        message: 'The booking will be closed as completed.',
        confirmLabel: 'Mark completed',
      },
    },
    {
      to: 'refunded',
      label: 'Mark as refunded',
      helper: 'Records that money was returned. Send the refund via GCash/cash first.',
      variant: 'secondary',
      icon: <RotateCcw className="h-4 w-4" />,
      adminOnly: true,
      confirm: {
        title: 'Mark as refunded?',
        message:
          'This only updates the status – it does NOT send money. Return the payment to the customer first.',
        confirmLabel: 'Mark as refunded',
        askReason: true,
      },
    },
    {
      to: 'cancelled',
      label: 'Cancel booking',
      helper: 'Calls off a paid booking. If the customer paid, mark it as refunded instead.',
      variant: 'danger',
      icon: <XCircle className="h-4 w-4" />,
      confirm: {
        title: 'Cancel this paid booking?',
        message:
          'This booking is already confirmed. If the customer paid and should get their money back, use "Mark as refunded" instead.',
        confirmLabel: 'Cancel booking',
        askReason: true,
      },
    },
  ],
  completed: [
    {
      to: 'refunded',
      label: 'Mark as refunded',
      helper: 'Records that money was returned. Send the refund via GCash/cash first.',
      variant: 'secondary',
      icon: <RotateCcw className="h-4 w-4" />,
      adminOnly: true,
      confirm: {
        title: 'Mark as refunded?',
        message:
          'This only updates the status – it does NOT send money. Return the payment to the customer first.',
        confirmLabel: 'Mark as refunded',
        askReason: true,
      },
    },
  ],
};

const TERMINAL_STATUSES: BookingStatus[] = ['cancelled', 'expired', 'refunded'];

type BookingExtras = {
  payment_deadline?: string | null;
  expires_at?: string | null;
  status_updated_by?: string | null;
  status_updated_at?: string | null;
  status_reason?: string | null;
};

// Map our abstract variants → this project's Button variants.
const variantToButton: Record<ButtonVariant, 'neon' | 'outline' | 'destructive' | 'ghost'> = {
  primary: 'neon',
  success: 'neon',
  secondary: 'outline',
  danger: 'destructive',
};

// ============================================================
// PAGE
// ============================================================

export function AdminBookings() {
  const { bookings, isLoading, fetchAllBookings, manageBooking, user } = useAdminStore();
const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<BookingStatus | null>(null);
  const [pendingAction, setPendingAction] = useState<{ booking: Booking; action: ActionDef } | null>(
    null
  );
  const [reason, setReason] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate] = useState<Date>(new Date());
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayLabel, setSelectedDayLabel] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(false);

  const [copied, setCopied] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const defaultTabApplied = useRef(false);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { review: 0, unpaid: 0, confirmed: 0, history: 0, all: 0 };
    for (const b of bookings as Booking[]) {
      counts.all += 1;
      for (const t of TABS) {
        if (t.statuses && t.statuses.includes(b.status)) counts[t.key] += 1;
      }
    }
    return counts;
  }, [bookings]);

  // Land on "Needs review" the first time data arrives, if work is waiting.
  useEffect(() => {
    if (defaultTabApplied.current || isLoading || (bookings as Booking[]).length === 0) return;
    defaultTabApplied.current = true;
    if (tabCounts.review > 0) setTab('review');
  }, [isLoading, bookings, tabCounts.review]);

  // Filter + sort
  const filtered = useMemo(() => {
    const activeTab = TABS.find((t) => t.key === tab);
    const today = localDayString(0);
    const weekEnd = localDayString(6);
    const q = search.trim().toLowerCase();

    const list = (bookings as Booking[]).filter((b) => {
      if (activeTab?.statuses && !activeTab.statuses.includes(b.status)) return false;

      const day = toDay(b.date);
      if (dateFilter === 'today' && day !== today) return false;
      if (dateFilter === 'week' && (day < today || day > weekEnd)) return false;
      if (dateFilter === 'upcoming' && day < today) return false;

      if (q) {
        return (
          b.customerName?.toLowerCase().includes(q) ||
          b.referenceCode?.toLowerCase().includes(q) ||
          (b as any).customerEmail?.toLowerCase().includes(q) ||
          (b as any).customerPhone?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });
  }, [bookings, tab, dateFilter, search, sortNewest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab, dateFilter, search, sortNewest]);

  const hasActiveFilters = search.trim() !== '' || dateFilter !== 'all' || tab !== 'all';

  const clearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setTab('all');
  };

  // Actions
  const handleStatusUpdate = async (booking: Booking, status: BookingStatus, why?: string) => {
    setUpdatingStatus(status);
    try {
      // If manageBooking accepts a third arg, add it in the store; UI is wired.
      await manageBooking(booking.id, status, why || undefined);
      toast.success(`Booking ${booking.referenceCode || ''} marked as ${status.replace(/_/g, ' ')}.`);
      setSelected(null);
      await fetchAllBookings();
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : 'Action failed';
      toast.error(msg);
      // Refresh in case the data was stale.
      fetchAllBookings();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const runAction = (booking: Booking, action: ActionDef) => {
    if (action.confirm) {
      setReason('');
      setPendingAction({ booking, action });
    } else {
      handleStatusUpdate(booking, action.to);
    }
  };

  const confirmPending = async () => {
    if (!pendingAction) return;
    const { booking, action } = pendingAction;
    const why = reason.trim();
    setPendingAction(null);
    setReason('');
    await handleStatusUpdate(booking, action.to, why);
  };

  const openDetails = (b: Booking) => {
    setCopied(false);
    setSelected(b);
  };

  const copyReference = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy. Select the number and copy it manually.');
    }
  };

  // Derived for modal
  const todayStr = localDayString(0);
  const modalActions = selected
    ? (ACTIONS[selected.status] ?? []).filter((a) => !(a.adminOnly && !isAdmin))
    : [];
  const hiddenAdminOnly = selected
    ? (ACTIONS[selected.status] ?? []).some((a) => a.adminOnly && !isAdmin)
    : false;
  const extra = selected as (Booking & BookingExtras) | null;
  const deadline = extra?.payment_deadline ?? extra?.expires_at ?? null;

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Tabs with counts */}
      <div role="tablist" aria-label="Booking status" className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          const urgent = t.key === 'review' && tabCounts.review > 0;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  urgent ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tabCounts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <Input
          aria-label="Search bookings"
          placeholder="Search name, email, phone, booking or payment ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          className="sm:w-72"
        />
        <select
          aria-label="Filter by date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-teal-500"
        >
          {DATE_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          aria-label={`Sort by date, currently ${sortNewest ? 'newest first' : 'oldest first'}`}
        >
          <ArrowUpDown size={12} /> {sortNewest ? 'Latest' : 'Oldest'}
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span aria-live="polite">
            Showing {filtered.length} of {(bookings as Booking[]).length}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="font-semibold text-teal-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table / empty / loading */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm py-12 text-center">
          {(bookings as Booking[]).length === 0 ? (
            <>
              <p className="text-sm font-semibold text-slate-700">No bookings yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Bookings will appear here as customers reserve courts.
              </p>
              <Button variant="neon" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus size={14} /> New Booking
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700">No bookings match these filters</p>
              <p className="text-xs text-slate-500 mt-1">Try a different search or clear the filters.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
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
                {pageItems.map((b, i) => {
                  const needsReview = b.status === 'payment_submitted';
                  return (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => openDetails(b)}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                        needsReview ? 'border-l-4 border-l-amber-400 bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="p-4 text-teal-600 text-xs font-mono">
                        {b.referenceCode}
                        {(b as any).paymentReference && (
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Pay ref:{' '}
                            <span className="font-mono text-slate-600">
                              {(b as any).paymentReference}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 font-medium">{b.customerName}</div>
                        <div className="text-slate-400 text-xs">{(b as any).customerEmail}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{b.date}</td>
                      <td className="p-4 text-slate-600">
                        {getTimeRange(b.slots)}
                        <div className="text-slate-400 text-xs">{calculateDuration(b.slots)}</div>
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {new Date(b.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <div className="text-slate-400 text-[10px]">
                          {new Date(b.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-teal-600 font-semibold">₱{b.totalAmount}</td>
                      <td className="p-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {needsReview ? (
                          <Button variant="neon" size="sm" onClick={() => openDetails(b)}>
                            Review payment
                          </Button>
                        ) : (
                          <button
                            onClick={() => openDetails(b)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="View details"
                            aria-label={`View details for booking ${b.referenceCode || ''}`}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <span className="text-slate-400 text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CALENDAR MODAL                                               */}
      {/* ============================================================ */}
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
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-600 inline-block" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Submitted
            </span>
          </div>
          <Calendar
            value={calendarDate}
            onClickDay={(value: Date) => {
              const dateStr = formatLocalDate(value);
              const dayBookings = (bookings as Booking[]).filter(
                (b) =>
                  b.date === dateStr &&
                  b.status !== 'cancelled' &&
                  b.status !== 'expired' &&
                  b.status !== 'refunded'
              );
              setSelectedDayBookings(dayBookings);
              setSelectedDayLabel(
                value.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              );
              setShowDayModal(true);
            }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              const dateStr = formatLocalDate(date);
              const dayBookings = (bookings as Booking[]).filter(
                (b) =>
                  b.date === dateStr &&
                  b.status !== 'cancelled' &&
                  b.status !== 'expired' &&
                  b.status !== 'refunded'
              );
              if (dayBookings.length === 0) return null;
              return (
                <div className="space-y-0.5 mt-1">
                  {dayBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className={`event-tag ${
                        b.status === 'confirmed'
                          ? 'confirmed'
                          : b.status === 'pending_payment'
                            ? 'pending'
                            : 'submitted'
                      }`}
                    >
                      {b.slots[0]?.startTime ? format12h(b.slots[0].startTime) : ''}{' '}
                      {b.customerName.split(' ')[0]}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[0.55rem] text-slate-400 pl-1">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              );
            }}
            className="!w-full"
          />
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DAY DETAILS MODAL                                            */}
      {/* ============================================================ */}
      <Modal open={showDayModal} onClose={() => setShowDayModal(false)} title={selectedDayLabel} size="lg">
        {selectedDayBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No bookings for this date</div>
        ) : (
          <div className="space-y-3">
            {selectedDayBookings.map((b) => (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-teal-600 text-xs font-mono">{b.referenceCode}</span>
                  </div>
                  <span className="text-teal-600 font-bold">₱{b.totalAmount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Customer:</span> {b.customerName}
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span> {(b as any).customerEmail}
                  </div>
                  <div>
                    <span className="text-slate-400">Time:</span> {getTimeRange(b.slots)}
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span> {calculateDuration(b.slots)}
                  </div>
                  {b.notes && (
                    <div className="col-span-2">
                      <span className="text-slate-400">Notes:</span> {b.notes}
                    </div>
                  )}
                  <div className="col-span-2 text-slate-400">
                    Booked:{' '}
                    {new Date(b.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(b.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* BOOKING DETAILS MODAL                                        */}
      {/* ============================================================ */}
      <Modal
        open={!!selected}
        onClose={() => {
          if (updatingStatus) return;
          setSelected(null);
          setShowScreenshot(false);
        }}
        title="Booking Details"
        size="md"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            {extra?.status_updated_at && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Last changed {extra.status_updated_by ? `by ${extra.status_updated_by} ` : ''}
                on {new Date(extra.status_updated_at).toLocaleString()}
                {extra.status_reason ? ` — "${extra.status_reason}"` : ''}
              </p>
            )}

            {/* Amount summary */}
            <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 p-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {selected.status === 'payment_submitted' ? 'Amount to verify' : 'Total Amount'}
              </span>
              <span className="text-xl font-black text-teal-700">
                ₱{selected.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Payment details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">
                Payment Details
              </div>

              {(selected as any).paymentReference && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Reference Number
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-teal-700">
                      {(selected as any).paymentReference}
                    </p>
                  </div>
                  <button
                    onClick={() => copyReference((selected as any).paymentReference || '')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500 hover:border-teal-400 hover:text-teal-600 active:scale-95 transition"
                    aria-label="Copy payment reference number"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}

              {selected.paymentScreenshot ? (
                <button
                  type="button"
                  onClick={() => setShowScreenshot(true)}
                  className="group relative block w-full"
                  aria-label="Enlarge payment screenshot"
                >
                  <img
                    src={selected.paymentScreenshot}
                    alt="Payment proof"
                    className="rounded-lg max-h-48 w-full object-contain bg-white border border-slate-200"
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                    <ZoomIn size={11} /> Click to enlarge
                  </span>
                </button>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-400">
                  <span className="block font-semibold text-slate-600">
                    {selected.status === 'pending_payment' ? 'Awaiting payment' : 'No screenshot'}
                  </span>
                  <span className="block mt-0.5">
                    {selected.status === 'pending_payment'
                      ? "The customer hasn't submitted payment proof yet."
                      : 'The customer submitted a reference number only.'}
                  </span>
                  {selected.status === 'pending_payment' && deadline && (
                    <span className="block mt-1.5">
                      Pay by {new Date(deadline).toLocaleString()} ·{' '}
                      <span className="font-semibold text-amber-600">{timeLeft(deadline)}</span>
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Customer + booking */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 col-span-2">
                <div className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-wider">
                  Customer
                </div>
                <div className="text-slate-800 font-bold text-sm">{selected.customerName}</div>
                {(selected as any).customerEmail && (
                  <a
                    href={`mailto:${(selected as any).customerEmail}`}
                    className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600"
                  >
                    <Mail size={12} /> {(selected as any).customerEmail}
                  </a>
                )}
                {(selected as any).customerPhone && (
                  <a
                    href={`tel:${(selected as any).customerPhone}`}
                    className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600"
                  >
                    <Phone size={12} /> {(selected as any).customerPhone}
                  </a>
                )}
              </div>

              {[
                ['Reference', selected.referenceCode],
                ['Game Date', selected.date],
                ['Time', getTimeRange(selected.slots)],
                [
                  'Booked On',
                  new Date(selected.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) +
                    ' ' +
                    new Date(selected.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                ],
                ['Duration', calculateDuration(selected.slots)],
                ['Notes', selected.notes || '—'],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="text-slate-400 text-xs mb-0.5">{k}</div>
                  <div className="text-slate-800 font-medium text-xs">{v}</div>
                </div>
              ))}
            </div>

            {/* Sticky actions bar */}
            <div className="sticky bottom-0 -mx-1 border-t border-slate-200 bg-white px-1 pb-1 pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Actions
              </p>

              {modalActions.length > 0 && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {modalActions.map((action) => {
                    const notYet = action.requiresStarted && toDay(selected.date) > todayStr;
                    return (
                      <div key={action.to + action.label} className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant={variantToButton[action.variant]}
                          disabled={updatingStatus !== null || !!notYet}
                          onClick={() => runAction(selected, action)}
                        >
                          {action.icon}
                          <span className="ml-1.5">{action.label}</span>
                        </Button>
                        <p className="text-[11px] leading-snug text-slate-400">
                          {notYet
                            ? 'Not available yet — this booking is in the future.'
                            : action.helper}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {hiddenAdminOnly && (
                <p className="mt-3 text-xs text-slate-400">
                  Refunds can only be recorded by an admin.
                </p>
              )}

              {TERMINAL_STATUSES.includes(selected.status) && (
                <p className="text-xs text-slate-400">
                  This booking is{' '}
                  <span className="font-semibold text-slate-700">
                    {selected.status.replace(/_/g, ' ')}
                  </span>{' '}
                  and can&apos;t be changed.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* CONFIRM ACTION DIALOG                                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {pendingAction && (
          <Modal
            open={!!pendingAction}
            onClose={() => setPendingAction(null)}
            title={pendingAction.action.confirm?.title || 'Are you sure?'}
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{pendingAction.action.confirm?.message}</p>
              <p className="text-xs text-slate-400">
                Booking{' '}
                <span className="font-mono font-bold text-teal-600">
                  {pendingAction.booking.referenceCode}
                </span>{' '}
                · {pendingAction.booking.customerName || 'Unknown'}
              </p>

              {pendingAction.action.confirm?.askReason && (
                <div>
                  <label
                    htmlFor="action-reason"
                    className="mb-1 block text-xs font-semibold text-slate-500"
                  >
                    Reason (optional)
                  </label>
                  <textarea
                    id="action-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Shown in the booking history"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPendingAction(null)}>
                  Go back
                </Button>
                <Button
                  variant={variantToButton[pendingAction.action.variant]}
                  size="sm"
                  onClick={confirmPending}
                >
                  {pendingAction.action.confirm?.confirmLabel || 'Confirm'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SCREENSHOT LIGHTBOX                                          */}
      {/* ============================================================ */}
      {showScreenshot && selected?.paymentScreenshot && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowScreenshot(false)}
          role="dialog"
          aria-label="Payment screenshot enlarged"
        >
          <button
            onClick={() => setShowScreenshot(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <img
            src={selected.paymentScreenshot}
            alt="Payment proof enlarged"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <AdminCreateBooking
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchAllBookings}
      />
    </div>
  );
}
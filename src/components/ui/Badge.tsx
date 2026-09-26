import type { ReactNode } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Hourglass,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import type { BookingStatus } from '../../types';

interface StatusConfig {
  label: string;
  className: string;
  icon: ReactNode;
}

const statusMap: Record<BookingStatus, StatusConfig> = {
  pending_payment: {
    label: 'Awaiting Payment',
    className: 'bg-amber-50 text-amber-800 border-amber-200/80',
    icon: <Clock size={11} className="text-amber-600 shrink-0" />,
  },
  payment_submitted: {
    label: 'Under Review',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: <Hourglass size={11} className="text-blue-600 shrink-0" />,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    icon: <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />,
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <CalendarCheck size={11} className="text-slate-500 shrink-0" />,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: <XCircle size={11} className="text-rose-600 shrink-0" />,
  },
  expired: {
    label: 'Expired',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: <AlertCircle size={11} className="text-slate-400 shrink-0" />,
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-purple-50 text-purple-700 border-purple-200/80',
    icon: <RotateCcw size={11} className="text-purple-600 shrink-0" />,
  },
};

export function StatusBadge({
  status,
  showIcon = true,
}: {
  status: BookingStatus;
  showIcon?: boolean;
}) {
  const config = statusMap[status] || {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase shadow-2xs whitespace-nowrap ${config.className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export function TypeBadge({
  type,
  label,
}: {
  type: 'indoor' | 'outdoor';
  label?: string;
}) {
  const isIndoor = type === 'indoor';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide shadow-2xs whitespace-nowrap ${
        isIndoor
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isIndoor ? 'bg-indigo-500' : 'bg-emerald-500'
        }`}
      />
      <span>{label || (isIndoor ? 'Covered Indoor' : 'Outdoor Court')}</span>
    </span>
  );
}
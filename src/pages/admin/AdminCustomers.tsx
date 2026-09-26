import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminCustomers() {
  const { bookings, isLoading, fetchAllBookings } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone?: string;
      totalBookings: number;
      lastBooking: string;
    }
  >();

  bookings.forEach((b) => {
    const existing = customerMap.get(b.customerEmail);
    if (existing) {
      existing.totalBookings++;
      if (b.date > existing.lastBooking) existing.lastBooking = b.date;
    } else {
      customerMap.set(b.customerEmail, {
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
        totalBookings: 1,
        lastBooking: b.date,
      });
    }
  });

  const customers = Array.from(customerMap.values()).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-5 max-w-4xl pb-24 sm:pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Aggregated player profiles, reservation frequency, and contact records.
          </p>
        </div>

        <span className="self-start sm:self-auto rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-700">
          {customers.length} Registered Players
        </span>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:max-w-xs">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} className="text-slate-400" />}
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs sm:text-sm">
          <Users className="mx-auto mb-2 h-8 w-8 opacity-30 text-teal-600" />
          <p className="font-semibold text-slate-700">No customers found</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {search ? 'Try adjusting your search query.' : 'Customers will appear once court reservations are made.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Feed (< sm viewports) */}
          <div className="space-y-3 sm:hidden">
            {customers.map((c, i) => (
              <motion.div
                key={c.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
                      {c.name ? c.name.charAt(0).toUpperCase() : <User size={14} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        Last played:{' '}
                        {new Date(c.lastBooking + 'T12:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    <Trophy size={11} className="text-amber-500 fill-amber-500" />
                    {c.totalBookings} {c.totalBookings === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-xs">
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-teal-600 truncate"
                  >
                    <Mail size={13} className="text-teal-600 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </a>

                  {c.phone ? (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-semibold"
                    >
                      <Phone size={13} className="text-teal-600 shrink-0" />
                      <span>{c.phone}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={13} className="shrink-0 opacity-40" />
                      <span>No phone provided</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Clean Data Table (>= sm viewports) */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Player</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Phone Number</th>
                    <th className="py-3 px-4 font-bold text-center">Total Runs</th>
                    <th className="py-3 px-4 font-bold text-right">Most Recent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c, i) => (
                    <motion.tr
                      key={c.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
                            {c.name ? c.name.charAt(0).toUpperCase() : <User size={13} />}
                          </div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-medium">
                        <a href={`mailto:${c.email}`} className="hover:text-teal-600 transition-colors">
                          {c.email}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} className="hover:text-teal-600 font-medium transition-colors">
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                          {c.totalBookings}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-500">
                        {new Date(c.lastBooking + 'T12:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminCustomers() {
  const { bookings, isLoading, fetchAllBookings } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAllBookings(); }, []);

  const customerMap = new Map<string, { name: string; email: string; phone?: string; totalBookings: number; lastBooking: string }>();
  bookings.forEach(b => {
    const existing = customerMap.get(b.customerEmail);
    if (existing) { existing.totalBookings++; if (b.date > existing.lastBooking) existing.lastBooking = b.date; }
    else { customerMap.set(b.customerEmail, { name: b.customerName, email: b.customerEmail, phone: b.customerPhone, totalBookings: 1, lastBooking: b.date }); }
  });

  const customers = Array.from(customerMap.values()).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Customers</h1>
        <p className="text-slate-500 text-sm mt-1">{customers.length} unique customers from bookings</p>
      </div>

      <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={16} />} className="max-w-xs" />

      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs">
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Phone</th>
                  <th className="text-left p-4 font-semibold">Bookings</th>
                  <th className="text-left p-4 font-semibold">Last Booking</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <motion.tr key={c.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-800 font-medium">{c.name}</td>
                    <td className="p-4 text-slate-500">{c.email}</td>
                    <td className="p-4 text-slate-500">{c.phone || '—'}</td>
                    <td className="p-4 text-slate-600">{c.totalBookings}</td>
                    <td className="p-4 text-slate-500">{new Date(c.lastBooking + 'T12:00:00').toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
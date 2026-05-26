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

  // Extract unique customers from bookings
  const customerMap = new Map<string, { name: string; email: string; phone?: string; totalBookings: number; lastBooking: string }>();
  bookings.forEach(b => {
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

  const customers = Array.from(customerMap.values()).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Customers</h1>
        <p className="text-white/50 text-sm mt-1">{customers.length} unique customers from bookings</p>
      </div>

      <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={16} />} className="max-w-xs" />

      {isLoading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/40 text-xs">
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
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 text-white/80 font-medium">{c.name}</td>
                    <td className="p-4 text-white/50">{c.email}</td>
                    <td className="p-4 text-white/50">{c.phone || '—'}</td>
                    <td className="p-4 text-white/70">{c.totalBookings}</td>
                    <td className="p-4 text-white/50">{new Date(c.lastBooking + 'T12:00:00').toLocaleDateString()}</td>
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
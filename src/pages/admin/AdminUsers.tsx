import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { TierBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminUsers() {
  const { users, isLoading, fetchUsers, manageUser } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (id: string, currentStatus: 'active' | 'suspended') => {
    try {
      await manageUser(id, { status: currentStatus === 'active' ? 'suspended' : 'active' });
      toast.success(`User ${currentStatus === 'active' ? 'suspended' : 'activated'}`);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">User Management</h1>
        <p className="text-white/50 text-sm mt-1">{filtered.length} users</p>
      </div>

      <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={16} />} className="max-w-xs" />

      {isLoading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/40 text-xs">
                  <th className="text-left p-4 font-semibold">Player</th>
                  <th className="text-left p-4 font-semibold">Membership</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                  <th className="text-left p-4 font-semibold">Bookings</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-bold text-sm shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white/80 font-medium">{u.name}</div>
                          <div className="text-white/40 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><TierBadge tier={u.membershipTier} /></td>
                    <td className="p-4 text-white/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-white/70">{u.bookingsCount}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${u.status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-800/30' : 'bg-red-900/30 text-red-400 border border-red-800/30'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => handleToggle(u.id, u.status)}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </td>
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

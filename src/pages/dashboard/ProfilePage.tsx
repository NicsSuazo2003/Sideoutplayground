import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-white/50 text-sm mt-1">Manage your account details</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7CFC00]/20 flex items-center justify-center text-[#7CFC00] font-black text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold text-lg">{user?.name}</div>
            <div className="text-white/50 text-sm">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} leftIcon={<User size={16} />} />
          <Input label="Email Address" type="email" value={form.email} onChange={set('email')} leftIcon={<Mail size={16} />} disabled />
          <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} leftIcon={<Phone size={16} />} />

          <div className="pt-2">
            <Button variant="neon" loading={saving} type="submit">Save Changes</Button>
          </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Lock size={16} className="text-white/50" /> Change Password
        </h2>
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" leftIcon={<Lock size={16} />} />
          <Input label="New Password" type="password" placeholder="Min 6 characters" leftIcon={<Lock size={16} />} />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password" leftIcon={<Lock size={16} />} />
          <Button variant="outline" onClick={() => toast.success('Password changed!')}>Update Password</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-red-900/30">
        <h2 className="text-red-400 font-bold mb-2 flex items-center gap-2">
          <Trash2 size={16} /> Danger Zone
        </h2>
        <p className="text-white/50 text-sm mb-4">Once you delete your account, there is no going back. All your bookings and data will be permanently removed.</p>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
      </motion.div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account" size="sm">
        <p className="text-white/60 text-sm mb-5">This action is permanent and cannot be undone. Are you sure?</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={() => { logout(); setDeleteOpen(false); }}>Yes, Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

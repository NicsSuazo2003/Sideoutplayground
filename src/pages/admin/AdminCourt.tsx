import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminCourt() {
  const { courtSettings, isLoading, fetchCourtSettings, updateCourtSettings } = useAdminStore();
  const [form, setForm] = useState({ name: '', pricePerHour: '', openTime: '', closeTime: '', status: 'active' as 'active' | 'inactive' | 'maintenance', type: 'indoor' as 'indoor' | 'outdoor' });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCourtSettings(); }, []);

  useEffect(() => {
    if (courtSettings) {
      setForm({
        name: courtSettings.name,
        pricePerHour: String(courtSettings.pricePerHour),
        openTime: courtSettings.openTime,
        closeTime: courtSettings.closeTime,
        status: courtSettings.status,
        type: courtSettings.type,
      });
      setAmenities(courtSettings.amenities);
    }
  }, [courtSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCourtSettings({
        name: form.name,
        pricePerHour: parseFloat(form.pricePerHour),
        openTime: form.openTime,
        closeTime: form.closeTime,
        status: form.status,
        type: form.type,
        indoor: form.type === 'indoor',
        amenities,
      });
      toast.success('Court settings updated!');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !courtSettings) return <LoadingSpinner />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Court Settings</h1>
        <p className="text-white/50 text-sm mt-1">Manage Side Out Arena configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {courtSettings && (
          <div className="relative rounded-xl overflow-hidden h-40 mb-6">
            <img src={courtSettings.imageUrl} alt="Court" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white text-sm font-semibold">{courtSettings.name}</div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Court Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Price per Hour ($)" type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
            <Input label="Open Time" type="time" value={form.openTime} onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))} />
            <Input label="Close Time" type="time" value={form.closeTime} onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/80 block mb-1.5">Court Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'indoor' | 'outdoor' }))}
                className="w-full input-glass rounded-xl px-4 py-2.5 text-sm">
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' | 'maintenance' }))}
                className="w-full input-glass rounded-xl px-4 py-2.5 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities.map(a => (
                <span key={a} className="flex items-center gap-1.5 text-xs bg-[#7CFC00]/10 text-[#7CFC00] border border-[#7CFC00]/20 rounded-full px-3 py-1">
                  {a}
                  <button type="button" onClick={() => setAmenities(prev => prev.filter(x => x !== a))} className="text-[#7CFC00]/60 hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newAmenity.trim()) { setAmenities(p => [...p, newAmenity.trim()]); setNewAmenity(''); } } }}
                placeholder="Add amenity..."
                className="input-glass flex-1 rounded-xl px-4 py-2 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (newAmenity.trim()) { setAmenities(p => [...p, newAmenity.trim()]); setNewAmenity(''); } }}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <Button variant="neon" type="submit" loading={saving}>Save Changes</Button>
        </form>
      </motion.div>
    </div>
  );
}

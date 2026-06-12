import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, ImagePlus, Trash2, Star, Upload, Calendar, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../stores/adminStore';
import { uploadImage, deleteImage } from '../../services/fileService';
import { getBlockedDates, addBlockedDate, deleteBlockedDate } from '../../services/courtService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { BlockedDate } from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5154';

function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export function AdminCourt() {
  const { courtSettings, isLoading, fetchCourtSettings, updateCourtSettings } = useAdminStore();
  const [form, setForm] = useState({ name: '', pricePerHour: '', openTime: '', closeTime: '', status: 'active' as 'active' | 'inactive' | 'maintenance', type: 'indoor' as 'indoor' | 'outdoor' });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  useEffect(() => { fetchCourtSettings(); getBlockedDates().then(setBlockedDates).catch(() => {}); }, []);

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
      const allImages = courtSettings.images?.length
        ? courtSettings.images
        : courtSettings.imageUrl ? [courtSettings.imageUrl] : [];
      setImages(allImages);
    }
  }, [courtSettings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImages(prev => [...prev, url]);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (url.includes('/images/courts/') || url.includes('supabase')) {
      try { await deleteImage(url); } catch { /* ignore */ }
    }
    setImages(prev => prev.filter(i => i !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCourtSettings({
        name: form.name, pricePerHour: parseFloat(form.pricePerHour),
        openTime: form.openTime, closeTime: form.closeTime,
        status: form.status, type: form.type, indoor: form.type === 'indoor',
        amenities, imageUrl: images[0] || '', images: images,
      });
      toast.success('Court settings updated!');
    } catch { toast.error('Failed to update settings'); }
    finally { setSaving(false); }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) { toast.error('Pick a date'); return; }
    try {
      const bd = await addBlockedDate({
        date: newBlockDate,
        startTime: newBlockStart || undefined,
        endTime: newBlockEnd || undefined,
        reason: newBlockReason || undefined,
      });
      setBlockedDates(prev => [...prev, bd]);
      setNewBlockDate(''); setNewBlockStart(''); setNewBlockEnd(''); setNewBlockReason('');
      toast.success('Date blocked');
    } catch { toast.error('Failed to block date'); }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      await deleteBlockedDate(id);
      setBlockedDates(prev => prev.filter(b => b.id !== id));
      toast.success('Block removed');
    } catch { toast.error('Failed to remove block'); }
  };

  if (isLoading && !courtSettings) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Court Settings</h1>
        <p className="text-white/50 text-sm mt-1">Manage images, blocked dates, and court details</p>
      </div>

      {/* ===== IMAGES ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ImagePlus size={18} className="text-[#7CFC00]" />
          <h2 className="text-white font-bold">Court Images</h2>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {images.map((url, idx) => (
              <div key={url} className="relative group rounded-xl overflow-hidden aspect-video">
                <img src={getImageUrl(url)} alt={`Court ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button type="button" onClick={() => handleDeleteImage(url)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#7CFC00] text-black text-[10px] font-bold flex items-center gap-1">
                      <Star size={10} /> Main
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-6 text-center text-white/40 text-sm mb-3">No images added yet</div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} loading={uploading}>
          <Upload size={14} /> Upload Image
        </Button>
      </motion.div>

      {/* ===== BLOCKED DATES ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[#FF1493]" />
          <h2 className="text-white font-bold">Blocked Dates</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {blockedDates.length === 0 && <span className="text-white/40 text-xs">No blocked dates</span>}
          {blockedDates.map(bd => (
            <span key={bd.id} className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-3 py-1">
              {new Date(bd.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {bd.startTime ? ` ${bd.startTime}-${bd.endTime}` : ' All Day'}
              {bd.reason && ` (${bd.reason})`}
              <button type="button" onClick={() => handleDeleteBlockedDate(bd.id)} className="text-red-400 hover:text-red-300"><X size={11} /></button>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <div><label className="text-[10px] text-white/40 block mb-0.5">Date *</label><input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} className="input-glass rounded-xl px-3 py-2 text-sm w-full" /></div>
          <div><label className="text-[10px] text-white/40 block mb-0.5">Start (opt)</label><input type="time" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)} className="input-glass rounded-xl px-3 py-2 text-sm w-full" /></div>
          <div><label className="text-[10px] text-white/40 block mb-0.5">End (opt)</label><input type="time" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)} className="input-glass rounded-xl px-3 py-2 text-sm w-full" /></div>
          <div><label className="text-[10px] text-white/40 block mb-0.5">Reason</label><input placeholder="e.g. Holiday" value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} className="input-glass rounded-xl px-3 py-2 text-sm w-full" /></div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddBlockedDate}>
          <Plus size={14} /> Block Date
        </Button>
      </motion.div>

      {/* ===== COURT DETAILS ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-[#7CFC00]" />
          <h2 className="text-white font-bold">Court Details</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Court Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Price per Hour (₱)" type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
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
                  <button type="button" onClick={() => setAmenities(prev => prev.filter(x => x !== a))} className="text-[#7CFC00]/60 hover:text-red-400 transition-colors"><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newAmenity.trim()) { setAmenities(p => [...p, newAmenity.trim()]); setNewAmenity(''); } } }}
                placeholder="Add amenity..." className="input-glass flex-1 rounded-xl px-4 py-2 text-sm" />
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
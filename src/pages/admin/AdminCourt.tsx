import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  ImagePlus,
  Trash2,
  Star,
  Upload,
  Calendar,
  Settings,
  Clock,
  Sparkles,
  Save,
  AlertCircle,
  Building,
} from 'lucide-react';
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
  const [form, setForm] = useState({
    name: '',
    pricePerHour: '',
    openTime: '',
    closeTime: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    type: 'indoor' as 'indoor' | 'outdoor',
  });
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

  useEffect(() => {
    fetchCourtSettings();
    getBlockedDates().then(setBlockedDates).catch(() => {});
  }, [fetchCourtSettings]);

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
      setAmenities(courtSettings.amenities || []);
      const allImages = courtSettings.images?.length
        ? courtSettings.images
        : courtSettings.imageUrl
        ? [courtSettings.imageUrl]
        : [];
      setImages(allImages);
    }
  }, [courtSettings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
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
      try {
        await deleteImage(url);
      } catch {
        // silent catch on network cleanup
      }
    }
    setImages((prev) => prev.filter((i) => i !== url));
  };

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
        imageUrl: images[0] || '',
        images: images,
      });
      toast.success('Court settings updated!');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) {
      toast.error('Pick a date');
      return;
    }
    try {
      const bd = await addBlockedDate({
        date: newBlockDate,
        startTime: newBlockStart || undefined,
        endTime: newBlockEnd || undefined,
        reason: newBlockReason || undefined,
      });
      setBlockedDates((prev) => [...prev, bd]);
      setNewBlockDate('');
      setNewBlockStart('');
      setNewBlockEnd('');
      setNewBlockReason('');
      toast.success('Date blocked');
    } catch {
      toast.error('Failed to block date');
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      await deleteBlockedDate(id);
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      toast.success('Block removed');
    } catch {
      toast.error('Failed to remove block');
    }
  };

  if (isLoading && !courtSettings) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl pb-24 sm:pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Court Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure venue images, hourly rates, amenities, and blackout dates.
        </p>
      </div>

      {/* 1. MEDIA GALLERY MANAGEMENT */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ImagePlus size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Court Photos</h2>
              <p className="text-[11px] text-slate-400">First image serves as default banner</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            leftIcon={<Upload size={13} />}
            className="text-xs font-bold"
          >
            Upload
          </Button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {images.map((url, idx) => (
              <div
                key={url}
                className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-50 shadow-2xs"
              >
                <img
                  src={getImageUrl(url)}
                  alt={`Court media ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Tag */}
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-teal-600/90 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Star size={9} className="fill-current" /> Cover
                  </span>
                )}

                {/* Permanent Delete Trigger for Mobile + Desktop Hover */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(url)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition active:scale-95 shadow-xs sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Delete photo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
            No court images uploaded. Tap "Upload" to select files.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.div>

      {/* 2. BLOCKED DATES & CLOSURES */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Blackout Dates &amp; Maintenance</h2>
            <p className="text-[11px] text-slate-400">Disable time slots for maintenance or holidays</p>
          </div>
        </div>

        {/* Existing Blackout Pills */}
        <div className="flex flex-wrap gap-1.5">
          {blockedDates.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No dates currently blocked.</span>
          ) : (
            blockedDates.map((bd) => (
              <span
                key={bd.id}
                className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 border border-red-200/80 rounded-xl px-2.5 py-1 font-medium shadow-2xs"
              >
                <span>
                  {new Date(bd.date + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {bd.startTime ? ` (${bd.startTime}–${bd.endTime})` : ' · All Day'}
                  {bd.reason ? ` — ${bd.reason}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteBlockedDate(bd.id)}
                  className="p-0.5 text-red-400 hover:text-red-700 active:scale-95 transition"
                  aria-label="Remove block"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Block Form */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Date to Block *
              </label>
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 shadow-2xs focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={!newBlockStart && !newBlockEnd}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewBlockStart('');
                      setNewBlockEnd('');
                    }
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="font-semibold">Block entire day</span>
              </label>
            </div>
          </div>

          {(newBlockStart || newBlockEnd || (!newBlockStart && !newBlockEnd && false)) ? null : (
            (!newBlockStart && !newBlockEnd) ? null : (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newBlockStart}
                    onChange={(e) => setNewBlockStart(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newBlockEnd}
                    onChange={(e) => setNewBlockEnd(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 shadow-2xs"
                  />
                </div>
              </div>
            )
          )}

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Reason (Optional)
            </label>
            <input
              placeholder="e.g. Surface resurfacing, Private Tournament"
              value={newBlockReason}
              onChange={(e) => setNewBlockReason(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 shadow-2xs focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBlockedDate}
            leftIcon={<Plus size={13} />}
            className="w-full sm:w-auto font-bold text-xs"
          >
            Apply Blockout
          </Button>
        </div>
      </motion.div>

      {/* 3. OPERATIONAL SPECIFICATIONS & AMENITIES */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Settings size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Court Configuration</h2>
            <p className="text-[11px] text-slate-400">Pricing, schedule times, and facility tags</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Facility / Court Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Standard Hourly Rate (₱)"
              type="number"
              value={form.pricePerHour}
              onChange={(e) => setForm((f) => ({ ...f, pricePerHour: e.target.value }))}
            />
            <Input
              label="Opening Time"
              type="time"
              value={form.openTime}
              onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
            />
            <Input
              label="Closing Time"
              type="time"
              value={form.closeTime}
              onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Court Atmosphere
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as 'indoor' | 'outdoor' }))
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="indoor">Indoor (Covered)</option>
                <option value="outdoor">Outdoor (Open Air)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Operational Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as 'active' | 'inactive' | 'maintenance',
                  }))
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="active">Active (Available for Booking)</option>
                <option value="inactive">Inactive (Hidden from Booking)</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Amenities Manager */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Available Amenities
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 border border-teal-200/80 rounded-xl px-2.5 py-1 font-medium shadow-2xs"
                >
                  <span>{a}</span>
                  <button
                    type="button"
                    onClick={() => setAmenities((prev) => prev.filter((x) => x !== a))}
                    className="p-0.5 text-teal-400 hover:text-red-500 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newAmenity.trim()) {
                      setAmenities((p) => [...p, newAmenity.trim()]);
                      setNewAmenity('');
                    }
                  }
                }}
                placeholder="Add feature (e.g. WiFi, Water Station)..."
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 flex-1 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newAmenity.trim()) {
                    setAmenities((p) => [...p, newAmenity.trim()]);
                    setNewAmenity('');
                  }
                }}
                leftIcon={<Plus size={13} />}
                className="font-bold text-xs shrink-0"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Desktop Save Action */}
          <div className="hidden sm:block pt-3 border-t border-slate-100">
            <Button
              variant="neon"
              size="md"
              type="submit"
              loading={saving}
              leftIcon={<Save size={15} />}
              className="font-bold shadow-md"
            >
              Save Court Configuration
            </Button>
          </div>

          {/* Mobile Sticky Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
            <Button
              variant="neon"
              size="md"
              type="submit"
              loading={saving}
              leftIcon={<Save size={15} />}
              className="w-full font-bold shadow-md"
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
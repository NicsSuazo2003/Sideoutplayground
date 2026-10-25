import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  ImagePlus,
  Star,
  Search,
  AlertTriangle,
  X,
  PackageX,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getAllMerch,
  createMerch,
  updateMerch,
  deleteMerch,
} from '../../services/merchService';
import { uploadImage, deleteImage } from '../../services/fileService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Merch, MerchCategory } from '../../types';

const CATEGORIES: MerchCategory[] = ['paddle', 'ball', 'apparel', 'accessory', 'other'];

interface FormState {
  id?: string;
  name: string;
  description: string;
  category: MerchCategory;
  price: string;
  sku: string;
  stock: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  category: 'accessory',
  price: '',
  sku: '',
  stock: '',
  imageUrl: '',
  images: [],
  isActive: true,
  isFeatured: false,
});

export function AdminMerch() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Merch | null>(null);

  const primaryFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await getAllMerch());
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (m: Merch) => {
    setForm({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      price: String(m.price),
      sku: m.sku ?? '',
      stock: m.stock !== null && m.stock !== undefined ? String(m.stock) : '',
      imageUrl: m.imageUrl,
      images: m.images ?? [],
      isActive: m.isActive,
      isFeatured: m.isFeatured,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm());
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Cover image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (primaryFileRef.current) primaryFileRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
      toast.success('Gallery image added');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (galleryFileRef.current) galleryFileRef.current.value = '';
    }
  };

  const removeGalleryImage = async (url: string) => {
    if (url.startsWith('http') && url.includes('supabase')) {
      try {
        await deleteImage(url);
      } catch {
        // silent
      }
    }
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.price || parseFloat(form.price) <= 0) return toast.error('Valid price required');
    if (!form.imageUrl) return toast.error('Cover image is required');

    setSaving(true);
    try {
      const payload: Partial<Merch> = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: parseFloat(form.price),
        sku: form.sku.trim() || null,
        stock: form.stock === '' ? null : parseInt(form.stock, 10),
        imageUrl: form.imageUrl,
        images: form.images,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      if (form.id) {
        await updateMerch(form.id, payload);
        toast.success('Product updated');
      } else {
        await createMerch(payload);
        toast.success('Product created');
      }
      closeModal();
      fetchItems();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMerch(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = items.filter((m) =>
    !search ? true : m.name.toLowerCase().includes(search.toLowerCase()) || m.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-4 sm:px-6 pb-28">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Merch Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage store inventory, upload photos, and update storefront items.
          </p>
        </div>
        <Button
          variant="neon"
          size="md"
          onClick={openNew}
          leftIcon={<Plus size={16} />}
          className="font-bold text-xs h-11 w-full sm:w-auto shadow-sm"
        >
          New Product
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search product name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <LoadingSpinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <PackageX size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No products found</p>
          <p className="text-xs text-slate-400 mt-1">
            {items.length === 0
              ? 'Click "+ New Product" above to create your first item.'
              : 'Try searching with a different term.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <AnimatePresence>
            {filtered.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative aspect-video sm:aspect-[4/3] bg-slate-100">
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      {m.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                          <Star size={9} className="fill-current" />
                          Featured
                        </span>
                      )}
                      {!m.isActive && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-1">
                      <span>{m.category}</span>
                      {m.sku && <span className="text-slate-400 font-mono font-normal">#{m.sku}</span>}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate">{m.name}</h3>

                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        ₱{m.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          m.stock === null || m.stock === undefined
                            ? 'bg-slate-100 text-slate-600'
                            : m.stock <= 0
                            ? 'bg-rose-50 text-rose-600 font-bold'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {m.stock === null || m.stock === undefined
                          ? 'Unlimited'
                          : `${m.stock} in stock`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(m)}
                    leftIcon={<Pencil size={13} />}
                    className="flex-1 font-bold text-xs h-9 justify-center"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                    aria-label="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={form.id ? 'Edit Product' : 'New Product'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Product Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Pro Tour Carbon Paddle"
          />

          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Materials, weight, grip dimensions, colors..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as MerchCategory }))
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Price (₱) *"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU (optional)"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="PAD-001"
            />
            <Input
              label="Stock Quantity (empty = unlimited)"
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="e.g. 50"
            />
          </div>

          {/* Cover image upload */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Cover Image *
            </label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                  <img src={form.imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <ImagePlus size={22} />
                </div>
              )}
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => primaryFileRef.current?.click()}
                  loading={uploading}
                  leftIcon={<Upload size={14} />}
                  className="font-bold text-xs h-9"
                >
                  {form.imageUrl ? 'Change photo' : 'Upload photo'}
                </Button>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG, or WebP. 1:1 square recommended.
                </p>
              </div>
              <input
                ref={primaryFileRef}
                type="file"
                accept="image/*"
                onChange={handlePrimaryUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Gallery images */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Extra Photos (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url) => (
                <div
                  key={url}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-teal-500 hover:text-teal-600 transition"
              >
                <Plus size={18} />
              </button>
            </div>
            <input
              ref={galleryFileRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-700">Feature on homepage</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-700">Publicly visible</span>
            </label>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={closeModal} className="h-11">
              Cancel
            </Button>
            <Button variant="neon" size="md" type="submit" loading={saving} className="font-bold h-11">
              {form.id ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900">{deleteTarget?.name}</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Are you sure? This item will be removed permanently.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Keep
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="font-bold">
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
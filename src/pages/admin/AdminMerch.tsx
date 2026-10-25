import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  ImagePlus,
  Star,
  Search,
  Package,
  AlertTriangle,
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
      toast.success('Gallery image uploaded');
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
    !search ? true : m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-6xl pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Merch Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish paddles, balls, apparel, and accessories to the public Shop page.
          </p>
        </div>
        <Button
          variant="neon"
          size="sm"
          onClick={openNew}
          leftIcon={<Plus size={15} />}
          className="font-bold text-xs shadow-xs self-start sm:self-auto"
        >
          New Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs sm:text-sm">
          {items.length === 0
            ? 'No products yet. Tap "New Product" to add the first one.'
            : 'No products match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {m.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Star size={9} className="fill-current" />
                      Featured
                    </span>
                  )}
                  {!m.isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/85 text-white text-[10px] font-black uppercase tracking-wider">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3.5 sm:p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  {m.category}
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate mt-0.5">{m.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    ₱{m.price.toLocaleString()}
                  </span>
                  {m.stock !== null && m.stock !== undefined && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {m.stock} in stock
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(m)}
                    leftIcon={<Pencil size={13} />}
                    className="flex-1 font-bold text-xs"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="p-2 text-slate-400 hover:text-rose-600 active:scale-95 transition"
                    aria-label="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={form.id ? 'Edit Product' : 'New Product'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Pro Paddle X1"
          />

          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Materials, sizes, colors, what makes it great…"
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
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
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
              placeholder="e.g. PAD-X1-BLK"
            />
            <Input
              label="Stock (empty = unlimited)"
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="e.g. 25"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Cover Image *
            </label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={form.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    className="absolute top-1 right-1 p-1 rounded-md bg-red-600/90 text-white hover:bg-red-700 transition"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
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
                  leftIcon={<Upload size={13} />}
                  className="font-bold text-xs"
                >
                  {form.imageUrl ? 'Replace cover' : 'Upload cover'}
                </Button>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  JPEG, PNG, WebP, or GIF. Max 5MB.
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

          {/* Gallery */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
              Gallery Images (optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url) => (
                <div
                  key={url}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group"
                >
                  <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-600 transition"
                aria-label="Add gallery image"
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
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>Featured on Shop</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>Visible to public</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="neon" size="md" type="submit" loading={saving} className="font-bold">
              {form.id ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900">
                {deleteTarget?.name}
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                This will permanently remove the product from the shop. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="font-bold">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
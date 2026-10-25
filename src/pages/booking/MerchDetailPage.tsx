import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  MapPin,
  Truck,
  Package,
} from 'lucide-react';
import { getMerch } from '../../services/merchService';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Merch } from '../../types';

export function MerchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    getMerch(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Package size={40} className="mx-auto text-slate-300 mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Product not found</h1>
          <p className="text-sm text-slate-500 mt-1">This item may have been removed.</p>
          <Link to="/merch" className="inline-block mt-5">
            <Button variant="neon" size="sm" leftIcon={<ArrowLeft size={14} />} className="font-bold">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const gallery = [item.imageUrl, ...item.images].filter(Boolean);
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link
          to="/merch"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition mb-4"
        >
          <ArrowLeft size={14} />
          Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6 sm:gap-10 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs"
        >
          {/* Gallery */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={gallery[activeImage]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.isFeatured && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 text-amber-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                  <Sparkles size={11} className="fill-current" />
                  Featured
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      i === activeImage
                        ? 'border-teal-600 shadow-sm'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={g} alt={`${item.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1.5">
              {item.category}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {item.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ₱{item.price.toLocaleString()}
              </span>
              {item.stock !== null && item.stock !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    outOfStock
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.stock <= 5
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {outOfStock ? 'Out of stock' : `${item.stock} in stock`}
                </span>
              )}
            </div>

            {item.sku && (
              <div className="text-[11px] text-slate-400 font-mono mt-2">SKU: {item.sku}</div>
            )}

            <p className="mt-5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {/* Inquiry card */}
            <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <MessageCircle size={15} />
                How to order
              </div>
              <p className="text-xs text-teal-900/80 leading-relaxed">
                Visit the Side Out front desk or message us on Facebook to reserve this item.
                Pay on pickup — cash or GCash.
              </p>
            </div>

            {/* Trust rows */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                <MapPin size={14} className="text-teal-600 shrink-0" />
                <span className="truncate">Pickup at court</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                <Truck size={14} className="text-teal-600 shrink-0" />
                <span className="truncate">Local delivery available</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 sm:mt-auto sm:pt-6">
             <a
  href="https://www.facebook.com/profile.php?id=61590081072189"
  target="_blank"
  rel="noreferrer"
  className="block"
>
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full font-bold shadow-md"
                  leftIcon={<ShoppingBag size={17} />}
                >
                  Inquire / Reserve
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
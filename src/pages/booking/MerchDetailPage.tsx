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
  ShieldCheck,
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
      <div className="min-h-screen py-24 flex justify-center items-center">
        <LoadingSpinner size={36} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <Package size={44} className="mx-auto text-slate-300 mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Product Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            This item may be out of stock or removed.
          </p>
          <Link to="/merch" className="inline-block mt-5">
            <Button variant="neon" size="sm" leftIcon={<ArrowLeft size={14} />} className="font-bold">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const gallery = [item.imageUrl, ...(item.images || [])].filter(Boolean);
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-28 sm:pt-24 sm:pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Navigation */}
        <Link
          to="/merch"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 py-2 transition"
        >
          <ArrowLeft size={15} />
          Back to Shop
        </Link>

        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 grid md:grid-cols-2 gap-6 sm:gap-10 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs"
        >
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={gallery[activeImage]}
                alt={item.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {item.isFeatured && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <Sparkles size={11} className="fill-current" />
                  Featured
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? 'border-teal-600 scale-95 shadow-xs'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                {item.category}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {item.name}
              </h1>

              {/* Price & Stock Badge */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₱{item.price.toLocaleString()}
                </span>
                {item.stock !== null && item.stock !== undefined && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      outOfStock
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.stock <= 5
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {outOfStock ? 'Out of stock' : `${item.stock} available`}
                  </span>
                )}
              </div>

              {item.sku && (
                <p className="text-[11px] text-slate-400 font-mono mt-1">SKU: {item.sku}</p>
              )}

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
                {item.description}
              </p>

              {/* Instructions Box */}
              <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
                  <MessageCircle size={15} />
                  How Reservation Works
                </div>
                <p className="text-[11px] sm:text-xs text-teal-900/80 leading-relaxed">
                  Message us directly to reserve your item. Pick up and pay in cash or via GCash at the court front desk.
                </p>
              </div>

              {/* Badges */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                  <MapPin size={14} className="text-teal-600 shrink-0" />
                  <span>Court Pickup</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                  <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                  <span>Verified Gear</span>
                </div>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden sm:block mt-8 pt-4 border-t border-slate-100">
              <a
                href="https://www.facebook.com/profile.php?id=61590081072189"
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full h-12 font-bold shadow-md justify-center"
                  leftIcon={<ShoppingBag size={18} />}
                >
                  Inquire / Reserve on Messenger
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sticky Floating CTA Bar */}
      <div className="fixed sm:hidden bottom-0 inset-x-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
            <div className="text-base font-black text-slate-900">₱{item.price.toLocaleString()}</div>
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61590081072189"
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button
              variant="neon"
              size="md"
              className="w-full h-11 font-bold text-xs justify-center shadow-sm"
              leftIcon={<ShoppingBag size={15} />}
            >
              Inquire / Reserve
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
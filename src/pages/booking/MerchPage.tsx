import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Sparkles, Package, ChevronRight, X } from 'lucide-react';
import { getActiveMerch } from '../../services/merchService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Merch, MerchCategory } from '../../types';

const CATEGORIES: { value: MerchCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'paddle', label: 'Paddles' },
  { value: 'ball', label: 'Balls' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export function MerchPage() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MerchCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActiveMerch()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((m) => {
    if (category !== 'all' && m.category !== category) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <ShoppingBag size={13} className="text-teal-600" />
            Side Out Store
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Court Gear &amp; Apparel
          </h1>
          <p className="text-slate-600 mt-2 text-xs sm:text-base leading-relaxed">
            Reserve through our desk or pickup directly at the courts.
          </p>
        </div>

        {/* Search & Horizontal Touch Filters */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="relative max-w-md mx-auto sm:max-w-none">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search paddles, bags, grips…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mobile Horizontal Carousel */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto flex gap-2 no-scrollbar py-1">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    active
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Package size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No gear matches your search</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Try choosing another category or clearing search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            <AnimatePresence>
              {filtered.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Link
                    to={`/merch/${m.id}`}
                    className="group flex flex-col h-full bg-white border border-slate-200/80 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-teal-950/5 active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {m.isFeatured && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                          <Sparkles size={10} className="fill-current" />
                          Featured
                        </span>
                      )}
                      {m.stock !== null && m.stock !== undefined && m.stock <= 0 && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                          {m.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-teal-700 transition-colors">
                          {m.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                          {m.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                          ₱{m.price.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                          View
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Sparkles, Package, ChevronRight } from 'lucide-react';
import { getActiveMerch } from '../../services/merchService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Merch, MerchCategory } from '../../types';

const CATEGORIES: { value: MerchCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paddle', label: 'Paddles' },
  { value: 'ball', label: 'Balls' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <ShoppingBag size={13} className="text-teal-600" />
            Side Out Shop
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Court Gear &amp; Merch
          </h1>
          <p className="text-slate-500 mt-2 text-xs sm:text-base max-w-md mx-auto leading-relaxed">
            Paddles, balls, apparel, and accessories — curated by the Side Out team.
            Inquire at the front desk to reserve any item.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    active
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-2xl sm:rounded-3xl shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Package size={22} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
              {search || category !== 'all'
                ? 'Try adjusting your filters or search.'
                : 'The shop is empty right now. Check back soon!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filtered.map((m) => (
              <motion.div key={m.id} variants={itemVariants}>
                <Link
                  to={`/merch/${m.id}`}
                  className="group block bg-white border border-slate-200/80 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {m.isFeatured && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                        <Sparkles size={10} className="fill-current" />
                        Featured
                      </span>
                    )}
                    {m.stock !== null && m.stock !== undefined && m.stock <= 0 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">
                      {m.category}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-teal-700 transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="text-lg font-black text-slate-900 tracking-tight">
                        ₱{m.price.toLocaleString()}
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-teal-600 group-hover:gap-1.5 transition-all">
                        View
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
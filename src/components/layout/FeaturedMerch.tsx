import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { getActiveMerch } from '../../services/merchService';
import { Button } from '../ui/Button';
import type { Merch } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function FeaturedMerch() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveMerch()
      .then((all) => {
        const featured = all.filter((m) => m.isFeatured);
        const rest = all.filter((m) => !m.isFeatured);
        setItems([...featured, ...rest].slice(0, 4));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/50 text-[11px] font-bold uppercase tracking-wider text-teal-700">
              <ShoppingBag size={12} className="text-teal-600" />
              Side Out Shop
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Gear Up Before You Play
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
              Paddles, balls, and apparel — curated by the Side Out team. Reserve at the front desk or order online.
            </p>
          </div>
          
          <Link
            to="/merch"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 hover:gap-2.5 transition-all"
          >
            Browse the full shop
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
        >
          {items.map((m) => (
            <motion.div key={m.id} variants={itemVariants}>
              <Link
                to={`/merch/${m.id}`}
                className="group flex flex-col h-full bg-white border border-slate-200/80 hover:border-teal-500/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-teal-950/5 active:scale-[0.98] transition-all duration-200"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {m.isFeatured && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/95 backdrop-blur-xs text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles size={10} className="fill-current" />
                      Featured
                    </span>
                  )}
                  {m.stock !== null && m.stock !== undefined && m.stock <= 0 && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                      Sold out
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      {m.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mt-0.5 group-hover:text-teal-700 transition-colors">
                      {m.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      ₱{m.price.toLocaleString()}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-teal-50 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA Button */}
        <div className="mt-6 sm:hidden">
          <Link to="/merch" className="block">
            <Button
              variant="outline"
              size="md"
              className="w-full h-12 font-bold justify-center"
              leftIcon={<ShoppingBag size={16} />}
            >
              Shop All Merch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
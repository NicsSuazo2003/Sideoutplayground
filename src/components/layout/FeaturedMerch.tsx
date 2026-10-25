import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { getActiveMerch } from '../../services/merchService';
import { Button } from '../ui/Button';
import type { Merch } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedMerch() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveMerch()
      .then((all) => {
        // Prefer featured, then fill up to 4 with newest
        const featured = all.filter((m) => m.isFeatured);
        const rest = all.filter((m) => !m.isFeatured);
        setItems([...featured, ...rest].slice(0, 4));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600">
              <ShoppingBag size={13} />
              Side Out Shop
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
              Gear Up Before You Play
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
              Paddles, balls, and apparel — curated by the Side Out team. Reserve at the
              front desk or order online.
            </p>
          </div>
          <Link
            to="/merch"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 hover:gap-2.5 transition-all"
          >
            Browse the full shop
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {items.map((m) => (
            <motion.div key={m.id} variants={itemVariants}>
              <Link
                to={`/merch/${m.id}`}
                className="group block bg-white border border-slate-200/80 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {m.isFeatured && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles size={9} className="fill-current" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                    {m.category}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5 group-hover:text-teal-700 transition-colors">
                    {m.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-black text-slate-900 tracking-tight">
                      ₱{m.price.toLocaleString()}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <div className="mt-6 sm:hidden">
          <Link to="/merch">
            <Button
              variant="outline"
              size="md"
              className="w-full font-bold"
              leftIcon={<ShoppingBag size={15} />}
            >
              Shop All Merch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
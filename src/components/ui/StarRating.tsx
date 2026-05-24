import { Star } from 'lucide-react';

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
        />
      ))}
      <span className="ml-1.5 text-xs text-white/60">{rating.toFixed(1)}</span>
    </div>
  );
}

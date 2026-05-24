import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { getTournaments } from '../../services/tournamentService';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Tournament, TournamentType } from '../../types';

const typeColors: Record<TournamentType, string> = {
  singles: '#7CFC00',
  doubles: '#FF1493',
  mixed: '#FFD700',
};

export function TournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TournamentType>('all');

  useEffect(() => { getTournaments().then(t => { setTournaments(t); setLoading(false); }); }, []);

  const filtered = filter === 'all' ? tournaments : tournaments.filter(t => t.type === filter);

  return (
    <div className="pt-16 min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-[#FF1493] text-sm font-bold tracking-widest uppercase mb-2">Competition</div>
          <h1 className="text-5xl font-black text-white">Tournaments & Events</h1>
          <p className="text-white/50 mt-3">Compete, win, and claim your spot on the leaderboard</p>
        </motion.div>

        <div className="flex gap-2 justify-center mb-8">
          {(['all', 'singles', 'doubles', 'mixed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-[#7CFC00] text-black' : 'glass text-white/60 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const spotsLeft = t.maxPlayers - t.registeredPlayers.length;
              const color = typeColors[t.type];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="glass-card overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold capitalize px-3 py-1 rounded-full" style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
                        {t.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {spotsLeft < 4 && spotsLeft > 0 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-900/50 text-red-400 border border-red-800/40">
                          {spotsLeft} spots left
                        </span>
                      )}
                      {spotsLeft === 0 && <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white/40">Full</span>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-3">{t.name}</h3>
                    <div className="space-y-1.5 text-xs text-white/50 mb-4">
                      <div className="flex items-center gap-2"><Calendar size={12} className="text-[#7CFC00]" /> {new Date(t.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {t.time}</div>
                      <div className="flex items-center gap-2"><Users size={12} className="text-[#7CFC00]" /> {t.registeredPlayers.length}/{t.maxPlayers} registered</div>
                      <div className="flex items-center gap-2"><DollarSign size={12} className="text-[#7CFC00]" /> ${t.entryFee} entry fee</div>
                    </div>
                    <div className="w-full bg-white/8 rounded-full h-1 mb-4">
                      <div className="h-1 rounded-full transition-all" style={{ width: `${(t.registeredPlayers.length / t.maxPlayers) * 100}%`, background: color }} />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details <ArrowRight size={14} />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

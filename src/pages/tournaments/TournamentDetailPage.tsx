import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, DollarSign, Trophy, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTournamentById, registerForTournament } from '../../services/tournamentService';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Tournament, TournamentType } from '../../types';

const typeColors: Record<TournamentType, string> = { singles: '#7CFC00', doubles: '#FF1493', mixed: '#FFD700' };

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTournamentById(id).then(t => { setTournament(t); setLoading(false); }).catch(() => { toast.error('Tournament not found'); navigate('/tournaments'); });
  }, [id]);

  const isRegistered = tournament?.registeredPlayers.includes(user?.id || '');
  const isFull = tournament ? tournament.registeredPlayers.length >= tournament.maxPlayers : false;

  const handleRegister = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!tournament || !user) return;
    setRegistering(true);
    try {
      const updated = await registerForTournament(tournament.id, user.id);
      setTournament(updated);
      toast.success('Registered successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!tournament) return null;

  const color = typeColors[tournament.type];
  const spotsLeft = tournament.maxPlayers - tournament.registeredPlayers.length;

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-72 overflow-hidden">
        <img src={tournament.imageUrl} alt={tournament.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/60 to-[#0A0A0A]" />
        <button onClick={() => navigate('/tournaments')} className="absolute top-8 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="absolute bottom-6 left-4 right-4">
          <span className="text-xs font-bold capitalize px-3 py-1 rounded-full mb-2 inline-block" style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
            {tournament.type}
          </span>
          <h1 className="text-4xl font-black text-white">{tournament.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-3">About This Tournament</h2>
              <p className="text-white/60 text-sm leading-relaxed">{tournament.description}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-3">Rules</h2>
              <ul className="space-y-2">
                {tournament.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-[#7CFC00] font-bold shrink-0">{i + 1}.</span> {r}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400" /> Prizes
              </h2>
              <ul className="space-y-2">
                {tournament.prizes.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: i === 0 ? '#FFD70020' : i === 1 ? '#C0C0C020' : '#CD7F3220', color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>
                      {i + 1}
                    </span>
                    <span className="text-white/70">{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5 sticky top-24">
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-[#7CFC00]" /><span className="text-white/70">{new Date(tournament.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {tournament.time}</span></div>
                <div className="flex items-center gap-2 text-sm"><DollarSign size={14} className="text-[#7CFC00]" /><span className="text-white/70">${tournament.entryFee} entry fee</span></div>
                <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-[#7CFC00]" /><span className="text-white/70">{tournament.registeredPlayers.length}/{tournament.maxPlayers} registered</span></div>
              </div>

              <div className="w-full bg-white/8 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full" style={{ width: `${(tournament.registeredPlayers.length / tournament.maxPlayers) * 100}%`, background: color }} />
              </div>
              <div className="text-xs text-white/40 mb-5">{isFull ? 'Tournament full' : `${spotsLeft} spots remaining`}</div>

              {isRegistered ? (
                <div className="flex items-center gap-2 p-3 glass rounded-xl text-[#7CFC00] text-sm font-semibold">
                  <CheckCircle2 size={16} /> Registered
                </div>
              ) : (
                <Button variant={isFull ? 'outline' : 'neon'} className="w-full" disabled={isFull} loading={registering} onClick={handleRegister}>
                  {isFull ? 'Tournament Full' : `Register · $${tournament.entryFee}`}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

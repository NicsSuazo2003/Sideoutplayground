import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { getUpcomingSessions } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import type { OpenPlaySession } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function SessionSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 animate-pulse space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-3 w-full sm:w-2/3">
          <div className="h-5 bg-slate-200 rounded-md w-3/4" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2" />
          <div className="h-4 bg-slate-100 rounded-md w-2/3" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-full sm:w-32" />
      </div>
    </div>
  );
}

export function OpenPlayPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<OpenPlaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles size={13} className="text-teal-600" />
            Social Matchmaking
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Open Play Sessions
          </h1>
          <p className="text-slate-500 mt-2 text-xs sm:text-base max-w-md mx-auto leading-relaxed">
            Drop in, meet community players, and split the court with guaranteed rotation.
          </p>
        </div>

        {/* Sessions Feed */}
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-2xl sm:rounded-3xl shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Calendar size={22} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">No sessions scheduled</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
              There are no Open Play runs published for this week. Check back soon!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5 sm:space-y-4"
          >
            {sessions.map((session) => {
              const spotsLeft = session.maxPlayers - session.registeredCount;
              const isFull = spotsLeft <= 0;
              const fillPercentage = Math.min(
                (session.registeredCount / session.maxPlayers) * 100,
                100
              );

              const sessionDate = new Date(session.date + 'T12:00:00');
              const month = sessionDate.toLocaleDateString('en-US', { month: 'short' });
              const day = sessionDate.getDate();
              const weekday = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <motion.div
                  key={session.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="group relative bg-white border border-slate-200/80 hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    
                    {/* Left Info Group */}
                    <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                      
                      {/* Responsive Date Badge */}
                      <div className="flex flex-col items-center justify-center w-12 h-13 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 shrink-0 shadow-2xs">
                        <span className="text-[10px] sm:text-xs font-bold uppercase text-teal-600 tracking-wider">
                          {month}
                        </span>
                        <span className="text-base sm:text-xl font-black leading-tight my-0.5">
                          {day}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase">
                          {weekday}
                        </span>
                      </div>

                      {/* Details Group */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        
                        {/* Title & Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                            {session.title}
                          </h2>

                          {session.isExternalVenue && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-medium border border-indigo-200/60">
                              <ExternalLink size={10} /> Ext
                            </span>
                          )}

                          {isFull ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] sm:text-xs font-bold border border-rose-200/60">
                              <AlertCircle size={10} />
                              {session.waitlistCount > 0 ? 'Waitlist' : 'Full'}
                            </span>
                          ) : spotsLeft <= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] sm:text-xs font-bold border border-amber-300">
                              <Flame size={11} className="text-amber-500 fill-amber-500" />
                              {spotsLeft} left
                            </span>
                          ) : null}
                        </div>

                        {/* Metadata Rows */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-teal-600 shrink-0" />
                            <span>{format12h(session.startTime)} – {format12h(session.endTime)}</span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate max-w-full">
                            <MapPin size={13} className="text-teal-600 shrink-0" />
                            <span className="truncate">
                              {session.isExternalVenue ? session.externalVenueName : session.venue}
                            </span>
                          </div>
                        </div>

                        {/* Progress Capacity Bar */}
                        <div className="pt-1.5 max-w-sm">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <Users size={12} className="text-teal-600" />
                              <span className={isFull ? 'text-rose-600 font-bold' : ''}>
                                {session.registeredCount}/{session.maxPlayers} Joined
                              </span>
                            </span>

                            {session.waitlistCount > 0 && (
                              <span className="text-amber-600 font-semibold text-[10px]">
                                +{session.waitlistCount} waiting
                              </span>
                            )}
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull
                                  ? 'bg-rose-500'
                                  : fillPercentage > 75
                                  ? 'bg-amber-500'
                                  : 'bg-teal-500'
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Price & Register Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0 gap-2 sm:gap-2.5">
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                          ₱{session.pricePerPerson}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                          per player
                        </div>
                      </div>

                      <Button
                        variant={isFull ? 'secondary' : 'neon'}
                        size="sm"
                        disabled={isFull && session.waitlistCount === 0}
                        onClick={() => navigate(`/openplay/register/${session.id}`)}
                        className="w-auto sm:w-28 font-bold text-xs shadow-xs"
                        rightIcon={<ChevronRight size={14} />}
                      >
                        {isFull ? (session.waitlistCount > 0 ? 'Waitlist' : 'Full') : 'Join Run'}
                      </Button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
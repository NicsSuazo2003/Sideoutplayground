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
  CheckCircle2, 
  ExternalLink 
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

// Staggered Animation Configs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Skeleton Placeholder Component
function SessionSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-3 w-full sm:w-2/3">
          <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
          <div className="h-4 bg-slate-100 rounded-md w-2/3"></div>
        </div>
        <div className="h-12 bg-slate-200 rounded-xl w-full sm:w-28"></div>
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
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/50 to-slate-100/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Hero / Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles size={14} className="text-teal-600" />
            Community Matchmaking
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Open Play Sessions
          </h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg max-w-lg mx-auto">
            Drop in, meet local players, and level up your game in organized group sessions.
          </p>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="space-y-4">
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-3xl shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No sessions scheduled</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              We couldn't find any upcoming Open Play sessions right now. Please check back later!
            </p>
          </motion.div>
        ) : (
          /* Sessions List */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {sessions.map(session => {
              const spotsLeft = session.maxPlayers - session.registeredCount;
              const isFull = spotsLeft <= 0;
              const fillPercentage = Math.min((session.registeredCount / session.maxPlayers) * 100, 100);
              
              // Format date objects
              const sessionDate = new Date(session.date + 'T12:00:00');
              const month = sessionDate.toLocaleDateString('en-US', { month: 'short' });
              const day = sessionDate.getDate();
              const weekday = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <motion.div 
                  key={session.id} 
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="group relative bg-white border border-slate-200/80 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    
                    {/* Left Details Group */}
                    <div className="flex items-start gap-4 sm:gap-5 w-full sm:w-auto">
                      
                      {/* Date Badge */}
                      <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 shrink-0">
                        <span className="text-xs font-bold uppercase text-teal-600 tracking-wider">{month}</span>
                        <span className="text-xl font-black leading-none my-0.5">{day}</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">{weekday}</span>
                      </div>

                      {/* Main Info */}
                      <div className="space-y-2 flex-1">
                        
                        {/* Title & Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {session.title}
                          </h2>

                          {session.isExternalVenue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200/60">
                              <ExternalLink size={10} /> External
                            </span>
                          )}

                          {isFull ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/60">
                              <AlertCircle size={10} />
                              {session.waitlistCount > 0 ? 'Waitlist Only' : 'Full'}
                            </span>
                          ) : spotsLeft <= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60">
                              Only {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left!
                            </span>
                          ) : null}
                        </div>

                        {/* Metadata Rows */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-600 pt-0.5">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-teal-600 shrink-0" />
                            <span className="sm:hidden font-medium text-slate-700">{weekday}, {month} {day} • </span>
                            <span>{sessionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-teal-600 shrink-0" />
                            <span>{format12h(session.startTime)} – {format12h(session.endTime)}</span>
                          </div>

                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin size={14} className="text-teal-600 shrink-0" />
                            <span className="truncate">{session.isExternalVenue ? session.externalVenueName : session.venue}</span>
                          </div>
                        </div>

                        {/* Capacity & Progress Bar */}
                        <div className="pt-2 max-w-md">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Users size={13} className="text-teal-600" />
                              <span className={isFull ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                                {session.registeredCount} / {session.maxPlayers} Registered
                              </span>
                            </span>
                            {session.waitlistCount > 0 && (
                              <span className="text-amber-600 font-medium">
                                +{session.waitlistCount} on waitlist
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/50">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull 
                                  ? 'bg-rose-500' 
                                  : fillPercentage > 75 
                                    ? 'bg-gradient-to-r from-teal-500 to-amber-500' 
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                              }`}
                              style={{ width: `${fillPercentage}%` }} 
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Price & Action Column */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 gap-3">
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          ₱{session.pricePerPerson}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          per person
                        </div>
                      </div>

                      <Button 
                        variant={isFull ? "secondary" : "neon"} 
                        size="sm" 
                        disabled={isFull && session.waitlistCount === 0}
                        onClick={() => navigate(`/openplay/register/${session.id}`)}
                        className="w-auto sm:w-full min-w-[120px] justify-center shadow-xs"
                      >
                        {isFull ? (session.waitlistCount > 0 ? 'Waitlist' : 'Full') : 'Register'} 
                        <ArrowRight size={14} className="ml-1" />
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
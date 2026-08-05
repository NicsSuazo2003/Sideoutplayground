import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { getUpcomingSessions } from '../../services/openPlayService';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { OpenPlaySession } from '../../types';

function format12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function OpenPlayPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<OpenPlaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800">Open Play Sessions</h1>
          <p className="text-slate-500 mt-2">Join a group session and meet other players!</p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No upcoming Open Play sessions. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => {
              const spotsLeft = session.maxPlayers - session.registeredCount;
              const isFull = spotsLeft <= 0;
              return (
                <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-slate-800">{session.title}</h2>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-teal-600" />
                        {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} className="text-teal-600" />
                        {format12h(session.startTime)} – {format12h(session.endTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} className="text-teal-600" />
                        {session.isExternalVenue ? session.externalVenueName : session.venue}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-teal-600" />
                        <span className={isFull ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                          {session.registeredCount}/{session.maxPlayers} players
                          {session.waitlistCount > 0 && ` (+${session.waitlistCount} waitlist)`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                        <div className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-teal-600'}`}
                          style={{ width: `${Math.min((session.registeredCount / session.maxPlayers) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-black text-teal-600">₱{session.pricePerPerson}</div>
                      <div className="text-xs text-slate-400">per person</div>
                      <Button variant="neon" size="sm" disabled={isFull}
                        onClick={() => navigate(`/openplay/register/${session.id}`)}>
                        {isFull ? 'Full' : 'Register'} <ArrowRight size={14} />
                      </Button>
                    </div>
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
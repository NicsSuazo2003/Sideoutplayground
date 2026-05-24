import { delay } from './api';
import type { Tournament } from '../types';
import { mockTournaments } from '../mocks/tournaments';

// Replace with real API call: axios.get('/api/tournaments')
export async function getTournaments(): Promise<Tournament[]> {
  await delay(300);
  return [...mockTournaments];
}

// Replace with real API call: axios.get(`/api/tournaments/${id}`)
export async function getTournamentById(id: string): Promise<Tournament> {
  await delay(300);
  const t = mockTournaments.find(t => t.id === id);
  if (!t) throw new Error('Tournament not found');
  return { ...t };
}

// Replace with real API call: axios.post(`/api/tournaments/${id}/register`)
export async function registerForTournament(id: string, userId: string): Promise<Tournament> {
  await delay();
  const idx = mockTournaments.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Tournament not found');
  const t = mockTournaments[idx];
  if (t.registeredPlayers.includes(userId)) throw new Error('Already registered');
  if (t.registeredPlayers.length >= t.maxPlayers) throw new Error('Tournament is full');
  mockTournaments[idx] = { ...t, registeredPlayers: [...t.registeredPlayers, userId] };
  return mockTournaments[idx];
}

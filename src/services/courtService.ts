import { api } from './api';
import type { Court, TimeSlot } from '../types';

export async function getCourt(): Promise<Court> {
  const { data } = await api.get<Court>('/court');
  return data;
}

export async function getAvailability(date: string): Promise<TimeSlot[]> {
  const { data } = await api.get<TimeSlot[]>('/court/availability', { params: { date } });
  return data;
}

export async function updateCourtSettings(body: Partial<Court>): Promise<Court> {
  const { data } = await api.put<Court>('/court/settings', body);
  return data;
}
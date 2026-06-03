import { api } from './api';
import type { Court, TimeSlot } from '../types';
import type { BlockedDate } from '../types';


export interface PriceRule {
  id: string;
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isActive: boolean;
  priority: number;
}

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

// Price Rules
export async function getPriceRules(): Promise<PriceRule[]> {
  const { data } = await api.get<PriceRule[]>('/price-rules');
  return data;
}

export async function createPriceRule(body: Omit<PriceRule, 'id' | 'isActive'>): Promise<PriceRule> {
  const { data } = await api.post<PriceRule>('/price-rules', body);
  return data;
}

export async function updatePriceRule(id: string, body: Partial<PriceRule>): Promise<PriceRule> {
  const { data } = await api.put<PriceRule>(`/price-rules/${id}`, body);
  return data;
}

export async function deletePriceRule(id: string): Promise<void> {
  await api.delete(`/price-rules/${id}`);
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  const { data } = await api.get<BlockedDate[]>('/court/blocked-dates');
  return data;
}

export async function addBlockedDate(body: { date: string; startTime?: string; endTime?: string; reason?: string }): Promise<BlockedDate> {
  const { data } = await api.post<BlockedDate>('/court/blocked-dates', body);
  return data;
}

export async function deleteBlockedDate(id: string): Promise<void> {
  await api.delete(`/court/blocked-dates/${id}`);
}
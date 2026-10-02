import { api } from './api';
import type { Analytics, Booking } from '../types';

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await api.get<Analytics>('/admin/analytics');
  return data;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/admin/bookings');
  return data;
}

// ✅ Accepts an optional reason. Backend can persist it (and optionally
// email the customer). Until the API is updated, extra body keys are
// ignored by most stacks — no breakage.
export async function adminUpdateBooking(
  id: string,
  status: Booking['status'],
  reason?: string
): Promise<Booking> {
  const { data } = await api.put<Booking>(`/admin/bookings/${id}`, {
    status,
    ...(reason ? { reason } : {}),
  });
  return data;
}
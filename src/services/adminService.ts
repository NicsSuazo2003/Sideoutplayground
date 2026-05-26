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

export async function adminUpdateBooking(id: string, status: Booking['status']): Promise<Booking> {
  const { data } = await api.put<Booking>(`/admin/bookings/${id}`, { status });
  return data;
}
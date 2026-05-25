import { api } from './api';
import type { Booking } from '../types';

export async function createBooking(body: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', body);
  return data;
}

export async function getUserBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/user');
  return data;
}

export async function getBookingById(id: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/${id}`);
  return data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await api.put<Booking>(`/bookings/${id}/cancel`);
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
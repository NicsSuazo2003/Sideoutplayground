import { api } from './api';
import type { Analytics, User, Booking } from '../types';

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

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/admin/users');
  return data;
}

export async function updateUser(id: string, body: Partial<User>): Promise<User> {
  const { data } = await api.put<User>(`/admin/users/${id}`, body);
  return data;
}
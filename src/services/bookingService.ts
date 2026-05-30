import { api } from './api';
import type { Booking } from '../types';

export interface CreateBookingPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  slots: { startTime: string; endTime: string }[];
  totalAmount: number;
  notes?: string;
}

export async function createBooking(body: CreateBookingPayload): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', body);
  return data;
}

export async function trackBooking(referenceCode: string, email: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/track/${referenceCode}`, { params: { email } });
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
export async function uploadPaymentScreenshot(bookingId: string, file: File): Promise<Booking> {
  const formData = new FormData();
  formData.append('screenshot', file);
  const { data } = await api.post<Booking>(`/bookings/${bookingId}/upload-payment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
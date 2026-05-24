import { delay } from './api';
import type { Booking } from '../types';
import { mockBookings } from '../mocks/bookings';

// Replace with real API call: axios.post('/api/bookings', data)
export async function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  await delay();
  const booking: Booking = {
    ...data,
    id: `bk-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mockBookings.push(booking);
  return booking;
}

// Replace with real API call: axios.get('/api/bookings/user')
export async function getUserBookings(userId: string): Promise<Booking[]> {
  await delay(300);
  return mockBookings.filter(b => b.userId === userId);
}

// Replace with real API call: axios.get(`/api/bookings/${id}`)
export async function getBookingById(id: string): Promise<Booking> {
  await delay(300);
  const b = mockBookings.find(bk => bk.id === id);
  if (!b) throw new Error('Booking not found');
  return b;
}

// Replace with real API call: axios.put(`/api/bookings/${id}/cancel`)
export async function cancelBooking(id: string): Promise<Booking> {
  await delay();
  const idx = mockBookings.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Booking not found');
  mockBookings[idx] = { ...mockBookings[idx], status: 'cancelled' };
  return mockBookings[idx];
}

// Replace with real API call: axios.get('/api/bookings/admin')
export async function getAllBookings(): Promise<Booking[]> {
  await delay(300);
  return [...mockBookings];
}

// Replace with real API call: axios.put(`/api/bookings/admin/${id}`, { status })
export async function adminUpdateBooking(id: string, status: Booking['status']): Promise<Booking> {
  await delay();
  const idx = mockBookings.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Booking not found');
  mockBookings[idx] = { ...mockBookings[idx], status };
  return mockBookings[idx];
}

import { delay } from './api';
import type { Analytics, User } from '../types';
import { mockAnalytics } from '../mocks/analytics';
import { mockUsers } from '../mocks/users';
import { getAllBookings, adminUpdateBooking } from './bookingService';

// Replace with real API call: axios.get('/api/admin/analytics')
export async function getAnalytics(): Promise<Analytics> {
  await delay(400);
  return { ...mockAnalytics };
}

// Replace with real API call: axios.get('/api/admin/bookings')
export { getAllBookings };

// Replace with real API call: axios.put(`/api/admin/bookings/${id}`, { status })
export { adminUpdateBooking };

// Replace with real API call: axios.get('/api/admin/users')
export async function getUsers(): Promise<User[]> {
  await delay(300);
  return [...mockUsers];
}

// Replace with real API call: axios.put(`/api/admin/users/${id}`, data)
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  await delay();
  const idx = mockUsers.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  mockUsers[idx] = { ...mockUsers[idx], ...data };
  return mockUsers[idx];
}

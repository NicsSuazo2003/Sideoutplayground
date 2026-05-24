import { delay } from './api';
import type { Notification } from '../types';
import { mockNotifications } from '../mocks/notifications';

// Replace with real API call: axios.get('/api/notifications')
export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(300);
  return mockNotifications.filter(n => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Replace with real API call: axios.put(`/api/notifications/${id}/read`)
export async function markAsRead(id: string): Promise<void> {
  await delay(200);
  const idx = mockNotifications.findIndex(n => n.id === id);
  if (idx !== -1) mockNotifications[idx].read = true;
}

// Replace with real API call: axios.put('/api/notifications/read-all')
export async function markAllRead(userId: string): Promise<void> {
  await delay(300);
  mockNotifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
}

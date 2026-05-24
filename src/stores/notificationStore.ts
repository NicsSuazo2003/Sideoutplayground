import { create } from 'zustand';
import type { Notification } from '../types';
import * as notificationService from '../services/notificationService';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    set({ isLoading: true });
    const notifications = await notificationService.getNotifications(userId);
    set({ notifications, unreadCount: notifications.filter(n => !n.read).length, isLoading: false });
  },

  markAsRead: async (id) => {
    await notificationService.markAsRead(id);
    set(state => {
      const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
    });
  },

  markAllRead: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    await notificationService.markAllRead(userId);
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));

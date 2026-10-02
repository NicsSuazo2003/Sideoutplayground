import { create } from 'zustand';
import type { Analytics, Booking, Court } from '../types';
import * as adminService from '../services/adminService';
import * as courtService from '../services/courtService';
import { useAuthStore } from './authStore';

interface AdminState {
  analytics: Analytics | null;
  bookings: Booking[];
  courtSettings: Court | null;
  isLoading: boolean;
  // ✅ Expose the current user so UI can gate on role without importing authStore.
  user: ReturnType<typeof useAuthStore.getState>['user'];

  fetchAnalytics: () => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  manageBooking: (id: string, status: Booking['status'], reason?: string) => Promise<void>;
  fetchCourtSettings: () => Promise<void>;
  updateCourtSettings: (data: Partial<Court>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  analytics: null,
  bookings: [],
  courtSettings: null,
  isLoading: false,
  user: useAuthStore.getState().user,

  fetchAnalytics: async () => {
    set({ isLoading: true });
    const analytics = await adminService.getAnalytics();
    set({ analytics, isLoading: false });
  },

  fetchAllBookings: async () => {
    set({ isLoading: true });
    const bookings = await adminService.getAllBookings();
    set({ bookings, isLoading: false });
  },

  // ✅ Accepts reason; forwards to the service. Store also applies the optimistic
  // update, but the component re-fetches after, so this is a safe intermediary.
  manageBooking: async (id, status, reason) => {
    await adminService.adminUpdateBooking(id, status, reason);
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? ({
              ...b,
              status,
              // Only set these if the backend echoes them; otherwise they stay as-is.
              ...(reason ? { status_reason: reason } : {}),
            } as Booking)
          : b
      ),
    }));
  },

  fetchCourtSettings: async () => {
    set({ isLoading: true });
    const court = await courtService.getCourt();
    set({ courtSettings: court, isLoading: false });
  },

  updateCourtSettings: async (data) => {
    set({ isLoading: true });
    const court = await courtService.updateCourtSettings(data);
    set({ courtSettings: court, isLoading: false });
  },
}));

// Keep `user` in sync if the auth store changes (login/logout on another tab, etc.).
useAuthStore.subscribe((state) => {
  useAdminStore.setState({ user: state.user });
});
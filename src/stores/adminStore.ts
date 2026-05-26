import { create } from 'zustand';
import type { Analytics, Booking, Court } from '../types';
import * as adminService from '../services/adminService';
import * as courtService from '../services/courtService';

interface AdminState {
  analytics: Analytics | null;
  bookings: Booking[];
  courtSettings: Court | null;
  isLoading: boolean;
  fetchAnalytics: () => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  manageBooking: (id: string, status: Booking['status']) => Promise<void>;
  fetchCourtSettings: () => Promise<void>;
  updateCourtSettings: (data: Partial<Court>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  analytics: null,
  bookings: [],
  courtSettings: null,
  isLoading: false,

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

  manageBooking: async (id, status) => {
    await adminService.adminUpdateBooking(id, status);
    set(state => ({
      bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b),
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
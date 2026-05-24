import { create } from 'zustand';
import type { Court, TimeSlot, Booking } from '../types';
import * as courtService from '../services/courtService';
import * as bookingService from '../services/bookingService';

interface BookingState {
  court: Court | null;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  availability: TimeSlot[];
  isLoading: boolean;
  fetchCourt: () => Promise<void>;
  fetchAvailability: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  selectSlot: (slot: TimeSlot) => void;
  deselectSlot: (slotId: string) => void;
  clearSelection: () => void;
  createBooking: (data: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
}

export const useBookingStore = create<BookingState>((set) => ({
  court: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedSlots: [],
  availability: [],
  isLoading: false,

  fetchCourt: async () => {
    set({ isLoading: true });
    const court = await courtService.getCourt();
    set({ court, isLoading: false });
  },

  fetchAvailability: async (date) => {
    set({ isLoading: true });
    const availability = await courtService.getAvailability(date);
    set({ availability, isLoading: false });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedSlots: [] });
  },

  selectSlot: (slot) => {
    set(state => ({ selectedSlots: [...state.selectedSlots, slot] }));
  },

  deselectSlot: (slotId) => {
    set(state => ({ selectedSlots: state.selectedSlots.filter(s => s.id !== slotId) }));
  },

  clearSelection: () => {
    set({ selectedSlots: [] });
  },

  createBooking: async (data) => {
    const booking = await bookingService.createBooking(data);
    return booking;
  },
}));

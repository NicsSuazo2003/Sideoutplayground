import { create } from 'zustand';
import type { Court, TimeSlot, Booking } from '../types';
import * as courtService from '../services/courtService';
import * as bookingService from '../services/bookingService';
import type { CreateBookingPayload } from '../services/bookingService';

const DEFAULT_PRICE_PER_HOUR = 150;

interface BookingState {
  court: Court | null;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  availability: TimeSlot[];
  isLoading: boolean;
  // Customer form
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  setCustomerName: (v: string) => void;
  setCustomerEmail: (v: string) => void;
  setCustomerPhone: (v: string) => void;
  setNotes: (v: string) => void;
  // Actions
  fetchCourt: () => Promise<void>;
  fetchAvailability: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  selectSlot: (slot: TimeSlot) => void;
  deselectSlot: (slotId: string) => void;
  clearSelection: () => void;
  createBooking: (data: CreateBookingPayload) => Promise<Booking>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  court: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedSlots: [],
  availability: [],
  isLoading: false,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  notes: '',

  setCustomerName: (v) => set({ customerName: v }),
  setCustomerEmail: (v) => set({ customerEmail: v }),
  setCustomerPhone: (v) => set({ customerPhone: v }),
  setNotes: (v) => set({ notes: v }),

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
    // 🔵 Defensive: never allow a slot with an undefined price into the cart.
    const basePrice = get().court?.pricePerHour ?? DEFAULT_PRICE_PER_HOUR;
    const isFixed2Hr = slot.startTime === '16:00' && slot.endTime === '18:00';
    const normalizedPrice =
      typeof slot.price === 'number' && slot.price > 0
        ? slot.price
        : isFixed2Hr
        ? basePrice * 2
        : basePrice;

    const normalized: TimeSlot = { ...slot, price: normalizedPrice };

    set((state) => {
      // 🛡️ Prevent selecting the exact same slot twice
      if (state.selectedSlots.some((s) => s.id === normalized.id)) return state;

      // 🛡️ Evict any existing selection that overlaps with the new one.
      //    This handles the 2hr prime block gracefully — selecting 16-18
      //    automatically removes 16-17 and 17-18, and vice versa.
      const newStart = normalized.startTime;
      const newEnd = normalized.endTime;

      const filtered = state.selectedSlots.filter((s) => {
        // Keep slots that end before the new one starts, or start after it ends.
        return s.endTime <= newStart || s.startTime >= newEnd;
      });

      return { selectedSlots: [...filtered, normalized] };
    });
  },

  deselectSlot: (slotId) => {
    set((state) => ({
      selectedSlots: state.selectedSlots.filter((s) => s.id !== slotId),
    }));
  },

  clearSelection: () => {
    set({ selectedSlots: [] });
  },

  createBooking: async (data) => {
    const booking = await bookingService.createBooking(data);
    return booking;
  },
}));
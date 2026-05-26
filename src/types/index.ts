export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type CourtStatus = 'active' | 'inactive' | 'maintenance';
export type CourtType = 'indoor' | 'outdoor';
export type PaymentMethod = 'cash';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatar: string | null;
  createdAt: string;
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  indoor: boolean;
  pricePerHour: number;
  amenities: string[];
  rating: number;
  imageUrl: string;
  images: string[];
  status: CourtStatus;
  openTime: string;
  closeTime: string;
  dimensions: string;
  surface: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  slots: TimeSlot[];
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  notes?: string;
  referenceCode: string;
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  revenueByDay: { date: string; revenue: number }[];
  bookingsByDay: { date: string; bookings: number }[];
  revenueGrowth: number;
  bookingsGrowth: number;
  usersGrowth: number;
}
export type UserRole = 'user' | 'admin';
export type MembershipTier = 'free' | 'bronze' | 'silver' | 'gold';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type CourtStatus = 'active' | 'inactive' | 'maintenance';
export type CourtType = 'indoor' | 'outdoor';
export type PaymentMethod = 'gcash' | 'card' | 'cash';
export type NotificationType = 'booking' | 'membership' | 'tournament' | 'system';
export type TournamentType = 'singles' | 'doubles' | 'mixed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  membershipTier: MembershipTier;
  avatar: string | null;
  createdAt: string;
  bookingsCount: number;
  status: 'active' | 'suspended';
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
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  slots: TimeSlot[];
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  notes?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  price: number;
  color: string;
  benefits: string[];
  discountPercent: number;
  guestPasses: number;
  priorityBooking: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  date: string;
  time: string;
  entryFee: number;
  maxPlayers: number;
  registeredPlayers: string[];
  description: string;
  rules: string[];
  prizes: string[];
  imageUrl: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  revenueByDay: { date: string; revenue: number }[];
  bookingsByDay: { date: string; bookings: number }[];
  revenueGrowth: number;
  bookingsGrowth: number;
  usersGrowth: number;
}

export interface AdminBooking extends Booking {
  membershipTier: MembershipTier;
}

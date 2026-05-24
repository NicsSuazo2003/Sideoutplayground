import type { Analytics } from '../types';

const generateLast30Days = () => {
  const days: { date: string; revenue: number; bookings: number }[] = [];
  const now = new Date('2026-05-24');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const bookings = Math.floor(Math.random() * 8) + 2;
    const revenue = bookings * 20 + Math.floor(Math.random() * 60);
    days.push({ date: dateStr, revenue, bookings });
  }
  return days;
};

const data = generateLast30Days();

export const mockAnalytics: Analytics = {
  totalRevenue: data.reduce((s, d) => s + d.revenue, 0),
  totalBookings: data.reduce((s, d) => s + d.bookings, 0),
  activeUsers: 14,
  revenueByDay: data.map(d => ({ date: d.date, revenue: d.revenue })),
  bookingsByDay: data.map(d => ({ date: d.date, bookings: d.bookings })),
  revenueGrowth: 12.5,
  bookingsGrowth: 8.3,
  usersGrowth: 5.1,
};

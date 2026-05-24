import type { Notification } from '../types';

export const mockNotifications: Notification[] = [
  { id: 'n-1', userId: 'u-1', type: 'booking', title: 'Booking Confirmed', message: 'Your booking for May 30, 8:00-10:00 AM has been confirmed.', read: false, createdAt: '2026-05-20T10:05:00Z' },
  { id: 'n-2', userId: 'u-1', type: 'system', title: 'Court Maintenance Notice', message: 'Side Out Arena will be unavailable on May 29 from 8AM-10AM for routine maintenance.', read: false, createdAt: '2026-05-14T08:00:00Z' },
  { id: 'n-3', userId: 'u-1', type: 'booking', title: 'Booking Reminder', message: 'Reminder: You have a booking tomorrow at 8:00 AM. Court is ready for you!', read: false, createdAt: '2026-05-29T18:00:00Z' },
  { id: 'n-4', userId: 'u-1', type: 'system', title: 'New Feature: Multi-slot Booking', message: 'You can now book multiple time slots in one checkout. Try it on your next booking!', read: true, createdAt: '2026-05-10T14:00:00Z' },
  { id: 'n-5', userId: 'u-1', type: 'booking', title: 'Booking Cancelled', message: 'Your booking for May 8 at 4:00 PM has been cancelled. Refund processing in 3-5 days.', read: true, createdAt: '2026-05-08T16:30:00Z' },
  { id: 'n-6', userId: 'u-1', type: 'system', title: 'Weekend Special Offer', message: 'Book 3+ hours this weekend and get 15% off your total. Use code WEEKEND15.', read: false, createdAt: '2026-05-22T09:00:00Z' },
  { id: 'n-7', userId: 'u-1', type: 'booking', title: 'Booking Completed', message: 'Your session on May 5 is complete. We hope you had a great game! Leave a review.', read: true, createdAt: '2026-05-05T12:00:00Z' },
  { id: 'n-8', userId: 'u-1', type: 'system', title: 'App Update Available', message: 'A new version of the Side Out app is available with improved booking experience.', read: true, createdAt: '2026-05-08T10:00:00Z' },
  { id: 'n-9', userId: 'u-1', type: 'booking', title: 'Slot Available', message: 'A previously booked slot on June 2 at 9:00 AM just became available. Book now!', read: false, createdAt: '2026-05-23T14:00:00Z' },
  { id: 'n-10', userId: 'u-1', type: 'system', title: 'Court Hours Extended', message: 'Side Out Arena is now open until 10 PM on weekdays. Book the evening slots!', read: true, createdAt: '2026-05-01T09:00:00Z' },
  { id: 'n-11', userId: 'u-1', type: 'booking', title: 'Payment Received', message: 'Payment of $40 confirmed for booking #bk-001. Enjoy your game!', read: true, createdAt: '2026-05-20T10:10:00Z' },
  { id: 'n-12', userId: 'u-1', type: 'system', title: 'Welcome to Side Out!', message: 'Thanks for joining Side Out Playground. Book your first session and experience the court!', read: true, createdAt: '2026-02-15T08:00:00Z' },
];

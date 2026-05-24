import type { Booking } from '../types';

const makeSlot = (date: string, hour: number) => ({
  id: `slot-${date}-${hour}`,
  date,
  startTime: `${String(hour).padStart(2, '0')}:00`,
  endTime: `${String(hour + 1).padStart(2, '0')}:00`,
  isAvailable: false,
});

export const mockBookings: Booking[] = [
  {
    id: 'bk-001', userId: 'u-1', userName: 'Alex Rivera', userEmail: 'alex@example.com',
    date: '2026-05-30', slots: [makeSlot('2026-05-30', 8), makeSlot('2026-05-30', 9)],
    totalAmount: 40, status: 'confirmed', paymentMethod: 'card', createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'bk-002', userId: 'u-2', userName: 'Jordan Kim', userEmail: 'jordan@example.com',
    date: '2026-05-31', slots: [makeSlot('2026-05-31', 10)],
    totalAmount: 20, status: 'pending', paymentMethod: 'gcash', createdAt: '2026-05-21T09:00:00Z',
  },
  {
    id: 'bk-003', userId: 'u-3', userName: 'Sam Torres', userEmail: 'sam@example.com',
    date: '2026-06-01', slots: [makeSlot('2026-06-01', 14), makeSlot('2026-06-01', 15)],
    totalAmount: 40, status: 'confirmed', paymentMethod: 'cash', createdAt: '2026-05-22T11:00:00Z',
  },
  {
    id: 'bk-004', userId: 'u-1', userName: 'Alex Rivera', userEmail: 'alex@example.com',
    date: '2026-06-02', slots: [makeSlot('2026-06-02', 7)],
    totalAmount: 18, status: 'confirmed', paymentMethod: 'card', createdAt: '2026-05-22T14:00:00Z',
  },
  {
    id: 'bk-005', userId: 'u-5', userName: 'Riley Chen', userEmail: 'riley@example.com',
    date: '2026-05-25', slots: [makeSlot('2026-05-25', 18), makeSlot('2026-05-25', 19)],
    totalAmount: 36, status: 'confirmed', paymentMethod: 'gcash', createdAt: '2026-05-18T15:00:00Z',
  },
  {
    id: 'bk-006', userId: 'u-4', userName: 'Casey Morgan', userEmail: 'casey@example.com',
    date: '2026-05-15', slots: [makeSlot('2026-05-15', 12)],
    totalAmount: 20, status: 'completed', paymentMethod: 'card', createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'bk-007', userId: 'u-6', userName: 'Morgan Davis', userEmail: 'morgan@example.com',
    date: '2026-05-10', slots: [makeSlot('2026-05-10', 9), makeSlot('2026-05-10', 10)],
    totalAmount: 38, status: 'completed', paymentMethod: 'gcash', createdAt: '2026-05-05T08:00:00Z',
  },
  {
    id: 'bk-008', userId: 'u-2', userName: 'Jordan Kim', userEmail: 'jordan@example.com',
    date: '2026-05-08', slots: [makeSlot('2026-05-08', 16)],
    totalAmount: 20, status: 'cancelled', paymentMethod: 'card', createdAt: '2026-05-03T16:00:00Z',
  },
  {
    id: 'bk-009', userId: 'u-9', userName: 'Quinn Patel', userEmail: 'quinn@example.com',
    date: '2026-06-03', slots: [makeSlot('2026-06-03', 6), makeSlot('2026-06-03', 7), makeSlot('2026-06-03', 8)],
    totalAmount: 54, status: 'confirmed', paymentMethod: 'card', createdAt: '2026-05-23T07:00:00Z',
  },
  {
    id: 'bk-010', userId: 'u-10', userName: 'Jamie Lee', userEmail: 'jamie@example.com',
    date: '2026-05-27', slots: [makeSlot('2026-05-27', 20)],
    totalAmount: 20, status: 'pending', paymentMethod: 'cash', createdAt: '2026-05-24T09:00:00Z',
  },
  {
    id: 'bk-011', userId: 'u-1', userName: 'Alex Rivera', userEmail: 'alex@example.com',
    date: '2026-05-05', slots: [makeSlot('2026-05-05', 11)],
    totalAmount: 18, status: 'completed', paymentMethod: 'card', createdAt: '2026-05-01T11:00:00Z',
  },
  {
    id: 'bk-012', userId: 'u-5', userName: 'Riley Chen', userEmail: 'riley@example.com',
    date: '2026-05-12', slots: [makeSlot('2026-05-12', 17), makeSlot('2026-05-12', 18)],
    totalAmount: 36, status: 'completed', paymentMethod: 'gcash', createdAt: '2026-05-08T13:00:00Z',
  },
  {
    id: 'bk-013', userId: 'u-3', userName: 'Sam Torres', userEmail: 'sam@example.com',
    date: '2026-05-03', slots: [makeSlot('2026-05-03', 15)],
    totalAmount: 20, status: 'completed', paymentMethod: 'card', createdAt: '2026-04-28T15:00:00Z',
  },
  {
    id: 'bk-014', userId: 'u-11', userName: 'Avery Wilson', userEmail: 'avery@example.com',
    date: '2026-06-05', slots: [makeSlot('2026-06-05', 13), makeSlot('2026-06-05', 14)],
    totalAmount: 40, status: 'confirmed', paymentMethod: 'gcash', createdAt: '2026-05-24T08:00:00Z',
  },
  {
    id: 'bk-015', userId: 'u-13', userName: 'Cameron Scott', userEmail: 'cameron@example.com',
    date: '2026-05-28', slots: [makeSlot('2026-05-28', 19), makeSlot('2026-05-28', 20)],
    totalAmount: 38, status: 'confirmed', paymentMethod: 'card', createdAt: '2026-05-23T18:00:00Z',
  },
  {
    id: 'bk-016', userId: 'u-14', userName: 'Dakota Brown', userEmail: 'dakota@example.com',
    date: '2026-04-20', slots: [makeSlot('2026-04-20', 10)],
    totalAmount: 20, status: 'completed', paymentMethod: 'cash', createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'bk-017', userId: 'u-8', userName: 'Drew Martinez', userEmail: 'drew@example.com',
    date: '2026-04-25', slots: [makeSlot('2026-04-25', 8)],
    totalAmount: 20, status: 'cancelled', paymentMethod: 'gcash', createdAt: '2026-04-20T08:00:00Z',
  },
  {
    id: 'bk-018', userId: 'u-2', userName: 'Jordan Kim', userEmail: 'jordan@example.com',
    date: '2026-05-24', slots: [makeSlot('2026-05-24', 11), makeSlot('2026-05-24', 12)],
    totalAmount: 38, status: 'confirmed', paymentMethod: 'card', createdAt: '2026-05-20T11:00:00Z',
  },
  {
    id: 'bk-019', userId: 'u-9', userName: 'Quinn Patel', userEmail: 'quinn@example.com',
    date: '2026-05-20', slots: [makeSlot('2026-05-20', 7)],
    totalAmount: 18, status: 'completed', paymentMethod: 'card', createdAt: '2026-05-16T07:00:00Z',
  },
  {
    id: 'bk-020', userId: 'u-6', userName: 'Morgan Davis', userEmail: 'morgan@example.com',
    date: '2026-06-07', slots: [makeSlot('2026-06-07', 15), makeSlot('2026-06-07', 16), makeSlot('2026-06-07', 17)],
    totalAmount: 57, status: 'pending', paymentMethod: 'gcash', createdAt: '2026-05-24T07:00:00Z',
  },
  {
    id: 'bk-021', userId: 'u-1', userName: 'Alex Rivera', userEmail: 'alex@example.com',
    date: '2026-04-15', slots: [makeSlot('2026-04-15', 9)],
    totalAmount: 18, status: 'completed', paymentMethod: 'card', createdAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'bk-022', userId: 'u-5', userName: 'Riley Chen', userEmail: 'riley@example.com',
    date: '2026-04-28', slots: [makeSlot('2026-04-28', 14)],
    totalAmount: 18, status: 'completed', paymentMethod: 'gcash', createdAt: '2026-04-23T14:00:00Z',
  },
  {
    id: 'bk-023', userId: 'u-12', userName: 'Blake Johnson', userEmail: 'blake@example.com',
    date: '2026-05-26', slots: [makeSlot('2026-05-26', 8)],
    totalAmount: 20, status: 'confirmed', paymentMethod: 'cash', createdAt: '2026-05-22T08:00:00Z',
  },
  {
    id: 'bk-024', userId: 'u-3', userName: 'Sam Torres', userEmail: 'sam@example.com',
    date: '2026-06-10', slots: [makeSlot('2026-06-10', 12), makeSlot('2026-06-10', 13)],
    totalAmount: 40, status: 'pending', paymentMethod: 'card', createdAt: '2026-05-24T12:00:00Z',
  },
  {
    id: 'bk-025', userId: 'u-10', userName: 'Jamie Lee', userEmail: 'jamie@example.com',
    date: '2026-04-10', slots: [makeSlot('2026-04-10', 17)],
    totalAmount: 20, status: 'completed', paymentMethod: 'gcash', createdAt: '2026-04-05T17:00:00Z',
  },
];

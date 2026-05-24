import { delay } from './api';
import type { Court, TimeSlot } from '../types';
import { mockCourt } from '../mocks/court';
import { mockBookings } from '../mocks/bookings';

// Replace with real API call: axios.get('/api/court')
export async function getCourt(): Promise<Court> {
  await delay();
  return { ...mockCourt };
}

// Replace with real API call: axios.get(`/api/court/availability?date=${date}`)
export async function getAvailability(date: string): Promise<TimeSlot[]> {
  await delay(300);
  const slots: TimeSlot[] = [];
  const openHour = 6;
  const closeHour = 22;

  const bookedSlotIds = new Set<string>();
  mockBookings.forEach(b => {
    if (b.date === date && b.status !== 'cancelled') {
      b.slots.forEach(s => bookedSlotIds.add(s.startTime));
    }
  });

  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];

  for (let h = openHour; h < closeHour; h++) {
    const startTime = `${String(h).padStart(2, '0')}:00`;
    const endTime = `${String(h + 1).padStart(2, '0')}:00`;
    const isPast = isToday && h <= now.getHours();
    const isBooked = bookedSlotIds.has(startTime);

    slots.push({
      id: `slot-${date}-${h}`,
      date,
      startTime,
      endTime,
      isAvailable: !isPast && !isBooked,
    });
  }
  return slots;
}

// Replace with real API call: axios.put('/api/court/settings', data)
export async function updateCourtSettings(data: Partial<Court>): Promise<Court> {
  await delay();
  Object.assign(mockCourt, data);
  return { ...mockCourt };
}

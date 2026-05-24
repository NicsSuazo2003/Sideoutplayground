import type { Court } from '../types';

export const mockCourt: Court = {
  id: 'court-1',
  name: 'Side Out Arena',
  type: 'indoor',
  indoor: true,
  pricePerHour: 20,
  amenities: ['LED Lighting', 'Air Conditioning', 'Professional Nets', 'Seating Area', 'Water Station', 'Locker Rooms', 'Pro Shop', 'Parking'],
  rating: 4.9,
  imageUrl: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1200',
  status: 'active',
  openTime: '06:00',
  closeTime: '22:00',
  dimensions: '60ft × 30ft',
  surface: 'Acrylic Hard Court',
};

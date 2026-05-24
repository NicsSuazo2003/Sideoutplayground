import type { User } from '../types';

export const mockUsers: User[] = [
  { id: 'u-admin', name: 'Admin User', email: 'admin@sideout.com', phone: '+1 555-0100', role: 'admin', avatar: null, createdAt: '2024-01-01', bookingsCount: 0, status: 'active' },
  { id: 'u-1', name: 'Alex Rivera', email: 'alex@example.com', phone: '+1 555-0101', role: 'user', avatar: null, createdAt: '2024-02-15', bookingsCount: 18, status: 'active' },
  { id: 'u-2', name: 'Jordan Kim', email: 'jordan@example.com', phone: '+1 555-0102', role: 'user', avatar: null, createdAt: '2024-03-01', bookingsCount: 12, status: 'active' },
  { id: 'u-3', name: 'Sam Torres', email: 'sam@example.com', phone: '+1 555-0103', role: 'user', avatar: null, createdAt: '2024-03-20', bookingsCount: 7, status: 'active' },
  { id: 'u-4', name: 'Casey Morgan', email: 'casey@example.com', phone: '+1 555-0104', role: 'user', avatar: null, createdAt: '2024-04-05', bookingsCount: 3, status: 'active' },
  { id: 'u-5', name: 'Riley Chen', email: 'riley@example.com', phone: '+1 555-0105', role: 'user', avatar: null, createdAt: '2024-04-10', bookingsCount: 22, status: 'active' },
  { id: 'u-6', name: 'Morgan Davis', email: 'morgan@example.com', phone: '+1 555-0106', role: 'user', avatar: null, createdAt: '2024-04-22', bookingsCount: 9, status: 'active' },
  { id: 'u-7', name: 'Taylor Nguyen', email: 'taylor@example.com', phone: '+1 555-0107', role: 'user', avatar: null, createdAt: '2024-05-01', bookingsCount: 5, status: 'suspended' },
  { id: 'u-8', name: 'Drew Martinez', email: 'drew@example.com', phone: '+1 555-0108', role: 'user', avatar: null, createdAt: '2024-05-15', bookingsCount: 2, status: 'active' },
  { id: 'u-9', name: 'Quinn Patel', email: 'quinn@example.com', phone: '+1 555-0109', role: 'user', avatar: null, createdAt: '2024-05-20', bookingsCount: 15, status: 'active' },
  { id: 'u-10', name: 'Jamie Lee', email: 'jamie@example.com', phone: '+1 555-0110', role: 'user', avatar: null, createdAt: '2024-06-01', bookingsCount: 8, status: 'active' },
  { id: 'u-11', name: 'Avery Wilson', email: 'avery@example.com', phone: '+1 555-0111', role: 'user', avatar: null, createdAt: '2024-06-10', bookingsCount: 4, status: 'active' },
  { id: 'u-12', name: 'Blake Johnson', email: 'blake@example.com', phone: '+1 555-0112', role: 'user', avatar: null, createdAt: '2024-06-15', bookingsCount: 1, status: 'active' },
  { id: 'u-13', name: 'Cameron Scott', email: 'cameron@example.com', phone: '+1 555-0113', role: 'user', avatar: null, createdAt: '2024-06-20', bookingsCount: 11, status: 'active' },
  { id: 'u-14', name: 'Dakota Brown', email: 'dakota@example.com', phone: '+1 555-0114', role: 'user', avatar: null, createdAt: '2024-07-01', bookingsCount: 6, status: 'active' },
];

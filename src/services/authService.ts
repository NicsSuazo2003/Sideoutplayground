import { delay } from './api';
import type { User } from '../types';
import { mockUsers } from '../mocks/users';

// Replace with real API call: axios.post('/api/auth/login', { email, password })
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  await delay();
  const user = mockUsers.find(u => u.email === email);
  if (!user || password.length < 6) {
    throw new Error('Invalid email or password');
  }
  return { token: `mock-jwt-${user.id}`, user };
}

// Replace with real API call: axios.post('/api/auth/register', data)
export async function register(data: { name: string; email: string; phone: string; password: string }): Promise<{ token: string; user: User }> {
  await delay();
  const existing = mockUsers.find(u => u.email === data.email);
  if (existing) throw new Error('An account with this email already exists');
  const newUser: User = {
    id: `u-new-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: 'user',
    membershipTier: 'free',
    avatar: null,
    createdAt: new Date().toISOString(),
    bookingsCount: 0,
    status: 'active',
  };
  mockUsers.push(newUser);
  return { token: `mock-jwt-${newUser.id}`, user: newUser };
}

// Replace with real API call: axios.post('/api/auth/forgot-password', { email })
export async function forgotPassword(email: string): Promise<void> {
  await delay();
  const user = mockUsers.find(u => u.email === email);
  if (!user) throw new Error('No account found with that email address');
}

// Replace with real API call: axios.put('/api/auth/profile', data)
export async function updateProfile(userId: string, data: Partial<User>): Promise<User> {
  await delay();
  const idx = mockUsers.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  mockUsers[idx] = { ...mockUsers[idx], ...data };
  return mockUsers[idx];
}

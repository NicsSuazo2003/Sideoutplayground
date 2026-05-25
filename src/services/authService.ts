import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(body: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', body);
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function updateProfile(userId: string, body: Partial<User>): Promise<User> {
  const { data } = await api.put<User>('/auth/profile', body);
  return data;
}
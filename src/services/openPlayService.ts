import { api } from './api';
import type { OpenPlaySession, OpenPlayRegistration } from '../types';

export async function getUpcomingSessions(): Promise<OpenPlaySession[]> {
  const { data } = await api.get<OpenPlaySession[]>('/openplay/sessions');
  return data;
}

export async function getSession(id: string): Promise<OpenPlaySession> {
  const { data } = await api.get<OpenPlaySession>(`/openplay/sessions/${id}`);
  return data;
}

export async function registerForSession(sessionId: string, body: { customerName: string; customerEmail: string; customerPhone?: string }): Promise<OpenPlayRegistration> {
  const { data } = await api.post<OpenPlayRegistration>(`/openplay/register/${sessionId}`, body);
  return data;
}

export async function trackRegistration(referenceCode: string): Promise<OpenPlayRegistration> {
  const { data } = await api.get<OpenPlayRegistration>(`/openplay/track/${referenceCode}`);
  return data;
}

// Admin
export async function getAllSessions(): Promise<OpenPlaySession[]> {
  const { data } = await api.get<OpenPlaySession[]>('/openplay/admin/sessions');
  return data;
}

export async function createSession(body: Partial<OpenPlaySession>): Promise<OpenPlaySession> {
  const { data } = await api.post<OpenPlaySession>('/openplay/sessions', body);
  return data;
}

export async function updateSessionStatus(id: string, status: string): Promise<OpenPlaySession> {
  const { data } = await api.put<OpenPlaySession>(`/openplay/sessions/${id}`, status);
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/openplay/sessions/${id}`);
}

export async function getRegistrations(sessionId: string): Promise<OpenPlayRegistration[]> {
  const { data } = await api.get<OpenPlayRegistration[]>(`/openplay/registrations/${sessionId}`);
  return data;
}

export async function updateRegistrationStatus(id: string, status: string): Promise<OpenPlayRegistration> {
  const { data } = await api.put<OpenPlayRegistration>(`/openplay/registrations/${id}`, status);
  return data;
}
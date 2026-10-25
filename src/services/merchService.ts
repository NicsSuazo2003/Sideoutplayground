import { api } from './api';
import type { Merch } from '../types';

export async function getActiveMerch(): Promise<Merch[]> {
  const { data } = await api.get<Merch[]>('/merch');
  return data;
}

export async function getMerch(id: string): Promise<Merch> {
  const { data } = await api.get<Merch>(`/merch/${id}`);
  return data;
}

export async function getAllMerch(): Promise<Merch[]> {
  const { data } = await api.get<Merch[]>('/merch/admin/all');
  return data;
}

export async function createMerch(body: Partial<Merch>): Promise<Merch> {
  const { data } = await api.post<Merch>('/merch', body);
  return data;
}

export async function updateMerch(id: string, body: Partial<Merch>): Promise<Merch> {
  const { data } = await api.put<Merch>(`/merch/${id}`, body);
  return data;
}

export async function deleteMerch(id: string): Promise<void> {
  await api.delete(`/merch/${id}`);
}
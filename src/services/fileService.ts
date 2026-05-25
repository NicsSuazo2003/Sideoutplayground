import { api } from './api';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ url: string }>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

export async function deleteImage(url: string): Promise<void> {
  await api.delete('/files', { data: { url } });
}
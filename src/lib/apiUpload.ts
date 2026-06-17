import { Platform } from 'react-native';

import { API_URL } from '@/config/env';
import { getAccessToken } from '@/lib/storage';

export async function apiUploadForm<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: Record<string, string> = {};
  const accessToken = await getAccessToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error((data as { message?: string })?.message ?? `Upload failed: ${res.status}`);
  }

  return data as T;
}

export async function uploadRiderDocument(
  type: 'profileImage' | 'drivingLicense' | 'aadhaarCard',
  localUri: string,
): Promise<string> {
  const name = `${type}.jpg`;
  const formData = new FormData();
  formData.append('type', type);
  formData.append('file', {
    uri: localUri,
    name,
    type: 'image/jpeg',
  } as unknown as Blob);

  const body = await apiUploadForm<{ data?: { url?: string } }>(
    '/riders/upload-document',
    formData,
  );

  const url = body.data?.url;
  if (!url) throw new Error('Upload did not return a URL');
  return url;
}

export function isLocalImageUri(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith('file://') || value.startsWith('content://');
}

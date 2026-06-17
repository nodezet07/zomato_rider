import { API_URL } from '@/config/env';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/storage';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

type ApiError = Error & { status?: number; data?: unknown };

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { accessToken?: string; refreshToken?: string } };
    const data = body?.data;
    if (!data?.accessToken || !data?.refreshToken) return null;
    await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  } catch {
    return null;
  }
}

function isAuthPath(path: string) {
  return path.startsWith('/auth/') || path.startsWith('/riders/login') || path.startsWith('/riders/register');
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit & { _retry?: boolean },
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');

  const accessToken = await getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(url, { ...init, headers });

  if (res.status !== 401) {
    const text = await res.text();
    const data = text ? (JSON.parse(text) as Json) : null;
    if (!res.ok) {
      const err = new Error((data as { message?: string })?.message ?? `Request failed: ${res.status}`) as ApiError;
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data as T;
  }

  if (init?._retry || isAuthPath(path)) {
    const err = new Error('Unauthorized') as ApiError;
    err.status = 401;
    throw err;
  }

  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  const newAccessToken = await refreshPromise;
  if (!newAccessToken) {
    await clearTokens();
    const err = new Error('Session expired') as ApiError;
    err.status = 401;
    throw err;
  }

  const retryHeaders = new Headers(init?.headers ?? {});
  if (!retryHeaders.has('Content-Type') && init?.body) retryHeaders.set('Content-Type', 'application/json');
  retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
  const retryRes = await fetch(url, { ...init, headers: retryHeaders, _retry: true } as RequestInit & {
    _retry?: boolean;
  });
  const retryText = await retryRes.text();
  const retryData = retryText ? (JSON.parse(retryText) as Json) : null;
  if (!retryRes.ok) {
    const err = new Error(
      (retryData as { message?: string })?.message ?? `Request failed: ${retryRes.status}`,
    ) as ApiError;
    err.status = retryRes.status;
    err.data = retryData;
    throw err;
  }
  return retryData as T;
}

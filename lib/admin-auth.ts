'use client';

import { API_BASE_URL } from '@/lib/api/client';

const ADMIN_TOKEN_KEY = 'admin_access_token';
const ADMIN_PROFILE_CACHE_KEY = 'admin_profile_cache';
const ADMIN_SESSION_EXPIRES_AT_KEY = 'admin_session_expires_at';

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
}

interface AdminSessionResponse {
  data?: {
    user?: AdminProfile;
    expires_at?: string | null;
  };
}

function setCachedAdminSession(user: AdminProfile | null, expiresAt?: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (user) {
    window.sessionStorage.setItem(ADMIN_PROFILE_CACHE_KEY, JSON.stringify(user));
  } else {
    window.sessionStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
  }

  if (expiresAt) {
    window.sessionStorage.setItem(ADMIN_SESSION_EXPIRES_AT_KEY, expiresAt);
  } else {
    window.sessionStorage.removeItem(ADMIN_SESSION_EXPIRES_AT_KEY);
  }
}

function getCachedAdminProfile(): AdminProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(ADMIN_PROFILE_CACHE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    window.sessionStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
    return null;
  }
}

async function fetchAdminSession(): Promise<AdminSessionResponse | null> {
  const token = getAdminToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/v1/admin/auth/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    clearAdminToken();
    return null;
  }

  const payload = await response.json().catch(() => null);
  const user = payload?.data?.user ?? null;
  const expiresAt = payload?.data?.expires_at ?? null;

  setCachedAdminSession(user, expiresAt);

  return payload;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  setCachedAdminSession(null);
}

export function isAuthenticated(): boolean {
  return getAdminToken() !== null;
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function login(loginValue: string, password: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/v1/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      login: loginValue,
      password,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success || !payload?.data?.token) {
    return {
      success: false,
      message: payload?.message ?? 'Đăng nhập thất bại',
    };
  }

  setAdminToken(payload.data.token);
  setCachedAdminSession(payload?.data?.user ?? null, payload?.data?.expires_at ?? null);

  return {
    success: true,
    message: payload?.message,
  };
}

export async function verifySession(): Promise<boolean> {
  const payload = await fetchAdminSession();
  return Boolean(payload?.data?.user);
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const token = getAdminToken();

  if (!token) {
    return null;
  }

  const cachedProfile = getCachedAdminProfile();
  if (cachedProfile) {
    return cachedProfile;
  }

  const payload = await fetchAdminSession();
  return payload?.data?.user ?? null;
}

export async function logout(): Promise<void> {
  const token = getAdminToken();

  if (token) {
    await fetch(`${API_BASE_URL}/v1/admin/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => undefined);
  }

  clearAdminToken();
}

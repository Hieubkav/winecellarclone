'use client';

import { API_BASE_URL } from '@/lib/api/client';

const ADMIN_TOKEN_KEY = 'admin_access_token';

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
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

  return {
    success: true,
    message: payload?.message,
  };
}

export async function verifySession(): Promise<boolean> {
  const token = getAdminToken();

  if (!token) {
    return false;
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
    return false;
  }

  return true;
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
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

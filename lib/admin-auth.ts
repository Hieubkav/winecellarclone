'use client';

const ADMIN_USER = 'admin';
const ADMIN_PASS = '12345678';
const AUTH_KEY = 'admin_authenticated';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAdminToken, type AdminProfile, verifySession } from '@/lib/admin-auth';

const AUTH_CACHE_KEY = 'admin_auth_verified_at';
const AUTH_CACHE_TTL_MS = 2 * 60 * 1000;

type AdminSessionStatus = 'checking' | 'authenticated';

interface AdminSessionContextValue {
  status: AdminSessionStatus;
  authChecked: boolean;
  adminProfile: AdminProfile | null;
  setAdminProfile: React.Dispatch<React.SetStateAction<AdminProfile | null>>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<AdminSessionStatus>('checking');
  const [authChecked, setAuthChecked] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      if (isLoginPage) {
        if (!cancelled) {
          setAuthChecked(true);
        }
        return;
      }

      const token = getAdminToken();

      if (!token) {
        router.replace('/admin/login');
        return;
      }

      if (!cancelled) {
        setStatus('authenticated');
      }

      const cachedAt = window.sessionStorage.getItem(AUTH_CACHE_KEY);
      const cachedTime = cachedAt ? Number(cachedAt) : 0;

      if (cachedTime && Date.now() - cachedTime < AUTH_CACHE_TTL_MS) {
        if (!cancelled) {
          setAuthChecked(true);
        }
        return;
      }

      const isValid = await verifySession();

      if (cancelled) {
        return;
      }

      if (!isValid) {
        router.replace('/admin/login');
        return;
      }

      window.sessionStorage.setItem(AUTH_CACHE_KEY, String(Date.now()));
      setAuthChecked(true);
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router]);

  const value = useMemo(
    () => ({ status, authChecked, adminProfile, setAdminProfile }),
    [status, authChecked, adminProfile],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminSessionContextValue {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error('useAdminSession must be used within AdminSessionProvider');
  }

  return context;
}

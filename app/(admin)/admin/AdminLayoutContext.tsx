"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';

interface AdminLayoutContextValue {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const value = useMemo(
    () => ({ isSidebarCollapsed, setIsSidebarCollapsed }),
    [isSidebarCollapsed]
  );

  return <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>;
}

export function useAdminLayout(): AdminLayoutContextValue {
  const context = useContext(AdminLayoutContext);

  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayoutProvider');
  }

  return context;
}

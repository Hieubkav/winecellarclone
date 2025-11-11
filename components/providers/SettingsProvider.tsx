"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import type { Settings } from "@/lib/api/settings";

interface SettingsProviderProps {
  settings: Settings;
  children: React.ReactNode;
}

/**
 * SettingsProvider - Initialize Zustand store với server-fetched data
 * 
 * Pattern: Server Component → Client Provider → Client Components
 * 
 * Why needed:
 * - Next.js 16 App Router: Server Components không thể dùng Zustand
 * - Client Components cần access global settings
 * - Provider bridge giữa server data và client store
 * 
 * Hydration Safety:
 * - useRef prevents re-initialization on re-renders
 * - setHasHydrated(true) signals components it's safe to render
 * 
 * Usage in layout.tsx:
 * ```tsx
 * const settings = await fetchSettings()
 * return <SettingsProvider settings={settings}>{children}</SettingsProvider>
 * ```
 */
export function SettingsProvider({ settings, children }: SettingsProviderProps) {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Chỉ initialize 1 lần duy nhất
    if (!isInitialized.current) {
      useSettingsStore.getState().setSettings(settings);
      useSettingsStore.getState().setHasHydrated(true);
      isInitialized.current = true;
    }
  }, [settings]);

  return <>{children}</>;
}

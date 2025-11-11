import { create } from "zustand";
import type { Settings } from "@/lib/api/settings";

interface SettingsStore {
  settings: Settings | null;
  _hasHydrated: boolean;
  
  // Actions
  setSettings: (settings: Settings) => void;
  setHasHydrated: (hydrated: boolean) => void;
  
  // Computed helpers
  getSocialLinks: () => Array<{ platform: string; url: string }>;
}

/**
 * Global Settings Store (Zustand v5)
 * 
 * Pattern: Server-side fetch → Client-side store
 * Hydration: _hasHydrated flag prevents SSR mismatch
 * 
 * Usage:
 * 1. Server: fetchSettings() in layout.tsx
 * 2. Provider: Initialize store with server data
 * 3. Components: useSettingsStore((state) => state.settings)
 */
export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: null,
  _hasHydrated: false,

  setSettings: (settings) => set({ settings }),
  
  setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

  /**
   * Extract social links từ settings.extra
   * Expected format: { social_facebook: "url", social_instagram: "url", ... }
   */
  getSocialLinks: () => {
    const { settings } = get();
    if (!settings?.extra) return [];

    const links: Array<{ platform: string; url: string }> = [];
    const extra = settings.extra;

    // Map social_* keys to platform names
    const platformMap: Record<string, string> = {
      social_facebook: "Facebook",
      social_instagram: "Instagram",
      social_youtube: "YouTube",
      social_twitter: "Twitter",
      social_linkedin: "LinkedIn",
    };

    Object.entries(platformMap).forEach(([key, platform]) => {
      const url = extra[key];
      if (typeof url === "string" && url.trim().length > 0) {
        links.push({ platform, url });
      }
    });

    return links;
  },
}));

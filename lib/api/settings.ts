import { apiFetch } from "./client";

// TypeScript types matching Laravel API response structure
export interface SettingsResponse {
  data: {
    logo_url: string | null;
    favicon_url: string | null;
    site_name: string;
    hotline: string | null;
    address: string | null;
    hours: string | null;
    email: string | null;
    google_map_embed: string | null;
    meta_defaults: {
      title: string;
      description: string;
      keywords: string | null;
    };
    extra: Record<string, unknown>;
  };
}

export interface Settings {
  logo_url: string | null;
  favicon_url: string | null;
  site_name: string;
  hotline: string | null;
  address: string | null;
  hours: string | null;
  email: string | null;
  google_map_embed: string | null;
  meta_defaults: {
    title: string;
    description: string;
    keywords: string | null;
  };
  extra: Record<string, unknown>;
}

/**
 * Fetch global settings from Laravel API
 * Endpoint: GET /api/v1/settings
 * Cache: 5 minutes (300s)
 */
export async function fetchSettings(): Promise<Settings> {
  const response = await apiFetch<SettingsResponse>("/v1/settings", {
    next: { revalidate: 300, tags: ["settings"] },
  });

  return response.data;
}

/**
 * Fallback settings khi API fail (cho development/testing)
 */
export const FALLBACK_SETTINGS: Settings = {
  logo_url: "/media/logo.webp",
  favicon_url: "/media/logo.webp",
  site_name: "Thiên Kim Wine",
  hotline: "0938 110 888",
  address: "97 Pasteur, P. Bến Nghé, Quận 1",
  hours: "09:00 - 21:00 (T2-CN)",
  email: null,
  google_map_embed: null,
  meta_defaults: {
    title: "Thiên Kim Wine",
    description: "Thiên Kim Wine - Bộ sưu tập rượu vang cao cấp cho mọi dịp.",
    keywords: null,
  },
  extra: {},
};

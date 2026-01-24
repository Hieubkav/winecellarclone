import { apiFetch } from "./client";
import type { FooterConfig } from "@/lib/types/footer";

// TypeScript types matching Laravel API response structure
export type WatermarkPosition = 'none' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
export type WatermarkSize = '64x64' | '96x96' | '128x128' | '160x160' | '192x192';
export type WatermarkType = 'image' | 'text';
export type WatermarkTextSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
export type WatermarkTextPosition = 'top' | 'center' | 'bottom';

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
    footer_config: FooterConfig | null;
    product_watermark_url: string | null;
    product_watermark_position: WatermarkPosition | null;
    product_watermark_size: WatermarkSize | null;
    product_watermark_type: WatermarkType;
    product_watermark_text: string | null;
    product_watermark_text_size: WatermarkTextSize;
    product_watermark_text_position: WatermarkTextPosition;
    product_watermark_text_opacity: number;
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
  footer_config: FooterConfig | null;
  product_watermark_url: string | null;
  product_watermark_position: WatermarkPosition | null;
  product_watermark_size: WatermarkSize | null;
  product_watermark_type: WatermarkType;
  product_watermark_text: string | null;
  product_watermark_text_size: WatermarkTextSize;
  product_watermark_text_position: WatermarkTextPosition;
  product_watermark_text_opacity: number;
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
  footer_config: null,
  product_watermark_url: null,
  product_watermark_position: 'none',
  product_watermark_size: '128x128',
  product_watermark_type: 'image',
  product_watermark_text: null,
  product_watermark_text_size: 'medium',
  product_watermark_text_position: 'center',
  product_watermark_text_opacity: 50,
  meta_defaults: {
    title: "Thiên Kim Wine",
    description: "Thiên Kim Wine - Bộ sưu tập rượu vang cao cấp cho mọi dịp.",
    keywords: null,
  },
  extra: {},
};

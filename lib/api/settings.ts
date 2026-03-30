import { apiFetch, isBackendUnavailableError, shouldSkipApiFetchDuringBuild } from "./client";
import type { FooterConfig } from "@/lib/types/footer";
import type { ContactConfig } from "@/lib/types/contact";
import type { ProductContactCtaConfig } from "@/lib/types/product-contact-cta";

// TypeScript types matching Laravel API response structure
export type WatermarkPosition = 'none' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
export type WatermarkSize = '64x64' | '96x96' | '128x128' | '160x160' | '192x192';
export type WatermarkType = 'image' | 'text';
export type WatermarkTextSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
export type WatermarkTextPosition = 'top' | 'center' | 'bottom';
export type ProductDetailFaqPosition = 'after_description' | 'after_same_type' | 'after_related_products';

export interface ProductDetailFaqItem {
  question: string;
  answer: string;
}

export interface SettingsAuditMeta {
  cache_driver: string;
  cache_key: string;
  cache_hit: boolean;
  cache_read_ms: number;
  query_ms: number | null;
  serialize_ms: number | null;
  server_ms: number;
}

export interface SettingsResponse {
  data: {
    logo_url: string | null;
    logo_canonical_url?: string | null;
    favicon_url: string | null;
    favicon_canonical_url?: string | null;
    og_image_url: string | null;
    og_image_canonical_url?: string | null;
    site_name: string;
    hotline: string | null;
    address: string | null;
    hours: string | null;
    email: string | null;
    google_map_embed: string | null;
    footer_config: FooterConfig | null;
    contact_config: ContactConfig | null;
    product_contact_cta_config: ProductContactCtaConfig | null;
    product_shopee_link_enabled: boolean | null;
    product_mobile_main_image_height: number | null;
    product_detail_rules: string[] | null;
    product_detail_faq_enabled: boolean | null;
    product_detail_faq_title: string | null;
    product_detail_faq_eyebrow: string | null;
    product_detail_faq_items: ProductDetailFaqItem[] | null;
    product_detail_faq_position: ProductDetailFaqPosition | null;
    product_watermark_url: string | null;
    product_watermark_canonical_url?: string | null;
    product_watermark_position: WatermarkPosition | null;
    product_watermark_size: WatermarkSize | null;
    product_watermark_type: WatermarkType;
    product_watermark_text: string | null;
    product_watermark_text_size: WatermarkTextSize;
    product_watermark_text_position: WatermarkTextPosition;
    product_watermark_text_position_y: number | null;
    product_watermark_text_opacity: number;
    product_watermark_text_repeat: boolean;
    global_font_key: string | null;
    home_font_key: string | null;
    product_list_font_key: string | null;
    product_detail_font_key: string | null;
    article_list_font_key: string | null;
    article_detail_font_key: string | null;
    meta_defaults: {
      title: string;
      description: string;
      keywords: string | null;
    };
    site_tagline: string | null;
    organization_legal_name: string | null;
    organization_short_name: string | null;
    primary_phone: string | null;
    primary_email: string | null;
    price_range: string | null;
    social_links_schema: string[] | null;
    default_meta_title_template: string | null;
    default_og_title: string | null;
    default_og_description: string | null;
    indexing_enabled: boolean | null;
    extra: Record<string, unknown>;
  };
  meta?: {
    api_version?: string;
    timestamp?: string;
    audit?: SettingsAuditMeta;
  };
}

export interface Settings {
  logo_url: string | null;
  logo_canonical_url?: string | null;
  favicon_url: string | null;
  favicon_canonical_url?: string | null;
  og_image_url: string | null;
  og_image_canonical_url?: string | null;
  site_name: string;
  hotline: string | null;
  address: string | null;
  hours: string | null;
  email: string | null;
  google_map_embed: string | null;
  footer_config: FooterConfig | null;
  contact_config: ContactConfig | null;
  product_contact_cta_config: ProductContactCtaConfig | null;
  product_shopee_link_enabled: boolean | null;
  product_mobile_main_image_height: number | null;
  product_detail_rules: string[] | null;
  product_detail_faq_enabled: boolean | null;
  product_detail_faq_title: string | null;
  product_detail_faq_eyebrow: string | null;
  product_detail_faq_items: ProductDetailFaqItem[] | null;
  product_detail_faq_position: ProductDetailFaqPosition | null;
  product_watermark_url: string | null;
  product_watermark_canonical_url?: string | null;
  product_watermark_position: WatermarkPosition | null;
  product_watermark_size: WatermarkSize | null;
  product_watermark_type: WatermarkType;
  product_watermark_text: string | null;
  product_watermark_text_size: WatermarkTextSize;
  product_watermark_text_position: WatermarkTextPosition;
  product_watermark_text_position_y: number | null;
  product_watermark_text_opacity: number;
  product_watermark_text_repeat: boolean;
  global_font_key: string | null;
  home_font_key: string | null;
  product_list_font_key: string | null;
  product_detail_font_key: string | null;
  article_list_font_key: string | null;
  article_detail_font_key: string | null;
  meta_defaults: {
    title: string;
    description: string;
    keywords: string | null;
  };
  site_tagline: string | null;
  organization_legal_name: string | null;
  organization_short_name: string | null;
  primary_phone: string | null;
  primary_email: string | null;
  price_range: string | null;
  social_links_schema: string[] | null;
  default_meta_title_template: string | null;
  default_og_title: string | null;
  default_og_description: string | null;
  indexing_enabled: boolean | null;
  extra: Record<string, unknown>;
}

/**
 * Fetch global settings from Laravel API
 * Endpoint: GET /api/v1/settings
 * Cache: 5 minutes (300s)
 */
export async function fetchSettingsWithMeta(options?: { audit?: boolean }): Promise<SettingsResponse> {
  const params = options?.audit ? "?audit=1" : "";

  return apiFetch<SettingsResponse>(`/v1/settings${params}`, {
    cache: options?.audit ? "no-store" : undefined,
    next: options?.audit ? { revalidate: 0 } : { revalidate: 300, tags: ["settings"] },
  });
}

export async function fetchSettings(): Promise<Settings> {
  const response = await fetchSettingsWithMeta();

  return response.data;
}

let didWarnSettings = false;

export async function fetchSettingsSafe(): Promise<Settings> {
  if (shouldSkipApiFetchDuringBuild()) {
    return FALLBACK_SETTINGS;
  }

  try {
    return await fetchSettings();
  } catch (error) {
    if (!didWarnSettings) {
      didWarnSettings = true;
      const message = isBackendUnavailableError(error)
        ? "Backend chưa sẵn sàng, dùng fallback settings."
        : "Không lấy được settings, dùng fallback settings.";
      console.warn(message);
    }

    return FALLBACK_SETTINGS;
  }
}

/**
 * Fallback settings khi API fail (cho development/testing)
 */
export const FALLBACK_SETTINGS: Settings = {
  logo_url: "/media/logo.webp",
  logo_canonical_url: null,
  favicon_url: "/media/logo.webp",
  favicon_canonical_url: null,
  og_image_url: null,
  og_image_canonical_url: null,
  site_name: "Thiên Kim Wine",
  hotline: "0938 110 888",
  address: "97 Pasteur, P. Bến Nghé, Quận 1",
  hours: "09:00 - 21:00 (T2-CN)",
  email: null,
  google_map_embed: null,
  footer_config: null,
  contact_config: null,
  product_contact_cta_config: {
    mode: "contact_page",
    items: {
      facebook: null,
      zalo: null,
      phone: null,
      tiktok: null,
    },
  },
  product_shopee_link_enabled: false,
  product_mobile_main_image_height: null,
  product_detail_rules: null,
  product_detail_faq_enabled: true,
  product_detail_faq_title: null,
  product_detail_faq_eyebrow: null,
  product_detail_faq_items: null,
  product_detail_faq_position: 'after_description',
  product_watermark_url: null,
  product_watermark_canonical_url: null,
  product_watermark_position: 'none',
  product_watermark_size: '128x128',
  product_watermark_type: 'image',
  product_watermark_text: null,
  product_watermark_text_size: 'medium',
  product_watermark_text_position: 'center',
  product_watermark_text_position_y: 50,
  product_watermark_text_opacity: 50,
  product_watermark_text_repeat: false,
  global_font_key: 'be-vietnam-pro',
  home_font_key: null,
  product_list_font_key: null,
  product_detail_font_key: null,
  article_list_font_key: null,
  article_detail_font_key: null,
  meta_defaults: {
    title: "Thiên Kim Wine",
    description: "Thiên Kim Wine - Bộ sưu tập rượu vang cao cấp cho mọi dịp.",
    keywords: null,
  },
  site_tagline: "",
  organization_legal_name: null,
  organization_short_name: null,
  primary_phone: null,
  primary_email: null,
  price_range: null,
  social_links_schema: [],
  default_meta_title_template: null,
  default_og_title: null,
  default_og_description: null,
  indexing_enabled: true,
  extra: {},
};

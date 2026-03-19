import { apiFetch } from "@/lib/api/client";
import type { ProductContactCtaConfig } from "@/lib/types/product-contact-cta";

export interface AdminSetting {
  id: number;
  site_name: string | null;
  hotline: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  google_map_embed: string | null;
  footer_config: Record<string, unknown> | null;
  contact_config: Record<string, unknown> | null;
  product_contact_cta_config: ProductContactCtaConfig | null;
  product_shopee_link_enabled: boolean | null;
  product_mobile_main_image_height: number | null;
  meta_default_title: string | null;
  meta_default_description: string | null;
  meta_default_keywords: string | string[] | null;
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
  logo_image_id: number | null;
  logo_image_url: string | null;
  favicon_image_id: number | null;
  favicon_image_url: string | null;
  og_image_id: number | null;
  og_image_url: string | null;
  product_watermark_image_id: number | null;
  product_watermark_image_url: string | null;
  product_watermark_type: string | null;
  product_watermark_position: string | null;
  product_watermark_size: string | null;
  product_watermark_text: string | null;
  product_watermark_text_size: string | null;
  product_watermark_text_position: string | null;
  product_watermark_text_position_y: number | null;
  product_watermark_text_opacity: number | null;
  product_watermark_text_repeat: boolean | null;
  global_font_key: string | null;
  home_font_key: string | null;
  product_list_font_key: string | null;
  product_detail_font_key: string | null;
  article_list_font_key: string | null;
  article_detail_font_key: string | null;
  updated_at?: string;
}

export interface AdminSettingLite {
  id: number;
  product_shopee_link_enabled: boolean;
  updated_at?: string;
}

export async function fetchAdminSettings(): Promise<{ data: AdminSetting }> {
  return apiFetch("v1/admin/settings");
}

export async function fetchAdminSettingsLite(): Promise<{ data: AdminSettingLite }> {
  return apiFetch("v1/admin/settings/lite");
}

export async function updateSettings(
  data: Record<string, unknown>
): Promise<{ message?: string; data?: { updated_at?: string; watermark_changed?: boolean } }> {
  return apiFetch("v1/admin/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

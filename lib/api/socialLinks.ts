import { getImageUrl } from "@/lib/utils/image";
import { apiFetch } from "./client";

// TypeScript types matching Laravel API response
export interface SocialLinkResponse {
  data: SocialLink[];
  meta: {
    api_version: string;
    timestamp: string;
    audit?: {
      cache_hit: boolean;
      cache_key: string;
      server_ms: number;
    };
  };
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon_url: string;
  order: number;
}

/**
 * Fetch active social links from Laravel API
 * Endpoint: GET /api/v1/social-links
 * Cache: 5 minutes (300s)
 */
export async function fetchSocialLinksWithMeta(options?: { audit?: boolean }): Promise<SocialLinkResponse> {
  const params = options?.audit ? "?audit=1" : "";

  return apiFetch<SocialLinkResponse>(`/v1/social-links${params}`, {
    cache: options?.audit ? "no-store" : undefined,
    next: options?.audit ? { revalidate: 0 } : { revalidate: 300, tags: ["social-links"] },
  });
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const response = await fetchSocialLinksWithMeta();

  return response.data.map((item) => ({
    ...item,
    icon_url: item.icon_url ? getImageUrl(item.icon_url) : item.icon_url,
  }));
}

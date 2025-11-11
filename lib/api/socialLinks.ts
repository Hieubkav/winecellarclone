import { apiFetch } from "./client";

// TypeScript types matching Laravel API response
export interface SocialLinkResponse {
  data: SocialLink[];
  meta: {
    api_version: string;
    timestamp: string;
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
export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const response = await apiFetch<SocialLinkResponse>("/v1/social-links", {
    next: { revalidate: 300, tags: ["social-links"] },
  });

  return response.data;
}

import { cache } from "react";
import { apiFetch, isBackendUnavailableError, shouldSkipApiFetchDuringBuild } from "./client";
import type { ExtraAttr, ProductAttribute } from "@/lib/api/products";

// Base types từ backend
export interface ApiImage {
  id: number;
  url: string;
  alt: string | null;
}

export interface ApiTerm {
  id: number;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  show_contact_cta: boolean;
  cover_image_url: string | null;
  brand_term: ApiTerm | null;
  country_term: ApiTerm | null;
  category: ApiTerm | null;
  type: ApiTerm | null;
  badges: string[];
  alcohol_percent?: number | null;
  volume_ml?: number | null;
  attributes?: ProductAttribute[];
  extra_attrs?: Record<string, ExtraAttr>;
}

export interface ApiArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  reading_time: number | null;
  category_term: ApiTerm | null;
}

// Home component types
export interface HeroCarouselSlide {
  image: ApiImage;
  href: string;
  alt: string;
}

export interface HeroCarouselConfig {
  slides: HeroCarouselSlide[];
}

export interface DualBannerItem {
  image: ApiImage;
  href: string;
  alt: string;
}

export interface DualBannerConfig {
  banners: DualBannerItem[];
}

export interface CategoryGridItem {
  title: string;
  href: string;
  image: ApiImage;
}

export interface CategoryGridConfig {
  categories: CategoryGridItem[];
}

export interface FavouriteProductsConfig {
  title: string;
  subtitle: string | null;
  products: Array<{
    product: ApiProduct;
    badge: string | null;
    href: string;
  }>;
}

export interface BrandShowcaseItem {
  image: ApiImage;
  href: string | null;
  alt: string;
}

export interface BrandShowcaseConfig {
  title: string;
  brands: BrandShowcaseItem[];
}

export interface CollectionShowcaseConfig {
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: "wine" | "spirit" | "default";
  products: Array<{
    product: ApiProduct;
    badge: string | null;
    href: string;
  }>;
}

export interface EditorialSpotlightConfig {
  label: string | null;
  title: string;
  description: string | null;
  articles: Array<{
    article: ApiArticle;
    href: string;
  }>;
}

export interface FooterSocialLink {
  platform: "facebook" | "instagram" | "youtube" | "tiktok" | "zalo";
  url: string;
}

export interface FooterConfig {
  company_name: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  social_links: FooterSocialLink[];
}

export interface SpeedDialItem {
  icon_type: "home" | "phone" | "zalo" | "messenger" | "custom";
  icon_url: string | null;
  label: string;
  href: string;
  target: "_self" | "_blank";
}

export interface SpeedDialConfig {
  items: SpeedDialItem[];
}

export interface FaqConfig {
  title: string | null;
  eyebrow: string | null;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

// Union type cho tất cả component types
export type HomeComponentConfig =
  | HeroCarouselConfig
  | DualBannerConfig
  | CategoryGridConfig
  | FavouriteProductsConfig
  | BrandShowcaseConfig
  | CollectionShowcaseConfig
  | EditorialSpotlightConfig
  | FooterConfig
  | SpeedDialConfig
  | FaqConfig;

export interface HomeComponent {
  id: number;
  type:
    | "hero_carousel"
    | "dual_banner"
    | "category_grid"
    | "favourite_products"
    | "brand_showcase"
    | "collection_showcase"
    | "editorial_spotlight"
    | "footer"
    | "speed_dial"
    | "faq";
  order: number;
  config: HomeComponentConfig;
}

export interface HomeComponentAuditEntry {
  component_id: number;
  type: string;
  duration_ms: number;
  transformed: boolean;
}

export interface HomeComponentsResponse {
  data: HomeComponent[];
  meta: {
    cache_version: number;
    audit?: {
      total_ms?: number;
      components?: HomeComponentAuditEntry[];
      slowest_component?: HomeComponentAuditEntry | null;
      cache_hit?: boolean;
      cache_key?: string;
      server_ms?: number;
    };
  };
}

export interface SpeedDialResponse {
  data: HomeComponent | null;
  meta: {
    cache_version: number;
    audit?: {
      cache_hit: boolean;
      cache_key: string;
      server_ms: number;
    };
  };
}

export async function fetchHomeComponentsWithMeta(options?: { audit?: boolean; auditCached?: boolean }): Promise<HomeComponentsResponse> {
  const params = new URLSearchParams();
  if (options?.audit) params.set("audit", "1");
  if (options?.auditCached) params.set("audit_cached", "1");
  const query = params.toString();

  return apiFetch<HomeComponentsResponse>(`v1/home${query ? `?${query}` : ""}`, {
    cache: options?.audit || options?.auditCached ? "no-store" : undefined,
    next: options?.audit || options?.auditCached ? { revalidate: 0 } : { revalidate: 10 },
  });
}

export const fetchHomeComponents = cache(async (): Promise<HomeComponent[]> => {
  const response = await fetchHomeComponentsWithMeta();
  return response.data;
});

let didWarnHomeComponents = false;

export async function fetchHomeComponentsSafe(): Promise<HomeComponent[]> {
  if (shouldSkipApiFetchDuringBuild()) {
    return [];
  }

  try {
    return await fetchHomeComponents();
  } catch (error) {
    if (!didWarnHomeComponents) {
      didWarnHomeComponents = true;
      const message = isBackendUnavailableError(error)
        ? "Backend chưa sẵn sàng, dùng home components rỗng."
        : "Không lấy được home components, dùng danh sách rỗng.";
      console.warn(message);
    }

    return [];
  }
}

export async function fetchSpeedDialComponentWithMeta(options?: { audit?: boolean }): Promise<SpeedDialResponse> {
  const params = options?.audit ? "?audit=1" : "";

  return apiFetch<SpeedDialResponse>(`v1/home/speed-dial${params}`, {
    cache: options?.audit ? "no-store" : undefined,
    next: options?.audit ? { revalidate: 0 } : { revalidate: 10 },
  });
}

export const fetchSpeedDialComponent = cache(async (): Promise<HomeComponent | null> => {
  const response = await fetchSpeedDialComponentWithMeta();
  return response.data;
});

let didWarnSpeedDial = false;

export async function fetchSpeedDialComponentSafe(): Promise<HomeComponent | null> {
  if (shouldSkipApiFetchDuringBuild()) {
    return null;
  }

  try {
    return await fetchSpeedDialComponent();
  } catch (error) {
    if (!didWarnSpeedDial) {
      didWarnSpeedDial = true;
      const message = isBackendUnavailableError(error)
        ? "Backend chưa sẵn sàng, bỏ qua speed dial."
        : "Không lấy được speed dial, bỏ qua.";
      console.warn(message);
    }

    return null;
  }
}

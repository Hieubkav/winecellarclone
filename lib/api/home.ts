import { apiFetch } from "./client";

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
  term: ApiTerm;
  image: ApiImage | null;
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
  | SpeedDialConfig;

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
    | "speed_dial";
  order: number;
  config: HomeComponentConfig;
}

export interface HomeComponentsResponse {
  data: HomeComponent[];
  meta: {
    cache_version: number;
  };
}

export async function fetchHomeComponents(): Promise<HomeComponent[]> {
  const response = await apiFetch<HomeComponentsResponse>("v1/home", {
    // Revalidate mỗi 10 giây - balance giữa freshness và performance
    // Backend có cache version + on-demand revalidation để update nhanh hơn
    next: { revalidate: 10 },
  });
  return response.data;
}

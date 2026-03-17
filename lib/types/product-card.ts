import type { ExtraAttr, ProductAttribute } from "@/lib/api/products";

export interface ProductCardItem {
  id: number | string;
  name: string;
  slug?: string;
  href?: string;
  image?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  discountPercent?: number | null;
  showContactCta?: boolean;
  badges?: string[];
  brand?: string | null;
  brandSlug?: string | null;
  country?: string | null;
  countrySlug?: string | null;
  wineTypeSlug?: string | null;
  alcoholContent?: number | null;
  volume?: number | null;
  attributes?: ProductAttribute[];
  extraAttrs?: Record<string, ExtraAttr>;
}

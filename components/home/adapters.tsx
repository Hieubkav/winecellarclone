import type {
  CollectionShowcaseConfig,
  EditorialSpotlightConfig,
  FavouriteProductsConfig,
  HeroCarouselConfig,
  DualBannerConfig,
  BrandShowcaseConfig,
  CategoryGridConfig,
  FooterConfig,
  SpeedDialConfig,
  ApiProduct,
  ApiArticle,
} from "@/lib/api/home";
import type { HomeShowcaseProduct, HomeEditorial } from "@/data/homeCollections";
import { getImageUrl } from "@/lib/utils/article-content";

// Transform API product to HomeShowcaseProduct format
export function transformApiProduct(product: ApiProduct): HomeShowcaseProduct {
  const priceFormatted = product.price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price)
    : "";

  return {
    id: product.id.toString(),
    name: product.name,
    href: `/san-pham/${product.slug}`,
    image: getImageUrl(product.cover_image_url),
    country: product.country_term?.name || "",
    style: product.type?.name || "",
    price: priceFormatted,
    badge: product.badges?.[0],
  };
}

// Transform API article to HomeEditorial format
export function transformApiArticle(article: ApiArticle): HomeEditorial {
  const publishDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return {
    id: article.id.toString(),
    title: article.title,
    summary: article.excerpt || "",
    href: `/bai-viet/${article.slug}`,
    image: getImageUrl(article.cover_image_url),
    readingTime: article.reading_time ? `${article.reading_time} phút đọc` : "",
    highlight: "",
    category: article.category_term?.name || "",
    publishDate,
  };
}

// Props adapters for each component type
export function adaptCollectionShowcaseProps(config: CollectionShowcaseConfig) {
  return {
    title: config.title,
    subtitle: config.subtitle || undefined,
    description: config.description || undefined,
    ctaLabel: config.ctaLabel || undefined,
    ctaHref: config.ctaHref || "/san-pham",
    products: (config.products || [])
      .filter((item) => item && item.product && item.product.id && item.product.slug)
      .map((item) => transformApiProduct(item.product)),
    tone: (config.tone || "wine") as "wine" | "spirit",
  };
}

export function adaptEditorialSpotlightProps(config: EditorialSpotlightConfig) {
  return {
    label: config.label || undefined,
    title: config.title,
    description: config.description || undefined,
    articles: (config.articles || [])
      .filter((item) => item && item.article && item.article.id && item.article.slug)
      .map((item) => transformApiArticle(item.article)),
  };
}

export function adaptFavouriteProductsProps(config: FavouriteProductsConfig) {
  return {
    title: config.title,
    subtitle: config.subtitle || undefined,
    products: (config.products || [])
      .filter((item) => item && item.product && item.product.id && item.product.slug)
      .map((item) => transformApiProduct(item.product)),
  };
}

export function adaptHeroCarouselProps(config: HeroCarouselConfig) {
  return {
    slides: (config.slides || [])
      .filter((slide) => slide?.image?.url)
      .map((slide) => ({
        image: getImageUrl(slide.image.url),
        alt: slide.alt || slide.image.alt || "",
        href: slide.href,
      })),
  };
}

export function adaptDualBannerProps(config: DualBannerConfig) {
  return {
    banners: (config.banners || [])
      .filter((banner) => banner?.image?.url)
      .map((banner) => ({
        image: getImageUrl(banner.image.url),
        alt: banner.alt || banner.image.alt || "",
        href: banner.href,
      })),
  };
}

export function adaptBrandShowcaseProps(config: BrandShowcaseConfig) {
  return {
    title: config.title,
    brands: (config.brands || [])
      .filter((brand) => brand?.image?.url)
      .map((brand) => ({
        image: getImageUrl(brand.image.url),
        alt: brand.alt || brand.image.alt || "",
        href: brand.href,
      })),
  };
}

export function adaptCategoryGridProps(config: CategoryGridConfig) {
  return {
    categories: (config.categories || [])
      .filter((item) => item?.title) // Only require title, image is optional
      .map((item) => ({
        title: item.title,
        href: item.href,
        image: item.image?.url ? getImageUrl(item.image.url) : null, // Allow null image
        alt: item.image?.alt || item.title,
      })),
  };
}

export function adaptFooterProps(config: FooterConfig) {
  return {
    companyName: config.company_name || "Thiên Kim Wine",
    description: config.description || undefined,
    email: config.email || undefined,
    phone: config.phone || undefined,
    address: config.address || undefined,
    socialLinks: config.social_links || [],
  };
}

export function adaptSpeedDialProps(config: SpeedDialConfig) {
  return {
    items: (config.items || [])
      .filter((item) => item && item.label && item.href)
      .map((item) => ({
        iconType: item.icon_type,
        iconUrl: item.icon_url ? getImageUrl(item.icon_url) : null,
        label: item.label,
        href: item.href,
        target: item.target,
      })),
  };
}

import dynamic from "next/dynamic";
import {
  fetchHomeComponents,
  type HomeComponent,
  type HeroCarouselConfig,
  type DualBannerConfig,
  type CategoryGridConfig,
  type BrandShowcaseConfig,
  type CollectionShowcaseConfig,
  type EditorialSpotlightConfig,
  type FavouriteProductsConfig,
  type FooterConfig,
  type FaqConfig,
} from "@/lib/api/home";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FavouriteProducts from "@/components/home/FavouriteProducts";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";
import {
  ItemListSchema,
  LocalBusinessSchema,
  OrganizationSchema,
  WebPageSchema,
  WebSiteSchema,
} from "@/lib/seo/structured-data";
import { getImageUrl, getProductImageUrl } from "@/lib/utils/image";

const BrandShowcase = dynamic(() => import("@/components/home/BrandShowcase"));
const CollectionShowcase = dynamic(() => import("@/components/home/CollectionShowcase"));
const EditorialSpotlight = dynamic(() => import("@/components/home/EditorialSpotlight"));
const FaqSection = dynamic(() => import("@/components/home/FaqSection").then((mod) => mod.default));
const HomeFooter = dynamic(() => import("@/components/home/Footer"));
import {
  adaptHeroCarouselProps,
  adaptDualBannerProps,
  adaptCategoryGridProps,
  adaptBrandShowcaseProps,
  adaptCollectionShowcaseProps,
  adaptEditorialSpotlightProps,
  adaptFavouriteProductsProps,
  adaptFooterProps,
  adaptFaqProps,
} from "@/components/home/adapters";

// Revalidate trang chủ mỗi 5 phút (300 giây)
export const revalidate = 300;

export default async function Home() {
  let components: HomeComponent[] = [];
  let settings = FALLBACK_SETTINGS;

  try {
    const [componentsResult, settingsResult] = await Promise.all([
      fetchHomeComponents().catch(() => null),
      fetchSettings().catch(() => null),
    ]);
    components = componentsResult ?? [];
    settings = settingsResult ?? FALLBACK_SETTINGS;
  } catch (error) {
    console.error("Failed to fetch home components:", error);
    // Fallback to empty array if API fails
  }

  const homeFontStyle = getScopedFontStyle(settings, "home");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
  const organizationName = settings.site_name || "Thiên Kim Wine";
  const organizationDescription = settings.meta_defaults.description;
  const organizationLogo = getImageUrl(
    settings.logo_url || settings.og_image_url || FALLBACK_SETTINGS.logo_url
  );
  const homepageTitle = settings.meta_defaults.title || organizationName;
  const sameAsLinks = (settings.social_links_schema || [])
    .filter((link) => typeof link === "string" && link.trim().length > 0);

  const favouriteProductsComponent = components.find(
    (component) => component.type === "favourite_products"
  );
  const favouriteProductsConfig = favouriteProductsComponent?.config as
    | FavouriteProductsConfig
    | undefined;
  const itemListItems = favouriteProductsConfig?.products
    .map((entry) => ({
      name: entry.product.name,
      url: `${normalizedSiteUrl}/san-pham/${entry.product.slug}`,
      image: entry.product.cover_image_url
        ? getProductImageUrl(entry.product.cover_image_url)
        : undefined,
      price: entry.product.price ?? undefined,
      currency: "VND",
    }))
    .filter((item) => item.name && item.url);

  return (
    <>
      <OrganizationSchema
        name={organizationName}
        url={normalizedSiteUrl}
        logo={organizationLogo}
        description={organizationDescription}
        address={settings.address || undefined}
        telephone={settings.primary_phone || settings.hotline || undefined}
        email={settings.primary_email || settings.email || undefined}
        socialLinks={sameAsLinks.map((link) => ({ url: link, platform: "other" }))}
      />
      <LocalBusinessSchema
        name={settings.organization_legal_name || organizationName}
        url={normalizedSiteUrl}
        logo={organizationLogo}
        image={organizationLogo}
        description={organizationDescription}
        address={settings.address || undefined}
        telephone={settings.primary_phone || settings.hotline || undefined}
        email={settings.primary_email || settings.email || undefined}
        priceRange={settings.price_range || undefined}
        sameAs={sameAsLinks}
      />
      <WebSiteSchema
        name={organizationName}
        url={normalizedSiteUrl}
        description={organizationDescription}
        searchUrl={`${normalizedSiteUrl}/filter?q={search_term_string}`}
      />
      <WebPageSchema
        name={homepageTitle}
        url={normalizedSiteUrl}
        description={organizationDescription}
      />
      {itemListItems && itemListItems.length > 0 ? (
        <ItemListSchema
          name="Sản phẩm nổi bật"
          description="Danh sách sản phẩm nổi bật tại Thiên Kim Wine"
          url={normalizedSiteUrl}
          items={itemListItems}
        />
      ) : null}
      <main className="tk-type-system bg-white text-[#1C1C1C]" style={homeFontStyle}>
        {components.map((component) => {
          switch (component.type) {
            case "hero_carousel":
              return (
                <HeroCarousel
                  key={component.id}
                  {...adaptHeroCarouselProps(component.config as HeroCarouselConfig)}
                />
              );

            case "dual_banner":
              return (
                <DualBanner
                  key={component.id}
                  {...adaptDualBannerProps(component.config as DualBannerConfig)}
                />
              );

            case "category_grid":
              return (
                <CategoryGrid
                  key={component.id}
                  {...adaptCategoryGridProps(component.config as CategoryGridConfig)}
                />
              );

            case "favourite_products":
              return (
                <FavouriteProducts
                  key={component.id}
                  {...adaptFavouriteProductsProps(component.config as FavouriteProductsConfig)}
                />
              );

            case "brand_showcase":
              return (
                <BrandShowcase
                  key={component.id}
                  {...adaptBrandShowcaseProps(component.config as BrandShowcaseConfig)}
                />
              );

            case "collection_showcase":
              return (
                <CollectionShowcase
                  key={component.id}
                  {...adaptCollectionShowcaseProps(component.config as CollectionShowcaseConfig)}
                />
              );

            case "editorial_spotlight":
              return (
                <EditorialSpotlight
                  key={component.id}
                  {...adaptEditorialSpotlightProps(component.config as EditorialSpotlightConfig)}
                />
              );

            case "faq":
              return (
                <FaqSection
                  key={component.id}
                  {...adaptFaqProps(component.config as FaqConfig)}
                />
              );

            case "footer":
              return (
                <HomeFooter
                  key={component.id}
                  {...adaptFooterProps(component.config as FooterConfig)}
                />
              );

            default:
              return null;
          }
        })}
      </main>
    </>
  );
}

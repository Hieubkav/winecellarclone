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
} from "@/lib/api/home";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FavouriteProducts from "@/components/home/FavouriteProducts";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const BrandShowcase = dynamic(() => import("@/components/home/BrandShowcase"));
const CollectionShowcase = dynamic(() => import("@/components/home/CollectionShowcase"));
const EditorialSpotlight = dynamic(() => import("@/components/home/EditorialSpotlight"));
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

  return (
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
  );
}

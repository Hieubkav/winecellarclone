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
import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FavouriteProducts from "@/components/home/FavouriteProducts";
import BrandShowcase from "@/components/home/BrandShowcase";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import EditorialSpotlight from "@/components/home/EditorialSpotlight";
import HomeFooter from "@/components/home/Footer";
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

  try {
    components = await fetchHomeComponents();
  } catch (error) {
    console.error("Failed to fetch home components:", error);
    // Fallback to empty array if API fails
  }

  return (
    <main className="tk-type-system bg-white text-[#1C1C1C]">
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

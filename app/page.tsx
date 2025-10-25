import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner"
import CategoryGrid from "@/components/home/CategoryGrid";
import FavouriteProducts from "@/components/home/FavouriteProducts";

export default function Home() {
  return (
    <main className="bg-white text-[#1C1C1C]">
      <HeroCarousel />
      {/* <DualBanner /> */}
      <CategoryGrid />
      <FavouriteProducts />
    </main>
  );
}

import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner"
import CategoryGrid from "@/components/home/CategoryGrid";

export default function Home() {
  return (
      <div>
        <HeroCarousel />
        <DualBanner />
        <CategoryGrid />
      </div>
  );
}

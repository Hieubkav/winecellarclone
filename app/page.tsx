import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner"
import CategoryGrid from "@/components/home/CategoryGrid";

export default function Home() {
  return (
    <main className="bg-white text-[#1C1C1C]">
      <HeroCarousel />
      <DualBanner />
      <CategoryGrid />
    </main>
  );
}

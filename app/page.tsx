import HeroCarousel from "@/components/home/carouselBaner";
import DualBanner from "@/components/home/DualBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FavouriteProducts from "@/components/home/FavouriteProducts";
import BrandShowcase from "@/components/home/BrandShowcase";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import EditorialSpotlight from "@/components/home/EditorialSpotlight";
import { wineShowcaseProducts, spiritShowcaseProducts, homeEditorials } from "@/data/homeCollections";

export default function Home() {
  return (
    <main className="bg-white text-[#1C1C1C]">
      <HeroCarousel />
      <DualBanner />
      <CategoryGrid />
      <FavouriteProducts />
      <BrandShowcase />
      
      <CollectionShowcase
        title="Rượu Vang"
        subtitle="Rượu Vang"
        description="Khám phá những dòng rượu vang cao cấp được tuyển chọn cẩn thận từ khắp nơi trên thế giới"
        ctaLabel="Xem Thêm"
        ctaHref="/wines"
        products={wineShowcaseProducts}
        tone="wine"
      />
      <CollectionShowcase
        title="Rượu Mạnh"
        subtitle="Rượu Mạnh"
        description="Trải nghiệm những dòng rượu mạnh hảo hạng từ các thương hiệu danh tiếng thế giới"
        ctaLabel="Xem Thêm"
        ctaHref="/spirits"
        products={spiritShowcaseProducts}
        tone="spirit"
      />
      <EditorialSpotlight
        label="Chuyện rượu"
        title="Bài viết"
        description="Tập trung vào trải nghiệm sang trọng nhưng không làm khó người đọc, mỗi bài viết là một ghi chú tinh tế từ Thiên Kim Wine."
        articles={homeEditorials}
      />
    </main>
  );
}
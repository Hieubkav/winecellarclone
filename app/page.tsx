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
      {/* <DualBanner /> */}
      <CategoryGrid />
      <FavouriteProducts />
      <BrandShowcase />
      
      <CollectionShowcase
        title="Bộ Sưu Tập Rượu Vang Nổi Bật"
        subtitle="Rượu Vang"
        description="Khám phá những dòng rượu vang cao cấp được tuyển chọn cẩn thận từ khắp nơi trên thế giới"
        ctaLabel="Xem Thêm Rượu Vang"
        ctaHref="/wines"
        products={wineShowcaseProducts}
        tone="wine"
      />
      <CollectionShowcase
        title="Bộ Sưu Tập Rượu Mạnh Đẳng Cấp"
        subtitle="Rượu Mạnh"
        description="Trải nghiệm những dòng rượu mạnh hảo hạng từ các thương hiệu danh tiếng thế giới"
        ctaLabel="Xem Thêm Rượu Mạnh"
        ctaHref="/spirits"
        products={spiritShowcaseProducts}
        tone="spirit"
      />
      <EditorialSpotlight
        label="Chuyện rượu"
        title="Góc bài viết tối giản"
        description="Tập trung vào trải nghiệm sang trọng nhưng không làm khó người đọc, mỗi bài viết là một ghi chú tinh tế từ Thiên Kim Wine."
        articles={homeEditorials}
      />
    </main>
  );
}
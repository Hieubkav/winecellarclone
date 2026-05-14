import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Bộ sưu tập rượu chọn lọc | Thiên Kim Wine",
  description: "Bộ sưu tập rượu bán chạy, hàng mới về, cao cấp, khuyến mãi và dùng hằng ngày tại Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/bo-suu-tap` },
};

export default function CollectionsPage() {
  return (
    <SeoHubPage
      eyebrow="Bộ sưu tập"
      title="Bộ sưu tập rượu chọn lọc"
      description="Các nhóm sản phẩm được gom theo nhu cầu mua sắm thực tế để khách hàng tìm nhanh hơn và tăng internal linking cho SEO."
      links={[
        { label: "Bán chạy", href: "/bo-suu-tap/ban-chay", description: "Những sản phẩm được khách hàng chọn nhiều." },
        { label: "Hàng mới về", href: "/bo-suu-tap/hang-moi-ve", description: "Các chai rượu và phụ kiện mới cập nhật." },
        { label: "Cao cấp", href: "/bo-suu-tap/cao-cap", description: "Lựa chọn phù hợp biếu tặng và sưu tầm." },
        { label: "Uống hằng ngày", href: "/bo-suu-tap/uong-hang-ngay", description: "Sản phẩm dễ uống, dễ dùng trong bữa ăn." },
      ]}
    />
  );
}

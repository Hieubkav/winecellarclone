import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Thương hiệu rượu vang & rượu mạnh | Thiên Kim Wine",
  description: "Khám phá các thương hiệu rượu vang, whisky, cognac và phụ kiện nổi bật tại Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/thuong-hieu` },
};

export default function BrandsPage() {
  return (
    <SeoHubPage
      eyebrow="Thương hiệu"
      title="Thương hiệu rượu nổi bật"
      description="Tổng hợp các nhà làm vang, thương hiệu rượu mạnh và phụ kiện được chọn lọc để khách hàng dễ so sánh, khám phá và chọn đúng sản phẩm."
      links={[
        { label: "Thương hiệu nổi bật", href: "/thuong-hieu/noi-bat", description: "Các thương hiệu được quan tâm và tư vấn nhiều." },
        { label: "Rượu vang", href: "/san-pham/ruou-vang", description: "Xem sản phẩm rượu vang theo thương hiệu, xuất xứ và phong cách." },
        { label: "Rượu mạnh", href: "/san-pham/ruou-manh", description: "Khám phá whisky, cognac, gin và các dòng rượu mạnh." },
      ]}
    />
  );
}

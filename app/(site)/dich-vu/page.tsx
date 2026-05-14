import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Dịch vụ tư vấn & quà tặng doanh nghiệp | Thiên Kim Wine",
  description: "Dịch vụ đặt hàng doanh nghiệp, in logo, tư vấn chọn quà và tặng quà từ xa tại Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/dich-vu` },
};

export default function ServicesPage() {
  return (
    <SeoHubPage
      eyebrow="Dịch vụ"
      title="Dịch vụ rượu vang và quà tặng"
      description="Các dịch vụ hỗ trợ doanh nghiệp và cá nhân chọn rượu, cá nhân hóa quà tặng và gửi quà chuyên nghiệp."
      links={[
        { label: "Đặt hàng doanh nghiệp", href: "/dich-vu/dat-hang-doanh-nghiep" },
        { label: "In logo / tên doanh nghiệp", href: "/dich-vu/in-logo-ten-doanh-nghiep" },
        { label: "Tư vấn chọn quà", href: "/dich-vu/tu-van-chon-qua" },
        { label: "Tặng quà từ xa", href: "/dich-vu/tang-qua-tu-xa" },
      ]}
    />
  );
}

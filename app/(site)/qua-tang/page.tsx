import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Quà tặng rượu vang & rượu mạnh | Thiên Kim Wine",
  description: "Tư vấn quà tặng rượu vang, rượu mạnh, quà Tết, hộp quà và quà doanh nghiệp tại Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/qua-tang` },
};

export default function GiftsPage() {
  return (
    <SeoHubPage
      eyebrow="Quà tặng"
      title="Quà tặng rượu sang trọng"
      description="Điểm vào cho các nhu cầu quà biếu cá nhân, doanh nghiệp và dịp lễ Tết, giúp khách hàng chọn đúng món quà theo ngân sách và người nhận."
      links={[
        { label: "Quà tặng doanh nghiệp", href: "/qua-tang/doanh-nghiep" },
        { label: "Quà tặng rượu vang", href: "/qua-tang/ruou-vang" },
        { label: "Quà tặng rượu mạnh", href: "/qua-tang/ruou-manh" },
        { label: "Quà Tết", href: "/qua-tang/tet" },
        { label: "Hộp quà / túi quà", href: "/qua-tang/hop-tui-qua" },
      ]}
    />
  );
}

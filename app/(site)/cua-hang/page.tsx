import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Hệ thống cửa hàng | Thiên Kim Wine",
  description: "Thông tin hệ thống cửa hàng, danh sách chi nhánh và giờ mở cửa của Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/cua-hang` },
};

export default function StoresPage() {
  return (
    <SeoHubPage
      eyebrow="Cửa hàng"
      title="Hệ thống cửa hàng Thiên Kim Wine"
      description="Khu vực tổng hợp thông tin cửa hàng để khách hàng tra cứu địa chỉ, giờ mở cửa và chi nhánh gần nhất."
      links={[
        { label: "Danh sách cửa hàng", href: "/cua-hang/danh-sach" },
        { label: "Giờ mở cửa", href: "/cua-hang/gio-mo-cua" },
        { label: "Liên hệ tư vấn", href: "/lien-he" },
      ]}
    />
  );
}

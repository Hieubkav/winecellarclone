import type { Metadata } from "next";
import SeoSimplePage from "@/components/seo/SeoSimplePage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Tin tức rượu vang & thị trường | Thiên Kim Wine",
  description: "Tin tức về rượu vang, rượu mạnh, xu hướng quà tặng và hoạt động mới từ Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/tin-tuc` },
};

export default function NewsPage() {
  return (
    <SeoSimplePage
      eyebrow="Tin tức"
      title="Tin tức"
      description="Cập nhật xu hướng rượu vang, rượu mạnh, quà tặng và hoạt động mới từ Thiên Kim Wine."
      parentHref="/kien-thuc"
      parentLabel="Kiến thức"
    />
  );
}

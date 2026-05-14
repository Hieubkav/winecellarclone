import type { Metadata } from "next";
import SeoSimplePage from "@/components/seo/SeoSimplePage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Sự kiện rượu vang & tasting | Thiên Kim Wine",
  description: "Thông tin sự kiện, tasting, hoạt động thương hiệu và chương trình trải nghiệm từ Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/su-kien` },
};

export default function EventsPage() {
  return (
    <SeoSimplePage
      eyebrow="Sự kiện"
      title="Sự kiện"
      description="Thông tin các buổi tasting, sự kiện rượu vang và hoạt động trải nghiệm do Thiên Kim Wine tổ chức hoặc đồng hành."
      parentHref="/kien-thuc"
      parentLabel="Kiến thức"
    />
  );
}

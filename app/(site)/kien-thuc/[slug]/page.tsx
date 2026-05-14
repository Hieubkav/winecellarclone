import type { Metadata } from "next";
import SeoSimplePage from "@/components/seo/SeoSimplePage";
import { formatSlugTitle } from "@/lib/seo/ia-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = `${formatSlugTitle(slug)} | Kiến thức | Thiên Kim Wine`;
  return {
    title,
    description: `Chuyên mục ${formatSlugTitle(slug).toLowerCase()} trong thư viện kiến thức rượu vang và rượu mạnh của Thiên Kim Wine.`,
    alternates: { canonical: `${SITE_URL}/kien-thuc/${slug}` },
  };
}

export default async function KnowledgeChildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = formatSlugTitle(slug);
  return (
    <SeoSimplePage
      eyebrow="Kiến thức"
      title={title}
      description={`Chuyên mục ${title.toLowerCase()} giúp khách hàng chọn, thưởng thức và bảo quản rượu đúng cách. Nội dung chi tiết sẽ được cập nhật theo chiến lược content SEO.`}
      parentHref="/kien-thuc"
      parentLabel="Kiến thức"
    />
  );
}

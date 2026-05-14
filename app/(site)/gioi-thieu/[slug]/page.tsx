import type { Metadata } from "next";
import SeoSimplePage from "@/components/seo/SeoSimplePage";
import { buildStaticChildCopy } from "@/lib/seo/ia-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";
const HUB = "gioi-thieu";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const copy = buildStaticChildCopy(HUB, slug);
  return { title: copy.title, description: copy.description, alternates: { canonical: `${SITE_URL}/${HUB}/${slug}` } };
}

export default async function AboutChildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const copy = buildStaticChildCopy(HUB, slug);
  return <SeoSimplePage eyebrow={copy.eyebrow} title={copy.heading} description={copy.description} parentHref={`/${HUB}`} parentLabel="Giới thiệu" />;
}

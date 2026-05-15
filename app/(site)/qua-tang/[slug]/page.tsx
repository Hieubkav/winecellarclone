import type { Metadata } from "next";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import SeoSimplePage from "@/components/seo/SeoSimplePage";
import { fetchArticleDetailSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";
import { buildStaticChildCopy } from "@/lib/seo/ia-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";
const HUB = "qua-tang";
const CATEGORY_KEY = "qua-tang";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleDetailSafe(slug);
  if (article?.category_key === CATEGORY_KEY) {
    return {
      title: article.meta.title || article.title,
      description: article.meta.description || article.excerpt || undefined,
      alternates: { canonical: `${SITE_URL}/${HUB}/${article.slug}` },
    };
  }

  const copy = buildStaticChildCopy(HUB, slug);
  return { title: copy.title, description: copy.description, alternates: { canonical: `${SITE_URL}/${HUB}/${slug}` } };
}

export default async function GiftChildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    fetchArticleDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (article?.category_key === CATEGORY_KEY) {
    const articleDetailFontStyle = getScopedFontStyle(settings, "article_detail");
    return (
      <ArticleDetailPage
        article={article}
        fontFamily={articleDetailFontStyle.fontFamily}
        canonicalPath={`/${HUB}/${article.slug}`}
        parentHref={`/${HUB}`}
        parentLabel="Quà tặng"
      />
    );
  }

  const copy = buildStaticChildCopy(HUB, slug);
  return <SeoSimplePage eyebrow={copy.eyebrow} title={copy.heading} description={copy.description} parentHref={`/${HUB}`} parentLabel="Quà tặng" />;
}

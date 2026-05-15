import type { Metadata } from "next";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import SeoSimplePage from "@/components/seo/SeoSimplePage";
import { fetchArticleDetailSafe, fetchContentPageSafe } from "@/lib/api/articles";
import { buildStaticChildCopy } from "@/lib/seo/ia-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";
const HUB = "ho-tro";
const CATEGORY_KEY = "chinh-sach";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchContentPageSafe(HUB, slug);
  if (article) {
    return {
      title: article.meta.title || article.title,
      description: article.meta.description || article.excerpt || undefined,
      alternates: { canonical: `${SITE_URL}/${HUB}/${slug}` },
    };
  }

  const categoryArticle = await fetchArticleDetailSafe(slug);
  if (categoryArticle?.category_key === CATEGORY_KEY) {
    return {
      title: categoryArticle.meta.title || categoryArticle.title,
      description: categoryArticle.meta.description || categoryArticle.excerpt || undefined,
      alternates: { canonical: `${SITE_URL}/${HUB}/${categoryArticle.slug}` },
    };
  }

  const copy = buildStaticChildCopy(HUB, slug);
  return { title: copy.title, description: copy.description, alternates: { canonical: `${SITE_URL}/${HUB}/${slug}` } };
}

export default async function SupportChildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchContentPageSafe(HUB, slug);
  if (article) {
    return (
      <ArticleDetailPage
        article={article}
        canonicalPath={`/${HUB}/${slug}`}
        parentHref={`/${HUB}`}
        parentLabel="Hỗ trợ"
      />
    );
  }

  const categoryArticle = await fetchArticleDetailSafe(slug);
  if (categoryArticle?.category_key === CATEGORY_KEY) {
    return (
      <ArticleDetailPage
        article={categoryArticle}
        canonicalPath={`/${HUB}/${categoryArticle.slug}`}
        parentHref={`/${HUB}`}
        parentLabel="Hỗ trợ"
      />
    );
  }

  const copy = buildStaticChildCopy(HUB, slug);
  return <SeoSimplePage eyebrow={copy.eyebrow} title={copy.heading} description={copy.description} parentHref={`/${HUB}`} parentLabel="Hỗ trợ" />;
}

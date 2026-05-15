import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { fetchArticleDetailSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";
const HUB = "su-kien";
const CATEGORY_KEY = "su-kien";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleDetailSafe(slug);
  if (!article || article.category_key !== CATEGORY_KEY) {
    return {
      title: "Bài viết không tồn tại",
      description: "Bài viết này không tồn tại hoặc đã bị xóa.",
    };
  }

  return {
    title: article.meta.title || article.title,
    description: article.meta.description || article.excerpt || undefined,
    alternates: { canonical: `${SITE_URL}/${HUB}/${article.slug}` },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    fetchArticleDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (!article || article.category_key !== CATEGORY_KEY) {
    notFound();
  }

  const articleDetailFontStyle = getScopedFontStyle(settings, "article_detail");
  return (
    <ArticleDetailPage
      article={article}
      fontFamily={articleDetailFontStyle.fontFamily}
      canonicalPath={`/${HUB}/${article.slug}`}
      parentHref={`/${HUB}`}
      parentLabel="Sự kiện"
    />
  );
}

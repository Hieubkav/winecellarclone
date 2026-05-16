export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamicParams = true;
export const runtime = "nodejs";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { fetchArticleDetailByCategorySafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

type ArticleCategoryDetailParams = {
  categorySlug: string;
  articleSlug: string;
};

export async function generateMetadata({ params }: { params: Promise<ArticleCategoryDetailParams> }): Promise<Metadata> {
  const { categorySlug, articleSlug } = await params;
  const article = await fetchArticleDetailByCategorySafe(categorySlug, articleSlug);

  if (!article) {
    return {
      title: "Bài viết không tồn tại",
      description: "Bài viết này không tồn tại hoặc đã bị xóa.",
    };
  }

  return {
    title: article.meta.title || article.title,
    description: article.meta.description || article.excerpt || undefined,
    alternates: { canonical: `${SITE_URL}/${categorySlug}/${article.slug}` },
  };
}

export default async function ArticleCategoryDetailRoute({ params }: { params: Promise<ArticleCategoryDetailParams> }) {
  const { categorySlug, articleSlug } = await params;
  const [article, settings] = await Promise.all([
    fetchArticleDetailByCategorySafe(categorySlug, articleSlug),
    fetchSettingsSafe(),
  ]);

  if (!article) {
    notFound();
  }

  const articleDetailFontStyle = getScopedFontStyle(settings, "article_detail");
  const categoryName = article.article_category?.name || categorySlug;

  return (
    <ArticleDetailPage
      article={article}
      fontFamily={articleDetailFontStyle.fontFamily}
      canonicalPath={`/${categorySlug}/${article.slug}`}
      parentHref={`/${categorySlug}`}
      parentLabel={categoryName}
    />
  );
}

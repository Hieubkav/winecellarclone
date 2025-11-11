// ISR: Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;
export const dynamicParams = true;
export const runtime = "nodejs";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { fetchArticleDetail } from "@/lib/api/articles";

type ArticleDetailRouteParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleDetailRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleDetail(slug);

  if (!article) {
    return {
      title: "Bài viết không tồn tại",
      description: "Bài viết này không tồn tại hoặc đã bị xóa.",
    };
  }

  return {
    title: article.meta.title || article.title,
    description: article.meta.description || article.excerpt || undefined,
    openGraph: {
      title: article.meta.title || article.title,
      description: article.meta.description || article.excerpt || undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: article.author ? [article.author.name] : [],
    },
  };
}

export default async function ArticleDetailRoute({
  params,
}: {
  params: Promise<ArticleDetailRouteParams>;
}) {
  const { slug } = await params;
  const article = await fetchArticleDetail(slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailPage article={article} />;
}

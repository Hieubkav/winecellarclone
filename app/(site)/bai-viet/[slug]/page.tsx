// ISR: Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;
export const dynamicParams = true;
export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { fetchArticleDetail } from "@/lib/api/articles";
import { ArticleSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";

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

  const articleUrl = `${SITE_URL}/bai-viet/${article.slug}`;

  return (
    <>
      {/* SEO: Article Structured Data */}
      <ArticleSchema
        headline={article.title}
        description={article.excerpt || undefined}
        image={article.cover_image_url || undefined}
        datePublished={article.published_at}
        dateModified={article.updated_at}
        author={article.author?.name}
        url={articleUrl}
      />

      {/* SEO: Breadcrumb */}
      <BreadcrumbSchema
        items={[
          { name: 'Trang chủ', url: SITE_URL },
          { name: 'Bài viết', url: `${SITE_URL}/bai-viet` },
          { name: article.title, url: articleUrl },
        ]}
      />

      <ArticleDetailPage article={article} />
    </>
  );
}

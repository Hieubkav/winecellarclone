export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamicParams = true;
export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/components/articles/ArticleDetailPage";
import { fetchArticleDetailSafe } from "@/lib/api/articles";
import { ArticleSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";
import { fetchSettingsSafe, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";
import { getImageUrl } from "@/lib/utils/image";

type ArticleDetailRouteParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleDetailRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    fetchArticleDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (!article) {
    return {
      title: "Bài viết không tồn tại",
      description: "Bài viết này không tồn tại hoặc đã bị xóa.",
    };
  }

  const siteName = settings.site_name || "Thiên Kim Wine";
  const canonicalUrl = `${SITE_URL}/bai-viet/${article.slug}`;
  const ogImageSource = article.cover_image_canonical_url
    || article.cover_image_url
    || "/placeholder/article.svg";
  const ogImageResolved = getImageUrl(ogImageSource);
  const ogImageUrl = ogImageResolved.startsWith("/")
    ? `${SITE_URL}${ogImageResolved}`
    : ogImageResolved;

  return {
    title: article.meta.title || article.title,
    description: article.meta.description || article.excerpt || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.meta.title || article.title,
      description: article.meta.description || article.excerpt || undefined,
      images: ogImageUrl ? [ogImageUrl] : [],
      url: canonicalUrl,
      siteName,
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: article.author ? [article.author.name] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title || article.title,
      description: article.meta.description || article.excerpt || undefined,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function ArticleDetailRoute({
  params,
}: {
  params: Promise<ArticleDetailRouteParams>;
}) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    fetchArticleDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (!article) {
    notFound();
  }
  const articleDetailFontStyle = getScopedFontStyle(settings, "article_detail");

  const articleUrl = `${SITE_URL}/bai-viet/${article.slug}`;
  const publisherLogo = settings.logo_url || settings.og_image_url || FALLBACK_SETTINGS.logo_url;
  const resolveSeoImage = (value?: string | null): string | undefined => {
    if (!value) {
      return `${SITE_URL}/placeholder/article.svg`;
    }
    const resolved = getImageUrl(value);
    return resolved.startsWith("/") ? `${SITE_URL}${resolved}` : resolved;
  };
  const articleImage = resolveSeoImage(article.cover_image_canonical_url || article.cover_image_url);
  const publisherLogoUrl = publisherLogo ? resolveSeoImage(publisherLogo) : undefined;

  return (
    <>
      {/* SEO: Article Structured Data */}
      <ArticleSchema
        headline={article.title}
        description={article.excerpt || undefined}
        image={articleImage}
        datePublished={article.published_at}
        dateModified={article.updated_at}
        author={article.author?.name}
        publisher={{
          name: settings.site_name || "Thiên Kim Wine",
          logo: publisherLogoUrl,
        }}
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

      <ArticleDetailPage article={article} fontFamily={articleDetailFontStyle.fontFamily} />
    </>
  );
}

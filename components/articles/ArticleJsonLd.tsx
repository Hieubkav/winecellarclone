import type { ArticleDetail } from "@/lib/api/articles";
import { getImageUrl } from "@/lib/utils/article-content";

interface ArticleJsonLdProps {
  article: ArticleDetail;
}

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn").replace(/\/$/, "");
  const publisherName = "Thiên Kim Wine";
  const publisherLogo = `${siteUrl}/media/logo.webp`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.meta.description,
    image: article.cover_image_url
      ? [getImageUrl(article.cover_image_url)]
      : [],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/bai-viet/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

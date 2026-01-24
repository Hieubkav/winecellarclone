import type { ArticleDetail } from "@/lib/api/articles";
import { getImageUrl } from "@/lib/utils/article-content";

interface ArticleJsonLdProps {
  article: ArticleDetail;
}

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
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
      name: "Wincellar",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || ""}/bai-viet/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

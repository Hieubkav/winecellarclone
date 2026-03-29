import type { ArticleDetail } from "@/lib/api/articles";
import { FALLBACK_SETTINGS } from "@/lib/api/settings";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { getImageUrl } from "@/lib/utils/image";

interface ArticleJsonLdProps {
  article: ArticleDetail;
}

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const settings = useSettingsStore((state) => state.settings);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn").replace(/\/$/, "");
  const publisherName = settings?.site_name || FALLBACK_SETTINGS.site_name;
  const publisherLogo = settings?.logo_url || settings?.og_image_url || FALLBACK_SETTINGS.logo_url;
  const publisherLogoUrl = publisherLogo ? getImageUrl(publisherLogo) : null;
  const coverImageUrl = article.cover_image_canonical_url || article.cover_image_url;
  const resolvedCoverImage = coverImageUrl ? getImageUrl(coverImageUrl) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.meta.description,
    image: resolvedCoverImage ? [resolvedCoverImage] : [],
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
      logo: publisherLogoUrl ? {
        "@type": "ImageObject",
        url: publisherLogoUrl,
      } : undefined,
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

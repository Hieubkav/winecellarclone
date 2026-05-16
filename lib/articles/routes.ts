export const ARTICLE_CATEGORY_HUBS: Record<string, string> = {
  "kien-thuc": "kien-thuc",
  "chinh-sach": "ho-tro",
  "gioi-thieu": "gioi-thieu",
  "dich-vu": "dich-vu",
  "qua-tang": "qua-tang",
  "tin-tuc": "tin-tuc",
  "su-kien": "su-kien",
};

export const getArticleCategoryHub = (categoryKey?: string | null): string | null => {
  if (!categoryKey) return null;
  return ARTICLE_CATEGORY_HUBS[categoryKey] ?? null;
};

export const getArticlePublicHref = (article: {
  slug: string;
  category_key?: string | null;
  category_slug?: string | null;
  article_category?: { slug?: string | null } | null;
}): string => {
  const categorySlug = article.article_category?.slug || article.category_slug || getArticleCategoryHub(article.category_key);
  return categorySlug ? `/${categorySlug}/${article.slug}` : `/bai-viet/${article.slug}`;
};

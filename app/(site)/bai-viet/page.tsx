export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleCategoriesSafe, fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Tất cả bài viết | Thiên Kim Wine",
  description: "Tất cả bài viết, tin tức, kiến thức, chính sách, dịch vụ và tư vấn quà tặng từ Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/bai-viet` },
};

type ArticleRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
  category_slug?: string;
  category?: string;
};

export default async function ArticleListRoute({
  searchParams,
}: {
  searchParams: Promise<ArticleRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";
  const categorySlug = params.category_slug || params.category || undefined;

  const [data, categories, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_slug: categorySlug }),
    fetchArticleCategoriesSafe(),
    fetchSettingsSafe(),
  ]);
  const articleListFontStyle = getScopedFontStyle(settings, "article_list");

  return (
    <ArticleListPage
      data={
        data ?? {
          data: [],
          meta: {
            pagination: { page, per_page: perPage, total: 0, last_page: 1, has_more: false },
            sorting: { sort },
            filtering: { author: null, q: null, category_slug: categorySlug ?? null },
            api_version: "offline",
            timestamp: new Date().toISOString(),
          },
          _links: { self: { href: `${SITE_URL}/bai-viet`, method: "GET" } },
        }
      }
      categories={categories}
      activeCategorySlug={categorySlug}
      fontFamily={articleListFontStyle.fontFamily}
      title="Bài viết"
      description="Tất cả bài viết, tin tức, kiến thức và nội dung hỗ trợ khách hàng"
    />
  );
}

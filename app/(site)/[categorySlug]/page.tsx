export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

type CategoryRouteParams = { categorySlug: string };
type CategoryRouteSearchParams = { page?: string; per_page?: string; sort?: string };

export async function generateMetadata({ params }: { params: Promise<CategoryRouteParams> }): Promise<Metadata> {
  const { categorySlug } = await params;
  const data = await fetchArticleListSafe({ category_slug: categorySlug, per_page: 1 });

  if (!data || data.meta.pagination.total === 0) {
    return { title: "Danh mục không tồn tại" };
  }

  const categoryName = data.data[0]?.article_category?.name || categorySlug;

  return {
    title: `${categoryName} | Thiên Kim Wine`,
    description: `Các bài viết thuộc danh mục ${categoryName}.`,
    alternates: { canonical: `${SITE_URL}/${categorySlug}` },
  };
}

export default async function ArticleCategoryRoute({
  params,
  searchParams,
}: {
  params: Promise<CategoryRouteParams>;
  searchParams: Promise<CategoryRouteSearchParams>;
}) {
  const [{ categorySlug }, query] = await Promise.all([params, searchParams]);
  const page = parseInt(query.page || "1", 10);
  const perPage = parseInt(query.per_page || "12", 10);
  const sort = query.sort || "-created_at";

  const [data, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_slug: categorySlug }),
    fetchSettingsSafe(),
  ]);

  if (!data || data.meta.pagination.total === 0) {
    notFound();
  }

  const categoryName = data.data[0]?.article_category?.name || categorySlug;
  const articleListFontStyle = getScopedFontStyle(settings, "article_list");

  return (
    <ArticleListPage
      data={data}
      fontFamily={articleListFontStyle.fontFamily}
      title={categoryName}
      description={`Các bài viết thuộc danh mục ${categoryName}`}
    />
  );
}

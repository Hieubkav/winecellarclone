export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleCategorySafe, fetchArticleListSafe, type ArticleListResponse } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";
import {
  buildFilterMetadata,
  resolveTypeContext,
  type FilterRouteSearchParams,
} from "../filter/shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

type CategoryRouteParams = { slug: string };
type CategoryRouteSearchParams = { page?: string; per_page?: string; sort?: string };

const createEmptyArticleListResponse = ({
  slug,
  page,
  perPage,
  sort,
}: {
  slug: string;
  page: number;
  perPage: number;
  sort: string;
}): ArticleListResponse => ({
  data: [],
  meta: {
    pagination: {
      page,
      per_page: perPage,
      total: 0,
      last_page: 1,
      has_more: false,
    },
    sorting: { sort },
    filtering: {
      author: null,
      q: null,
      category_key: slug,
    },
    api_version: "empty",
    timestamp: new Date().toISOString(),
  },
  _links: {
    self: { href: `${SITE_URL}/${slug}`, method: "GET" },
  },
});

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<CategoryRouteParams>;
  searchParams: Promise<CategoryRouteSearchParams & FilterRouteSearchParams>;
}): Promise<Metadata> {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const typeContext = await resolveTypeContext(slug);

  if (typeContext.matchedType) {
    return buildFilterMetadata({
      searchParams: resolvedSearchParams,
      canonicalPath: `/san-pham/${slug}`,
      routeTypeSlug: typeContext.matchedType.slug,
      routeTypeName: typeContext.matchedType.name,
    });
  }

  const category = await fetchArticleCategorySafe(slug);

  if (!category) {
    return { title: "Danh mục không tồn tại" };
  }

  return {
    title: `${category.name} | Thiên Kim Wine`,
    description: category.description || `Các bài viết thuộc danh mục ${category.name}.`,
    alternates: { canonical: `${SITE_URL}/${slug}` },
  };
}

export default async function ArticleCategoryRoute({
  params,
  searchParams,
}: {
  params: Promise<CategoryRouteParams>;
  searchParams: Promise<CategoryRouteSearchParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { matchedType } = await resolveTypeContext(slug);

  if (matchedType) {
    const redirectQuery = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        redirectQuery.set(key, value);
      }
    });

    redirect(`/san-pham/${matchedType.slug}${redirectQuery.toString() ? `?${redirectQuery}` : ""}`);
  }

  const page = parseInt(query.page || "1", 10);
  const perPage = parseInt(query.per_page || "12", 10);
  const sort = query.sort || "-created_at";

  const [category, data, settings] = await Promise.all([
    fetchArticleCategorySafe(slug),
    fetchArticleListSafe({ page, per_page: perPage, sort, category_slug: slug }),
    fetchSettingsSafe(),
  ]);

  if (!category) {
    notFound();
  }

  const articleListFontStyle = getScopedFontStyle(settings, "article_list");
  const listData = data ?? createEmptyArticleListResponse({ slug, page, perPage, sort });

  return (
    <ArticleListPage
      data={listData}
      fontFamily={articleListFontStyle.fontFamily}
      title={category.name}
      description={category.description || `Các bài viết thuộc danh mục ${category.name}`}
    />
  );
}

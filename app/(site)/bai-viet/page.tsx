export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Bài viết - Kiến thức về rượu vang & cocktail",
  description:
    "Khám phá những bài viết chuyên sâu về rượu vang, cocktail, và nghệ thuật thưởng thức. Cập nhật xu hướng mới nhất từ chuyên gia.",
  keywords: "kiến thức rượu vang, blog rượu vang, cocktail, cách thưởng thức rượu vang, wine knowledge",
  alternates: {
    canonical: `${SITE_URL}/bai-viet`,
  },
  openGraph: {
    title: "Bài viết - Kiến thức về rượu vang & cocktail",
    description:
      "Khám phá những bài viết chuyên sâu về rượu vang, cocktail, và nghệ thuật thưởng thức.",
    type: "website",
    url: `${SITE_URL}/bai-viet`,
    images: [
      {
        url: `${SITE_URL}/media/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Thiên Kim Wine - Blog",
      }
    ],
  },
};

type ArticleListRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function ArticleListRoute({
  searchParams,
}: {
  searchParams: Promise<ArticleListRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";

  const [data, settings] = await Promise.all([
    fetchArticleListSafe({
      page,
      per_page: perPage,
      sort,
    }),
    fetchSettingsSafe(),
  ]);
  const articleListFontStyle = getScopedFontStyle(settings, "article_list");

  return (
    <ArticleListPage
      data={
        data ?? {
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
            filtering: { author: null, q: null },
            api_version: "offline",
            timestamp: new Date().toISOString(),
          },
          _links: {
            self: { href: `${SITE_URL}/bai-viet`, method: "GET" },
          },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
    />
  );
}

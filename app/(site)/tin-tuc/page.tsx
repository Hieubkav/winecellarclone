import type { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Tin tức rượu vang & thị trường | Thiên Kim Wine",
  description: "Tin tức về rượu vang, rượu mạnh, xu hướng quà tặng và hoạt động mới từ Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/tin-tuc` },
};

type NewsRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<NewsRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";
  const [data, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_key: "tin-tuc" }),
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
            filtering: { author: null, q: null },
            api_version: "offline",
            timestamp: new Date().toISOString(),
          },
          _links: { self: { href: `${SITE_URL}/tin-tuc`, method: "GET" } },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
      title="Tin tức"
      description="Cập nhật xu hướng rượu vang, rượu mạnh, quà tặng và hoạt động mới"
    />
  );
}

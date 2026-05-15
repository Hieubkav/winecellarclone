import type { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Quà tặng rượu vang & rượu mạnh | Thiên Kim Wine",
  description: "Tư vấn quà tặng rượu vang, rượu mạnh, quà Tết, hộp quà và quà doanh nghiệp tại Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/qua-tang` },
};

type GiftsRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<GiftsRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";
  const [data, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_key: "qua-tang" }),
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
          _links: { self: { href: `${SITE_URL}/qua-tang`, method: "GET" } },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
      title="Quà tặng"
      description="Tư vấn quà tặng theo nhu cầu, ngân sách và dịp tặng"
    />
  );
}

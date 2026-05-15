import type { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Sự kiện rượu vang & tasting | Thiên Kim Wine",
  description: "Thông tin sự kiện, tasting, hoạt động thương hiệu và chương trình trải nghiệm từ Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/su-kien` },
};

type EventsRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<EventsRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";
  const [data, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_key: "su-kien" }),
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
          _links: { self: { href: `${SITE_URL}/su-kien`, method: "GET" } },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
      title="Sự kiện"
      description="Thông tin các buổi tasting, sự kiện rượu vang và hoạt động trải nghiệm"
    />
  );
}

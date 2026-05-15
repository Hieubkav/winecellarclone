import type { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleListSafe } from "@/lib/api/articles";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Giới thiệu Thiên Kim Wine",
  description: "Tìm hiểu về Thiên Kim Wine, câu chuyện thương hiệu, lý do lựa chọn và các chứng nhận/giấy phép liên quan.",
  alternates: { canonical: `${SITE_URL}/gioi-thieu` },
};

type AboutRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<AboutRouteSearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.per_page || "12", 10);
  const sort = params.sort || "-created_at";
  const [data, settings] = await Promise.all([
    fetchArticleListSafe({ page, per_page: perPage, sort, category_key: "gioi-thieu" }),
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
          _links: { self: { href: `${SITE_URL}/gioi-thieu`, method: "GET" } },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
      title="Giới thiệu"
      description="Nội dung về thương hiệu, câu chuyện và cam kết"
    />
  );
}

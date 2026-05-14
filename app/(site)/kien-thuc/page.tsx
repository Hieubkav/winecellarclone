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
  title: "Kiến thức rượu vang, whisky & thưởng thức | Thiên Kim Wine",
  description: "Kiến thức rượu vang, whisky, cách thưởng thức, bảo quản, phục vụ và kết hợp món ăn từ Thiên Kim Wine.",
  keywords: "kiến thức rượu vang, kiến thức whisky, thưởng thức rượu vang, bảo quản rượu, pairing món ăn",
  alternates: {
    canonical: `${SITE_URL}/kien-thuc`,
  },
  openGraph: {
    title: "Kiến thức rượu vang, whisky & thưởng thức | Thiên Kim Wine",
    description: "Hướng dẫn và kiến thức giúp chọn, thưởng thức và bảo quản rượu đúng cách.",
    type: "website",
    url: `${SITE_URL}/kien-thuc`,
    images: [
      {
        url: `${SITE_URL}/media/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Thiên Kim Wine - Kiến thức",
      },
    ],
  },
};

type KnowledgeRouteSearchParams = {
  page?: string;
  per_page?: string;
  sort?: string;
};

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<KnowledgeRouteSearchParams>;
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
            self: { href: `${SITE_URL}/kien-thuc`, method: "GET" },
          },
        }
      }
      fontFamily={articleListFontStyle.fontFamily}
    />
  );
}

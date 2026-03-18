// ISR: Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;
export const runtime = "nodejs";

import { Metadata } from "next";
import ArticleListPage from "@/components/articles/ArticleListPage";
import { fetchArticleList } from "@/lib/api/articles";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

  const [data, settingsResult] = await Promise.all([
    fetchArticleList({
      page,
      per_page: perPage,
      sort,
    }),
    fetchSettings().catch(() => null),
  ]);

  const settings = settingsResult ?? FALLBACK_SETTINGS;
  const articleListFontStyle = getScopedFontStyle(settings, "article_list");

  return <ArticleListPage data={data} fontFamily={articleListFontStyle.fontFamily} />;
}

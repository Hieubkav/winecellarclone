import { apiFetch, ApiError } from "./client";

export interface ApiImage {
  id: number;
  url: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  order: number | null;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
  _links: {
    self: { href: string; method: string };
    list: { href: string; method: string };
    author?: { href: string; method: string };
  };
}

export interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
}

export interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  gallery: ApiImage[];
  author?: {
    id: number;
    name: string;
  };
  published_at: string;
  updated_at: string;
  meta: {
    title: string | null;
    description: string | null;
  };
  related_articles?: RelatedArticle[];
  _links: {
    self: { href: string; method: string };
    list: { href: string; method: string };
    author?: { href: string; method: string };
    related?: { href: string; method: string };
  };
}

export interface ArticleListMeta {
  pagination: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
  sorting: {
    sort: string;
  };
  filtering: {
    author: number | null;
    q: string | null;
  };
  api_version: string;
  timestamp: string;
}

export interface ArticleListResponse {
  data: ArticleListItem[];
  meta: ArticleListMeta;
  _links: {
    self: { href: string; method: string };
    first?: { href: string; method: string };
    last?: { href: string; method: string };
    prev?: { href: string; method: string };
    next?: { href: string; method: string };
  };
}

interface ArticleDetailResponse {
  data: ArticleDetail;
  meta: {
    api_version: string;
    timestamp: string;
  };
}

type QueryValue = string | number | Array<string | number> | undefined;
type QueryParams = Record<string, QueryValue>;

const buildQueryString = (params?: QueryParams): string => {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, rawValue]) => {
    if (rawValue === undefined) {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue
        .filter((value) => value !== undefined && value !== null)
        .forEach((value) => searchParams.append(key, String(value)));
      return;
    }

    searchParams.append(key, String(rawValue));
  });

  const query = searchParams.toString();

  return query.length > 0 ? `?${query}` : "";
};

export async function fetchArticleList(params?: QueryParams): Promise<ArticleListResponse> {
  const query = buildQueryString(params);

  return apiFetch<ArticleListResponse>(`v1/bai-viet${query}`);
}

export async function fetchArticleDetail(slug: string): Promise<ArticleDetail | null> {
  try {
    const response = await apiFetch<ArticleDetailResponse>(
      `v1/bai-viet/${encodeURIComponent(slug)}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

import { apiFetch } from "@/lib/api/client";

const buildQueryString = (params?: Record<string, string | number>): string => {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  return query ? `?${query}` : "";
};

export interface AdminArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  active: boolean;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  images?: Array<{
    url: string;
    path: string;
    image_url?: string;
    image_path?: string;
  }>;
}

export interface AdminArticlesResponse {
  data: AdminArticle[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    audit?: {
      auth_ms?: number;
      query_ms?: number;
      transform_ms?: number;
      controller_ms?: number;
    };
  };
}

export async function fetchAdminArticles(params?: Record<string, string | number>): Promise<AdminArticlesResponse> {
  const query = buildQueryString(params);
  return apiFetch<AdminArticlesResponse>(`v1/admin/articles${query}`);
}

export async function fetchAdminArticle(
  id: number
): Promise<{ data: AdminArticle & { content: string }; meta?: { audit?: AdminArticlesResponse['meta']['audit'] } }> {
  return apiFetch(`v1/admin/articles/${id}`);
}

export async function createArticle(
  data: Record<string, unknown>
): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch("v1/admin/articles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArticle(
  id: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/articles/${id}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteArticles(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch("v1/admin/articles/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

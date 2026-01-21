 import { apiFetch } from "./client";
 
 // Dashboard Stats
 export interface DashboardStats {
   products: { total: number; active: number };
   articles: { total: number; active: number };
   categories: number;
   types: number;
   traffic: {
     today: {
       visitors: number;
       sessions: number;
       page_views: number;
       product_views: number;
       article_views: number;
       cta_clicks: number;
     };
     yesterday: {
       visitors: number;
       page_views: number;
     };
     last_7_days: {
       visitors: number;
       page_views: number;
     };
     last_30_days: {
       visitors: number;
       page_views: number;
     };
   };
 }
 
 export interface TrafficChartData {
   date: string;
   label: string;
   visitors: number;
   page_views: number;
   product_views: number;
   article_views: number;
   cta_clicks: number;
 }
 
 export interface TopProduct {
   id: number;
   name: string;
   slug: string;
   image_url: string | null;
   views: number;
 }
 
 export interface TopArticle {
   id: number;
   title: string;
   slug: string;
   image_url: string | null;
   views: number;
 }
 
 export interface RecentEvent {
   id: number;
   event_type: string;
   event_label: string;
   product: { id: number; name: string; slug: string } | null;
   article: { id: number; title: string; slug: string } | null;
   visitor_id: string | null;
   occurred_at: string;
   time_ago: string;
 }
 
 export async function fetchDashboardStats(): Promise<DashboardStats> {
   const res = await apiFetch<{ data: DashboardStats }>("v1/admin/dashboard/stats");
   return res.data;
 }
 
 export async function fetchTrafficChart(days: number = 7): Promise<TrafficChartData[]> {
   const res = await apiFetch<{ data: TrafficChartData[] }>(`v1/admin/dashboard/traffic-chart?days=${days}`);
   return res.data;
 }
 
 export async function fetchTopProducts(days: number = 7, limit: number = 10): Promise<TopProduct[]> {
   const res = await apiFetch<{ data: TopProduct[] }>(`v1/admin/dashboard/top-products?days=${days}&limit=${limit}`);
   return res.data;
 }
 
 export async function fetchTopArticles(days: number = 7, limit: number = 10): Promise<TopArticle[]> {
   const res = await apiFetch<{ data: TopArticle[] }>(`v1/admin/dashboard/top-articles?days=${days}&limit=${limit}`);
   return res.data;
 }
 
 export async function fetchRecentEvents(limit: number = 20): Promise<RecentEvent[]> {
   const res = await apiFetch<{ data: RecentEvent[] }>(`v1/admin/dashboard/recent-events?limit=${limit}`);
   return res.data;
 }
 
 // Admin Products
 export interface AdminProduct {
   id: number;
   name: string;
   slug: string;
   price: number | null;
   original_price: number | null;
  extra_attrs?: Record<string, { label: string; value: string | number; type: string }> | null;
  term_ids?: number[];
   active: boolean;
   type_id: number | null;
   type_name: string | null;
   category_name: string | null;
   cover_image_url: string | null;
   created_at: string;
 }

export interface AdminProductImage {
  id?: number;
  url?: string | null;
  path?: string | null;
}

export interface AdminProductDetail extends AdminProduct {
  description: string | null;
  category_ids: number[];
  images?: AdminProductImage[];
}
 
 export interface AdminProductsResponse {
   data: AdminProduct[];
   meta: {
     current_page: number;
     last_page: number;
     per_page: number;
     total: number;
   };
 }
 
 export async function fetchAdminProducts(params?: Record<string, string | number>): Promise<AdminProductsResponse> {
   const query = params ? '?' + new URLSearchParams(
     Object.entries(params).map(([k, v]) => [k, String(v)])
   ).toString() : '';
   return apiFetch<AdminProductsResponse>(`v1/admin/products${query}`);
 }
 
export async function fetchAdminProduct(id: number): Promise<{ data: AdminProductDetail }> {
   return apiFetch(`v1/admin/products/${id}`);
 }
 
 export async function createProduct(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
   return apiFetch("v1/admin/products", {
     method: "POST",
     body: JSON.stringify(data),
   });
 }
 
 export async function updateProduct(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
   return apiFetch(`v1/admin/products/${id}`, {
     method: "PUT",
     body: JSON.stringify(data),
   });
 }
 
 export async function deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
   return apiFetch(`v1/admin/products/${id}`, {
     method: "DELETE",
   });
 }
 
 export async function bulkDeleteProducts(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
   return apiFetch("v1/admin/products/bulk-delete", {
     method: "POST",
     body: JSON.stringify({ ids }),
   });
 }
 
 // Admin Articles
 export interface AdminArticle {
   id: number;
   title: string;
   slug: string;
   excerpt: string | null;
   active: boolean;
   cover_image_url: string | null;
   published_at: string | null;
   created_at: string;
 }
 
 export interface AdminArticlesResponse {
   data: AdminArticle[];
   meta: {
     current_page: number;
     last_page: number;
     per_page: number;
     total: number;
   };
 }
 
 export async function fetchAdminArticles(params?: Record<string, string | number>): Promise<AdminArticlesResponse> {
   const query = params ? '?' + new URLSearchParams(
     Object.entries(params).map(([k, v]) => [k, String(v)])
   ).toString() : '';
   return apiFetch<AdminArticlesResponse>(`v1/admin/articles${query}`);
 }
 
 export async function fetchAdminArticle(id: number): Promise<{ data: AdminArticle & { content: string } }> {
   return apiFetch(`v1/admin/articles/${id}`);
 }
 
 export async function createArticle(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
   return apiFetch("v1/admin/articles", {
     method: "POST",
     body: JSON.stringify(data),
   });
 }
 
 export async function updateArticle(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
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

// Admin Product Types
export interface AdminProductType {
  id: number;
  name: string;
  slug: string;
  order: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProductTypesResponse {
  data: AdminProductType[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminProductTypes(params?: Record<string, string | number>): Promise<AdminProductTypesResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminProductTypesResponse>(`v1/admin/product-types${query}`);
}

export async function fetchAdminProductType(id: number): Promise<{ data: AdminProductType }> {
  return apiFetch(`v1/admin/product-types/${id}`);
}

export async function createProductType(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/product-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProductType(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/product-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProductType(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/product-types/${id}`, {
    method: 'DELETE',
  });
}

export async function seedCatalogBaseline(): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/catalog/baseline/seed', {
    method: 'POST',
  });
}
 
 export async function bulkDeleteArticles(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
   return apiFetch("v1/admin/articles/bulk-delete", {
     method: "POST",
     body: JSON.stringify({ ids }),
   });
 }

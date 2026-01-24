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
  terms?: Array<{
    id: number;
    name: string;
    group?: {
      id: number;
      code: string;
      name: string;
    };
  }>;
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
 
 export interface BulkImportResult {
   success: boolean;
   message: string;
   results: {
     created: number;
     updated: number;
     failed: number;
     errors: Array<{ row: number; name: string; error: string }>;
   };
 }
 
 export async function bulkImportProducts(products: Record<string, unknown>[]): Promise<BulkImportResult> {
   const results = {
     created: 0,
     updated: 0,
     failed: 0,
     errors: [] as Array<{ row: number; name: string; error: string }>,
   };
 
   for (let i = 0; i < products.length; i++) {
     const product = products[i];
     try {
       if (product.id) {
         await updateProduct(Number(product.id), product);
         results.updated++;
       } else {
         await createProduct(product);
         results.created++;
       }
     } catch (error) {
       results.failed++;
       results.errors.push({
         row: i + 2,
         name: String(product.name || 'Unknown'),
         error: error instanceof Error ? error.message : 'Unknown error',
       });
     }
   }
 
   return {
     success: results.failed === 0,
     message: `Import hoàn tất: ${results.created} tạo mới, ${results.updated} cập nhật, ${results.failed} lỗi`,
     results,
   };
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
  products_count: number;
  attribute_groups?: Array<{ id: number; position?: number }>;
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

export async function attachAttributeGroupToType(typeId: number, groupId: number, position?: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/product-types/${typeId}/attribute-groups`, {
    method: 'POST',
    body: JSON.stringify({ group_id: groupId, position: position ?? 0 }),
  });
}

export async function detachAttributeGroupFromType(typeId: number, groupId: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/product-types/${typeId}/attribute-groups/${groupId}`, {
    method: 'DELETE',
  });
}

export async function syncAttributeGroupsToType(typeId: number, groups: Array<{ id: number; position: number }>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/product-types/${typeId}/attribute-groups/sync`, {
    method: 'PUT',
    body: JSON.stringify({ groups }),
  });
}

// Admin Catalog Attribute Groups
export interface AdminCatalogAttributeGroup {
  id: number;
  code: string;
  name: string;
  filter_type: 'checkbox' | 'radio' | 'range' | 'color';
  input_type?: 'select' | 'text' | 'number' | null;
  is_filterable: boolean;
  position: number | null;
  icon_path?: string | null;
  terms_count: number;
  products_count: number;
  product_types: { id: number; name: string }[];
  created_at?: string;
  updated_at?: string;
}

export interface AdminCatalogAttributeGroupsResponse {
  data: AdminCatalogAttributeGroup[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminCatalogAttributeGroups(params?: Record<string, string | number>): Promise<AdminCatalogAttributeGroupsResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminCatalogAttributeGroupsResponse>(`v1/admin/catalog-attribute-groups${query}`);
}

export async function fetchAdminCatalogAttributeGroup(id: number): Promise<{ data: AdminCatalogAttributeGroup & { terms: Array<{ id: number; name: string; slug: string; position: number }> } }> {
  return apiFetch(`v1/admin/catalog-attribute-groups/${id}`);
}

export async function createCatalogAttributeGroup(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/catalog-attribute-groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCatalogAttributeGroup(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/catalog-attribute-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCatalogAttributeGroup(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/catalog-attribute-groups/${id}`, {
    method: 'DELETE',
  });
}

export async function seedCatalogBaseline(): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/catalog/baseline/seed', {
    method: 'POST',
  });
}

// Admin Catalog Terms
export interface AdminCatalogTerm {
  id: number;
  group_id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon_type?: 'lucide' | 'color' | 'image' | null;
  icon_value?: string | null;
  metadata?: Record<string, unknown> | null;
  is_active: boolean;
  position: number;
  group_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminCatalogTermsResponse {
  data: AdminCatalogTerm[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminCatalogTerms(params?: Record<string, string | number>): Promise<AdminCatalogTermsResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminCatalogTermsResponse>(`v1/admin/catalog-terms${query}`);
}

export async function fetchAdminCatalogTerm(id: number): Promise<{ data: AdminCatalogTerm }> {
  return apiFetch(`v1/admin/catalog-terms/${id}`);
}

export async function createCatalogTerm(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/catalog-terms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCatalogTerm(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/catalog-terms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCatalogTerm(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/catalog-terms/${id}`, {
    method: 'DELETE',
  });
}

export async function reorderCatalogTerms(items: Array<{ id: number; position: number }>): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/catalog-terms/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
 
 export async function bulkDeleteArticles(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
   return apiFetch("v1/admin/articles/bulk-delete", {
     method: "POST",
     body: JSON.stringify({ ids }),
   });
 }

// Admin Categories
export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  type_id: number | null;
  type_name?: string | null;
  order: number | null;
  active: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminCategoriesResponse {
  data: AdminCategory[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminCategories(params?: Record<string, string | number>): Promise<AdminCategoriesResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminCategoriesResponse>(`v1/admin/categories${query}`);
}

export async function fetchAdminCategory(id: number): Promise<{ data: AdminCategory }> {
  return apiFetch(`v1/admin/categories/${id}`);
}

export async function createCategory(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteCategories(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch('v1/admin/categories/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// Admin Home Components
export interface AdminHomeComponent {
  id: number;
  type: string;
  config: Record<string, unknown>;
  order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminHomeComponentsResponse {
  data: AdminHomeComponent[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminHomeComponents(params?: Record<string, string | number>): Promise<AdminHomeComponentsResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminHomeComponentsResponse>(`v1/admin/home-components${query}`);
}

export async function fetchAdminHomeComponent(id: number): Promise<{ data: AdminHomeComponent }> {
  return apiFetch(`v1/admin/home-components/${id}`);
}

export async function createHomeComponent(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/home-components', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHomeComponent(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/home-components/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHomeComponent(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/home-components/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteHomeComponents(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch('v1/admin/home-components/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function reorderHomeComponents(items: Array<{ id: number; order: number }>): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/home-components/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// Admin Images
export interface AdminImage {
  id: number;
  file_path: string;
  url: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  model_type: string | null;
  model_id: number | null;
  used_by: {
    type: string;
    label: string;
    name: string;
    slug: string | null;
    url: string;
  } | null;
  order: number;
  active: boolean;
  created_at?: string;
}

export interface AdminImageDetail extends AdminImage {
  disk: string;
  extra_attributes: Record<string, unknown> | null;
  updated_at?: string;
}

export interface AdminImagesResponse {
  data: AdminImage[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminImages(params?: Record<string, string | number>): Promise<AdminImagesResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminImagesResponse>(`v1/admin/images${query}`);
}

export async function fetchAdminImage(id: number): Promise<{ data: AdminImageDetail }> {
  return apiFetch(`v1/admin/images/${id}`);
}

export async function createImage(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number; url: string | null }; message: string }> {
  return apiFetch('v1/admin/images', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateImage(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/images/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteImage(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/images/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteImages(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch('v1/admin/images/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// Admin Social Links
export interface AdminSocialLink {
  id: number;
  platform: string;
  url: string;
  icon_image_id: number | null;
  icon_url: string | null;
  order: number;
  active: boolean;
  created_at?: string;
}

export interface AdminSocialLinkDetail extends AdminSocialLink {
  updated_at?: string;
}

export interface AdminSocialLinksResponse {
  data: AdminSocialLink[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminSocialLinks(params?: Record<string, string | number>): Promise<AdminSocialLinksResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminSocialLinksResponse>(`v1/admin/social-links${query}`);
}

export async function fetchAdminSocialLink(id: number): Promise<{ data: AdminSocialLinkDetail }> {
  return apiFetch(`v1/admin/social-links/${id}`);
}

export async function createSocialLink(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/social-links', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSocialLink(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/social-links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSocialLink(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/social-links/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteSocialLinks(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch('v1/admin/social-links/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function reorderSocialLinks(items: Array<{ id: number; order: number }>): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/social-links/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// Admin Settings
export interface AdminSetting {
  id: number;
  site_name: string | null;
  hotline: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  google_map_embed: string | null;
  footer_config: Record<string, unknown> | null;
  contact_config: Record<string, unknown> | null;
  meta_default_title: string | null;
  meta_default_description: string | null;
  meta_default_keywords: string | string[] | null;
  logo_image_id: number | null;
  logo_image_url: string | null;
  favicon_image_id: number | null;
  favicon_image_url: string | null;
  product_watermark_image_id: number | null;
  product_watermark_image_url: string | null;
  product_watermark_type: string | null;
  product_watermark_position: string | null;
  product_watermark_size: string | null;
  product_watermark_text: string | null;
  product_watermark_text_size: string | null;
  product_watermark_text_position: string | null;
  product_watermark_text_opacity: number | null;
  updated_at?: string;
}

export async function fetchAdminSettings(): Promise<{ data: AdminSetting }> {
  return apiFetch('v1/admin/settings');
}

export async function updateSettings(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Admin Menus
export interface AdminMenuBlockItem {
  id: number;
  label: string;
  href: string | null;
  badge: string | null;
  order: number;
  active: boolean;
}

export interface AdminMenuBlock {
  id: number;
  title: string;
  order: number;
  active: boolean;
  items: AdminMenuBlockItem[];
}

export interface AdminMenu {
  id: number;
  title: string;
  type: string | null;
  href: string | null;
  order: number;
  active: boolean;
  blocks_count: number;
  created_at?: string;
}

export interface AdminMenuDetail extends Omit<AdminMenu, 'blocks_count'> {
  blocks: AdminMenuBlock[];
  updated_at?: string;
}

export interface AdminMenusResponse {
  data: AdminMenu[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminMenus(params?: Record<string, string | number>): Promise<AdminMenusResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminMenusResponse>(`v1/admin/menus${query}`);
}

export async function fetchAdminMenu(id: number): Promise<{ data: AdminMenuDetail }> {
  return apiFetch(`v1/admin/menus/${id}`);
}

export async function createMenu(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/menus', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenu(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenu(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menus/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteMenus(ids: number[]): Promise<{ success: boolean; message: string; count: number }> {
  return apiFetch('v1/admin/menus/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function reorderMenus(items: Array<{ id: number; order: number }>): Promise<{ success: boolean; message: string }> {
  return apiFetch('v1/admin/menus/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// Menu Blocks
export async function createMenuBlock(menuId: number, data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch(`v1/admin/menus/${menuId}/blocks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuBlock(menuId: number, blockId: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menus/${menuId}/blocks/${blockId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuBlock(menuId: number, blockId: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menus/${menuId}/blocks/${blockId}`, {
    method: 'DELETE',
  });
}

// Menu Block Items
export async function createMenuBlockItem(blockId: number, data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch(`v1/admin/menu-blocks/${blockId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuBlockItem(blockId: number, itemId: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menu-blocks/${blockId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuBlockItem(blockId: number, itemId: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/menu-blocks/${blockId}/items/${itemId}`, {
    method: 'DELETE',
  });
}

// Admin Users
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchAdminUsers(params?: Record<string, string | number>): Promise<AdminUsersResponse> {
  const query = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  return apiFetch<AdminUsersResponse>(`v1/admin/users${query}`);
}

export async function fetchAdminUser(id: number): Promise<{ data: AdminUser }> {
  return apiFetch(`v1/admin/users/${id}`);
}

export async function createUser(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch('v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch(`v1/admin/users/${id}`, {
    method: 'DELETE',
  });
}

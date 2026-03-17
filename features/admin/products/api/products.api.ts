import { apiDownload, apiFetch } from "@/lib/api/client";

const buildQueryString = (params?: Record<string, string | number>): string => {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  return query ? `?${query}` : "";
};

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

export interface AdminProductFilterOption {
  id: number;
  name: string;
  slug: string;
}

export interface AdminProductFiltersResponse {
  data: {
    categories: AdminProductFilterOption[];
    types: AdminProductFilterOption[];
  };
}

export async function fetchAdminProducts(params?: Record<string, string | number>): Promise<AdminProductsResponse> {
  const query = buildQueryString(params);
  return apiFetch<AdminProductsResponse>(`v1/admin/products${query}`);
}

export async function fetchAdminProductFilters(typeId?: number | null): Promise<AdminProductFiltersResponse['data']> {
  const query = buildQueryString(typeId ? { type_id: typeId } : undefined);
  const response = await apiFetch<AdminProductFiltersResponse>(`v1/admin/products/filters${query}`);
  return response.data;
}

export async function downloadAdminProductsExport(
  params?: Record<string, string | number>
): Promise<{ blob: Blob; filename: string }> {
  const query = buildQueryString(params);
  const response = await apiDownload(`v1/admin/products/export${query}`);
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const fileMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const filename = decodeURIComponent(fileMatch?.[1] || fileMatch?.[2] || "danh-sach-san-pham.csv");

  return { blob, filename };
}

export async function fetchAdminProduct(id: number): Promise<{ data: AdminProductDetail }> {
  return apiFetch(`v1/admin/products/${id}`);
}

export async function createProduct(
  data: Record<string, unknown>
): Promise<{ success: boolean; data: { id: number }; message: string }> {
  return apiFetch("v1/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
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
        name: String(product.name || "Unknown"),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    success: results.failed === 0,
    message: `Import hoàn tất: ${results.created} tạo mới, ${results.updated} cập nhật, ${results.failed} lỗi`,
    results,
  };
}

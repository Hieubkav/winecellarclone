import { apiFetch, ApiError } from "./client";

export interface ApiTerm {
  id: number;
  name: string;
  slug: string;
}

export interface ApiImage {
  id: number;
  url: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  order: number | null;
}

export interface ExtraAttr {
  label: string;
  value: string | number;
  type: 'text' | 'number';
  icon_name?: string | null;
}

export interface ProductAttribute {
  group_code: string;
  group_name: string;
  icon_url?: string | null;
  icon_name?: string | null;
  terms: ApiTerm[];
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  show_contact_cta: boolean;
  main_image_url: string | null;
  gallery: ApiImage[];
  brand_term: ApiTerm | null;
  country_term: ApiTerm | null;
  alcohol_percent: number | null;
  volume_ml: number | null;
  badges: string[];
  categories: ApiTerm[];
  category: ApiTerm | null;
  type: ApiTerm | null;
  extra_attrs: Record<string, ExtraAttr>;
  attributes?: ProductAttribute[];
}

export interface ProductListMeta {
  page: number;
  per_page: number;
  total: number;
  sort: string;
}

export interface ProductListResponse {
  data: ProductListItem[];
  meta: ProductListMeta;
}

export interface ProductSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  show_contact_cta: boolean;
  main_image_url: string | null;
  brand_term: ApiTerm | null;
  country_term: ApiTerm | null;
  category: ApiTerm | null;
  type: ApiTerm | null;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface RelatedProductsSection {
  products: ProductListItem[];
  view_all_url: string | null;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  show_contact_cta: boolean;
  cover_image_url: string | null;
  gallery: ApiImage[];
  brand_term: ApiTerm | null;
  country_term: ApiTerm | null;
  grape_terms: ApiTerm[];
  origin_terms: ApiTerm[];
  alcohol_percent: number | null;
  volume_ml: number | null;
  badges: string[];
  categories: ApiTerm[];
  category: ApiTerm | null;
  type: ApiTerm | null;
  extra_attrs: Record<string, ExtraAttr>;
  attributes: ProductAttribute[];
  breadcrumbs: Breadcrumb[];
  meta: {
    title: string | null;
    description: string | null;
  };
  same_type_products?: RelatedProductsSection | null;
  related_by_attributes?: RelatedProductsSection | null;
}

interface ProductDetailResponse {
  data: ProductDetail;
}

interface ProductSuggestionResponse {
  data: ProductSuggestion[];
  meta: {
    query: string | null;
    limit: number;
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

export async function fetchProductList(
  params?: QueryParams,
  options?: { signal?: AbortSignal }
): Promise<ProductListResponse> {
  const query = buildQueryString(params);

  return apiFetch<ProductListResponse>(`v1/san-pham${query}`, {
    signal: options?.signal,
  });
}

export async function fetchProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    const response = await apiFetch<ProductDetailResponse>(`v1/san-pham/${encodeURIComponent(slug)}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export interface ProductFilterOption {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface AttributeFilter {
  code: string;
  name: string;
  filter_type: string;
  input_type?: string;
  display_config: Record<string, unknown>;
  icon_url?: string | null;
  icon_name?: string | null; // Lucide icon name (e.g., "Grape", "Award")
  range?: { min: number; max: number }; // For range filters
  options: ProductFilterOption[];
}

export interface ProductFiltersPayload {
  categories: ProductFilterOption[];
  types: ProductFilterOption[];
  price: {
    min: number;
    max: number;
  };
  alcohol: {
    min: number;
    max: number;
  };
  attribute_filters: AttributeFilter[];
}

interface ProductFiltersResponse {
  data: ProductFiltersPayload;
}

export async function fetchProductFilters(typeId?: number | null): Promise<ProductFiltersPayload> {
  const query = typeId ? `?type_id=${typeId}` : '';
  const response = await apiFetch<ProductFiltersResponse>(`v1/san-pham/filters/options${query}`);

  return response.data;
}

interface ProductSuggestionOptions {
  limit?: number;
  params?: QueryParams;
}

export async function fetchProductSuggestions(
  query: string,
  options?: ProductSuggestionOptions
): Promise<ProductSuggestionResponse> {
  const { limit = 6, params } = options ?? {};

  const searchQuery = buildQueryString({
    ...(params ?? {}),
    q: query,
    limit,
  });

  return apiFetch<ProductSuggestionResponse>(`v1/san-pham/search/suggest${searchQuery}`);
}

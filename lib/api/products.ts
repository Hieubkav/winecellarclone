import { getImageUrl } from "@/lib/utils/image";
import { apiFetch, ApiError, isBackendUnavailableError } from "./client";

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
  icon_url?: string | null;
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
  shopee_url?: string | null;
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

const normalizeIconUrl = (url?: string | null) => (url ? getImageUrl(url) : url ?? null);

const normalizeExtraAttrs = (attrs: Record<string, ExtraAttr>): Record<string, ExtraAttr> => {
  return Object.fromEntries(
    Object.entries(attrs ?? {}).map(([key, attr]) => [
      key,
      {
        ...attr,
        icon_url: normalizeIconUrl(attr.icon_url),
      },
    ])
  );
};

const normalizeAttributes = (attributes?: ProductAttribute[]): ProductAttribute[] | undefined => {
  return attributes?.map((attr) => ({
    ...attr,
    icon_url: normalizeIconUrl(attr.icon_url),
  }));
};

const normalizeProductListItem = (item: ProductListItem): ProductListItem => ({
  ...item,
  main_image_url: normalizeIconUrl(item.main_image_url),
  gallery: item.gallery.map((image) => ({
    ...image,
    url: normalizeIconUrl(image.url),
  })),
  extra_attrs: normalizeExtraAttrs(item.extra_attrs),
  attributes: normalizeAttributes(item.attributes),
});

const normalizeProductDetail = (detail: ProductDetail): ProductDetail => ({
  ...detail,
  cover_image_url: normalizeIconUrl(detail.cover_image_url),
  gallery: detail.gallery.map((image) => ({
    ...image,
    url: normalizeIconUrl(image.url),
  })),
  extra_attrs: normalizeExtraAttrs(detail.extra_attrs),
  attributes: normalizeAttributes(detail.attributes) ?? [],
  same_type_products: detail.same_type_products
    ? {
        ...detail.same_type_products,
        products: detail.same_type_products.products.map(normalizeProductListItem),
      }
    : detail.same_type_products,
  related_by_attributes: detail.related_by_attributes
    ? {
        ...detail.related_by_attributes,
        products: detail.related_by_attributes.products.map(normalizeProductListItem),
      }
    : detail.related_by_attributes,
});

const normalizeProductFilters = (filters: ProductFiltersPayload): ProductFiltersPayload => ({
  ...filters,
  attribute_filters: filters.attribute_filters.map((filter) => ({
    ...filter,
    icon_url: normalizeIconUrl(filter.icon_url),
  })),
});

export async function fetchProductList(
  params?: QueryParams,
  options?: { signal?: AbortSignal }
): Promise<ProductListResponse> {
  const query = buildQueryString(params);

  const response = await apiFetch<ProductListResponse>(`v1/san-pham${query}`, {
    signal: options?.signal,
    next: { tags: ['products'] },
  });

  return {
    ...response,
    data: response.data.map(normalizeProductListItem),
  };
}

let didWarnProductList = false;

export async function fetchProductListSafe(
  params?: QueryParams,
  options?: { signal?: AbortSignal }
): Promise<ProductListResponse | null> {
  try {
    return await fetchProductList(params, options);
  } catch (error) {
    if (!didWarnProductList) {
      didWarnProductList = true;
      const message = isBackendUnavailableError(error)
        ? "Backend chưa sẵn sàng, bỏ qua product list."
        : "Không lấy được product list, bỏ qua.";
      console.warn(message);
    }

    return null;
  }
}

export async function fetchProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    const response = await apiFetch<ProductDetailResponse>(`v1/san-pham/${encodeURIComponent(slug)}`, {
      next: { tags: ['products'] },
    });
    return normalizeProductDetail(response.data);
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

const productFiltersCache = new Map<string, Promise<ProductFiltersPayload>>();

const buildFiltersCacheKey = (typeId?: number | null) => (typeId ? `type:${typeId}` : 'all');

export async function fetchProductFilters(
  typeId?: number | null,
  options?: { bypassCache?: boolean }
): Promise<ProductFiltersPayload> {
  const cacheKey = buildFiltersCacheKey(typeId);
  const cachedPromise = !options?.bypassCache ? productFiltersCache.get(cacheKey) : null;
  if (cachedPromise) {
    return cachedPromise;
  }

  const requestPromise = (async () => {
    const query = typeId ? `?type_id=${typeId}` : '';
    const response = await apiFetch<ProductFiltersResponse>(`v1/san-pham/filters/options${query}`, {
      next: { tags: ['filters'] },
    });

    return normalizeProductFilters(response.data);
  })();

  productFiltersCache.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } catch (error) {
    productFiltersCache.delete(cacheKey);
    throw error;
  }
}

let didWarnProductFilters = false;

export async function fetchProductFiltersSafe(
  typeId?: number | null,
  options?: { bypassCache?: boolean }
): Promise<ProductFiltersPayload | null> {
  try {
    return await fetchProductFilters(typeId, options);
  } catch (error) {
    if (!didWarnProductFilters) {
      didWarnProductFilters = true;
      const message = isBackendUnavailableError(error)
        ? "Backend chưa sẵn sàng, bỏ qua product filters."
        : "Không lấy được product filters, bỏ qua.";
      console.warn(message);
    }

    return null;
  }
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
    ...params,
    q: query,
    limit,
  });

  return apiFetch<ProductSuggestionResponse>(`v1/san-pham/search/suggest${searchQuery}`);
}

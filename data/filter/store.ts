import { create } from "zustand"

import {
  fetchProductFilters,
  fetchProductList,
  type ExtraAttr,
  type ProductFilterOption,
  type ProductListItem,
  type ProductListMeta,
  type ProductFiltersPayload,
  type ProductListResponse,
} from "@/lib/api/products"
import { getImageUrl } from "@/lib/utils/article-content"
import { matchesSearch } from "@/lib/utils/text-normalization"
import { createDebounce } from "@/lib/utils/debounce"

const DEFAULT_PRICE_MAX = 10_000_000
const DEFAULT_PER_PAGE = 24
const FILTER_OPTIONS_CACHE_KEY = "wincellar.filter.options.v1"
const PRODUCT_LIST_CACHE_KEY = "wincellar.filter.products.v1"
const FILTER_OPTIONS_TTL = 10 * 60 * 1000
const PRODUCT_LIST_TTL = 2 * 60 * 1000

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc"

type FilterOption = ProductFilterOption

type PriceRange = [number, number]

const SORT_TO_API: Record<SortOption, string> = {
  "name-asc": "name",
  "name-desc": "-name",
  "price-asc": "price",
  "price-desc": "-price",
}

export interface Wine {
  id: number
  slug: string
  name: string
  price: number | null
  originalPrice?: number | null
  discountPercent?: number | null
  producer?: string | null
  image?: string | null
  badges?: string[]
  wineType?: string | null
  wineTypeSlug?: string | null
  brand?: string | null
  brandSlug?: string | null
  country?: string | null
  countrySlug?: string | null
  alcoholContent?: number | null
  volume?: number | null
  showContactCta?: boolean
  categories?: Array<{ id: number; name: string; slug: string }>
  extraAttrs?: Record<string, ExtraAttr>
  extraAttrIcons?: Record<string, string | null>
  attributes?: Array<{
    group_code: string
    group_name: string
    icon_url?: string | null
    icon_name?: string | null
    terms: Array<{ id: number; name: string; slug: string }>
  }>
}

type CachePayload<T> = {
  expiresAt: number
  data: T
}

interface AttributeFilter {
  code: string
  name: string
  filter_type: string
  input_type?: string
  display_config: Record<string, unknown>
  icon_url?: string | null
  icon_name?: string | null
  options: FilterOption[]
  range?: { min: number; max: number }
}

interface FilterOptionsState {
  categories: FilterOption[]
  productTypes: FilterOption[]
  priceRange: PriceRange
  attributeFilters: AttributeFilter[]
  rangeFilterBounds: Record<string, { min: number; max: number }>
}

interface FiltersState {
  categoryId: number | null
  productTypeId: number | null
  priceRange: PriceRange
  sortBy: SortOption
  searchQuery: string
  page: number
  perPage: number
  // Dynamic attribute filter selections (e.g., { brand: [1,2], grape: [3,4] })
  attributeSelections: Record<string, number[]>
  // Range filters for nhap_tay number (e.g., { nong_do: { min: 0, max: 50 } })
  rangeFilters: Record<string, { min: number; max: number }>
}

interface WineStoreState {
  options: FilterOptionsState
  filters: FiltersState
  products: Wine[]
  wines: Wine[]
  meta: ProductListMeta | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  initialized: boolean
  viewMode: "grid" | "list"
  abortController: AbortController | null
}

interface WineStoreActions {
  initialize: (
    prefetchedOptions?: ProductFiltersPayload | null,
    prefetchedProducts?: ProductListResponse | null
  ) => Promise<void>
  fetchProducts: (append?: boolean) => Promise<boolean>
  fetchProductsDebounced: () => void
  resetFilters: () => Promise<void>
  setViewMode: (mode: "grid" | "list") => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (id: number | null, skipFetch?: boolean) => void
  setSelectedProductType: (id: number | null, skipFetch?: boolean) => Promise<void>
  toggleAttributeFilter: (attributeCode: string, optionId: number, skipFetch?: boolean) => void
  setAttributeSelection: (attributeCode: string, optionId: number | null, skipFetch?: boolean) => void
  setPriceRange: (range: PriceRange, skipFetch?: boolean) => void
  setRangeFilter: (code: string, min: number, max: number, skipFetch?: boolean) => void
  setSortBy: (sort: SortOption, skipFetch?: boolean) => void
  loadMore: () => Promise<void>
}

export interface WineStore extends WineStoreState, WineStoreActions {}

const mapProductToWine = (product: ProductListItem, attributeFilters: AttributeFilter[]): Wine => {
  const attributeIconMap: Record<string, string | null> = {};

  (product.attributes ?? []).forEach((group) => {
    attributeIconMap[group.group_code] = group.icon_url ?? null;
  });

  attributeFilters.forEach((group) => {
    if (!(group.code in attributeIconMap)) {
      attributeIconMap[group.code] = group.icon_url ?? null;
    }
  });

  const fallbackImage = product.gallery.find((image) => image.url)?.url ?? null

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.original_price,
    discountPercent: product.discount_percent,
    producer: product.brand_term?.name ?? null,
    brand: product.brand_term?.name ?? null,
    brandSlug: product.brand_term?.slug ?? null,
    country: product.country_term?.name ?? null,
    countrySlug: product.country_term?.slug ?? null,
    alcoholContent: product.alcohol_percent,
    volume: product.volume_ml,
    image: getImageUrl(product.main_image_url ?? fallbackImage),
    badges: product.badges,
    wineType: product.type?.name ?? product.category?.name ?? null,
    wineTypeSlug: product.type?.slug ?? null,
    showContactCta: product.show_contact_cta,
    categories: product.categories ?? [],
    extraAttrs: product.extra_attrs ?? {},
    extraAttrIcons: attributeIconMap,
    attributes: product.attributes ?? [],
  }
}

const readCache = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as CachePayload<T>
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key)
      return null
    }

    return parsed.data ?? null
  } catch {
    return null
  }
}

const writeCache = <T>(key: string, data: T, ttlMs: number) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    const payload: CachePayload<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    }

    window.localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore cache write failures
  }
}

// Memoized search to avoid recomputing on every render
// Only recomputes when items array or query actually changes
// Uses Vietnamese text normalization for flexible matching
const applySearch = (items: Wine[], query: string): Wine[] => {
  if (!query.trim()) {
    return items
  }

  return items.filter((wine) => {
    const searchableText = [
      wine.name,
      wine.brand ?? "",
      wine.producer ?? "",
      wine.country ?? "",
      wine.wineType ?? "",
    ].join(" ")

    return matchesSearch(searchableText, query)
  })
}

const ensureRangeWithinBounds = (range: PriceRange, bounds: PriceRange): PriceRange => {
  const [min, max] = range
  const [boundMin, boundMax] = bounds

  const safeMin = Math.max(boundMin, min)
  const safeMax = Math.min(boundMax, max)

  if (safeMin > safeMax) {
    return [safeMin, safeMin]
  }

  return [safeMin, safeMax]
}

const toggleIdInList = (list: number[], id: number): number[] => {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id]
}

const isDefaultFilters = (filters: FiltersState, options: FilterOptionsState): boolean => {
  const isDefaultPrice =
    filters.priceRange[0] === options.priceRange[0] &&
    filters.priceRange[1] === options.priceRange[1]

  return (
    filters.categoryId === null &&
    filters.productTypeId === null &&
    isDefaultPrice &&
    filters.sortBy === "name-asc" &&
    filters.searchQuery === "" &&
    filters.page === 1 &&
    filters.perPage === DEFAULT_PER_PAGE &&
    Object.keys(filters.attributeSelections).length === 0 &&
    Object.keys(filters.rangeFilters).length === 0
  )
}

const buildQueryParams = (filters: FiltersState): Record<string, string | number | Array<string | number> | undefined> => {
  const params: Record<string, string | number | Array<string | number> | undefined> = {
    page: filters.page,
    per_page: filters.perPage,
    sort: SORT_TO_API[filters.sortBy],
    price_min: filters.priceRange[0],
    price_max: filters.priceRange[1],
  }
  const normalizedSearch = filters.searchQuery.trim()

  if (normalizedSearch.length > 0) {
    params.q = normalizedSearch
  }

  // Dynamic attribute filters
  Object.entries(filters.attributeSelections).forEach(([code, ids]) => {
    if (ids.length > 0) {
      params[`terms[${code}][]`] = ids
    }
  })

  // Range filters (nhap_tay number)
  Object.entries(filters.rangeFilters).forEach(([code, range]) => {
    if (range) {
      params[`range[${code}][min]`] = range.min
      params[`range[${code}][max]`] = range.max
    }
  })

  if (filters.categoryId) {
    params["category[]"] = [filters.categoryId]
  }

  if (filters.productTypeId) {
    params["type[]"] = [filters.productTypeId]
  }

  return params
}

const transformOptions = (payload: {
  categories: FilterOption[]
  types: FilterOption[]
  price: { min: number; max: number }
  attribute_filters: Array<{
    code: string
    name: string
    filter_type: string
    input_type?: string
    display_config: Record<string, unknown>
    options: FilterOption[]
    range?: { min: number; max: number }
  }>
}): FilterOptionsState => {
  const priceRange: PriceRange = [
    Math.max(0, payload.price.min ?? 0),
    Math.max(payload.price.max ?? 0, DEFAULT_PRICE_MAX),
  ]

  // Extract range bounds for nhap_tay number filters
  const rangeFilterBounds: Record<string, { min: number; max: number }> = {}
  payload.attribute_filters.forEach((filter) => {
    if (filter.filter_type === 'nhap_tay' && filter.input_type === 'number' && filter.range) {
      rangeFilterBounds[filter.code] = filter.range
    }
  })

  return {
    categories: payload.categories,
    productTypes: payload.types || [],
    priceRange,
    attributeFilters: payload.attribute_filters,
    rangeFilterBounds,
  }
}

const initialState: WineStoreState = {
  options: {
    categories: [],
    productTypes: [],
    priceRange: [0, DEFAULT_PRICE_MAX],
    attributeFilters: [],
    rangeFilterBounds: {},
  },
  filters: {
    categoryId: null,
    productTypeId: null,
    priceRange: [0, DEFAULT_PRICE_MAX],
    sortBy: "name-asc",
    searchQuery: "",
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    attributeSelections: {},
    rangeFilters: {},
  },
  products: [],
  wines: [],
  meta: null,
  loading: false,
  loadingMore: false,
  error: null,
  initialized: false,
  viewMode: "grid",
  abortController: null,
}

export const useWineStore = create<WineStore>((set, get) => ({
  ...initialState,
  initialize: async (prefetchedOptions, prefetchedProducts) => {
    if (get().initialized) {
      return
    }

    // Nếu có prefetched data từ server, hydrate ngay lập tức
    if (prefetchedOptions && prefetchedProducts) {
      const options = transformOptions(prefetchedOptions)
      const mapped = prefetchedProducts.data.map((item) => 
        mapProductToWine(item, options.attributeFilters)
      )

      set((state) => ({
        options,
        filters: {
          ...state.filters,
          priceRange: options.priceRange,
        },
        products: mapped,
        wines: mapped,
        meta: prefetchedProducts.meta,
        initialized: true,
        loading: false,
        loadingMore: false,
        error: null,
      }))

      // Cache vào localStorage
      writeCache(FILTER_OPTIONS_CACHE_KEY, options, FILTER_OPTIONS_TTL)
      writeCache(
        PRODUCT_LIST_CACHE_KEY,
        { 
          products: mapped, 
          meta: prefetchedProducts.meta, 
          perPage: prefetchedProducts.meta.per_page 
        },
        PRODUCT_LIST_TTL,
      )

      return
    }

    // Fallback: Load từ cache hoặc fetch từ API (legacy flow)
    const cachedOptions = readCache<FilterOptionsState>(FILTER_OPTIONS_CACHE_KEY)
    if (cachedOptions) {
      set((state) => ({
        options: cachedOptions,
        filters: {
          ...state.filters,
          priceRange: cachedOptions.priceRange,
        },
        initialized: true,
        loading: false,
        loadingMore: false,
        error: null,
      }))
    } else {
      set({ loading: true, loadingMore: false, error: null })
    }

    try {
      const payload = await fetchProductFilters()
      const options = transformOptions(payload)

      set((state) => ({
        options,
        filters: {
          ...state.filters,
          priceRange: options.priceRange,
        },
        initialized: true,
      }))

      writeCache(FILTER_OPTIONS_CACHE_KEY, options, FILTER_OPTIONS_TTL)

      // Don't fetch products here - let useFilterUrlSync handle it after applying URL params
      set({ loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai tuy chon loc."
      set({ error: message, loading: false, loadingMore: false })
    }
  },
  fetchProducts: async (append = false) => {
    const { filters, initialized, abortController } = get()
    
    if (!initialized) {
      return false
    }

    // Cancel previous request if exists
    if (abortController) {
      abortController.abort()
    }

    // Create new AbortController for this request
    const newAbortController = new AbortController()
    set({ abortController: newAbortController })

    const shouldUseCache = !append && isDefaultFilters(filters, get().options)
    let usedCache = false

    if (shouldUseCache) {
      const cached = readCache<{
        products: Wine[]
        meta: ProductListMeta
        perPage: number
      }>(PRODUCT_LIST_CACHE_KEY)

      if (cached && cached.perPage === filters.perPage) {
        usedCache = true
        set(() => ({
          products: cached.products,
          wines: applySearch(cached.products, filters.searchQuery),
          meta: cached.meta,
          loading: false,
          loadingMore: false,
          error: null,
        }))
      }
    }

    if (append) {
      set({ loadingMore: true, error: null })
    } else if (!usedCache) {
      set({ loading: true, loadingMore: false, error: null })
    }

    try {
      const queryParams = buildQueryParams(filters)
      const response = await fetchProductList(queryParams, {
        signal: newAbortController.signal,
      })
      
      // Check if this request was aborted
      if (newAbortController.signal.aborted) {
        return false
      }
      
      const options = get().options
      const mapped = response.data.map((item) => mapProductToWine(item, options.attributeFilters))
      
      set((state) => {
        let nextProducts = mapped

        if (append) {
          const existingIds = new Set(state.products.map((wine) => wine.id))
          const appended = mapped.filter((wine) => !existingIds.has(wine.id))
          nextProducts = [...state.products, ...appended]
        }

        return {
          products: nextProducts,
          wines: applySearch(nextProducts, filters.searchQuery),
          meta: response.meta,
          loading: false,
          loadingMore: false,
          abortController: null,
        }
      })

      if (shouldUseCache) {
        writeCache(
          PRODUCT_LIST_CACHE_KEY,
          { products: mapped, meta: response.meta, perPage: filters.perPage },
          PRODUCT_LIST_TTL,
        )
      }

      return true
    } catch (error) {
      // Ignore abort errors (user intentionally cancelled the request)
      if (error instanceof Error && error.name === 'AbortError') {
        set({ loading: false, loadingMore: false, abortController: null })
        return false
      }
      
      const message = error instanceof Error ? error.message : "Khong the tai danh sach san pham."
      set({ error: message, loading: false, loadingMore: false, abortController: null })
      return false
    }
  },
  // Debounced version for slider and search
  fetchProductsDebounced: createDebounce(() => {
    void get().fetchProducts()
  }, 400),
  resetFilters: async () => {
    const { options, initialized } = get()
    if (!initialized) {
      return
    }

    set((state) => ({
      filters: {
        ...state.filters,
        categoryId: null,
        productTypeId: null,
        priceRange: options.priceRange,
        page: 1,
        sortBy: "name-asc",
        searchQuery: "",
        attributeSelections: {},
        rangeFilters: {},
      },
    }))

    // Refresh filters về trạng thái ban đầu (common attributes)
    try {
      const payload = await fetchProductFilters(null)
      const newOptions = transformOptions(payload)
      
      set((state) => ({
        options: {
          ...state.options,
          attributeFilters: newOptions.attributeFilters,
          rangeFilterBounds: newOptions.rangeFilterBounds,
          categories: newOptions.categories,
        },
      }))
    } catch (error) {
      console.error('Failed to refresh filters:', error)
    }

    void get().fetchProducts()
  },
  setViewMode: (mode) => {
    set({ viewMode: mode })
  },
  setSearchQuery: (query) => {
    const normalized = query.trim()
    const currentQuery = get().filters.searchQuery

    if (currentQuery === normalized) {
      return
    }

    set((state) => ({
      filters: { ...state.filters, searchQuery: normalized, page: 1 },
      wines: applySearch(state.products, normalized),
    }))

    if (get().initialized) {
      // Use debounced version for search to avoid excessive API calls
      get().fetchProductsDebounced()
    }
  },
  setSelectedCategory: (id, skipFetch = false) => {
    set((state) => ({
      filters: {
        ...state.filters,
        categoryId: id,
        page: 1,
      },
    }))
    if (!skipFetch) {
      void get().fetchProducts()
    }
  },
  setSelectedProductType: async (id, skipFetch = false) => {
    // Reset attribute selections và range filters khi đổi type
    set((state) => ({
      filters: {
        ...state.filters,
        productTypeId: id,
        page: 1,
        attributeSelections: {},
        rangeFilters: {},
      },
    }))

    // Fetch filter options mới cho type này
    try {
      const payload = await fetchProductFilters(id)
      const newOptions = transformOptions(payload)
      
      set((state) => ({
        options: {
          ...state.options,
          attributeFilters: newOptions.attributeFilters,
          rangeFilterBounds: newOptions.rangeFilterBounds,
          categories: newOptions.categories,
        },
      }))
    } catch (error) {
      console.error('Failed to fetch type-specific filters:', error)
    }

    if (!skipFetch) {
      void get().fetchProducts()
    }
  },
  toggleAttributeFilter: (attributeCode, optionId, skipFetch = false) => {
    set((state) => {
      const currentSelections = state.filters.attributeSelections[attributeCode] || []
      const newSelections = toggleIdInList(currentSelections, optionId)
      
      return {
        filters: {
          ...state.filters,
          attributeSelections: {
            ...state.filters.attributeSelections,
            [attributeCode]: newSelections,
          },
          page: 1,
        },
      }
    })
    if (!skipFetch) {
      void get().fetchProducts()
    }
  },
  setPriceRange: (range, skipFetch = false) => {
    set((state) => ({
      filters: {
        ...state.filters,
        priceRange: ensureRangeWithinBounds(range, state.options.priceRange),
        page: 1,
      },
    }))
    if (!skipFetch) {
      // Use debounced version for price slider to avoid excessive API calls while dragging
      get().fetchProductsDebounced()
    }
  },
  setRangeFilter: (code, min, max, skipFetch = false) => {
    set((state) => ({
      filters: {
        ...state.filters,
        rangeFilters: {
          ...state.filters.rangeFilters,
          [code]: { min, max },
        },
        page: 1,
      },
    }))
    if (!skipFetch) {
      // Use debounced version for range sliders (e.g., alcohol content)
      get().fetchProductsDebounced()
    }
  },
  setAttributeSelection: (attributeCode, optionId, skipFetch = false) => {
    set((state) => ({
      filters: {
        ...state.filters,
        attributeSelections: {
          ...state.filters.attributeSelections,
          [attributeCode]: optionId !== null ? [optionId] : [],
        },
        page: 1,
      },
    }))
    if (!skipFetch) {
      void get().fetchProducts()
    }
  },
  setSortBy: (sort, skipFetch = false) => {
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy: sort,
        page: 1,
      },
    }))
    if (!skipFetch) {
      void get().fetchProducts()
    }
  },
  loadMore: async () => {
    const { filters, meta, initialized, loading, loadingMore } = get()
    if (!initialized || loading || loadingMore || !meta) {
      return
    }

    const totalPages = meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 0
    const nextPage = filters.page + 1
    if (totalPages === 0 || nextPage > totalPages) {
      return
    }

    const previousPage = filters.page

    set((state) => ({
      filters: {
        ...state.filters,
        page: nextPage,
      },
    }))

    const success = await get().fetchProducts(true)
    if (!success) {
      set((state) => ({
        filters: {
          ...state.filters,
          page: previousPage,
        },
      }))
    }
  },
}))

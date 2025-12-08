import { create } from "zustand"

import {
  fetchProductFilters,
  fetchProductList,
  type ExtraAttr,
  type ProductFilterOption,
  type ProductListItem,
  type ProductListMeta,
} from "@/lib/api/products"
import { matchesSearch } from "@/lib/utils/text-normalization"

const DEFAULT_PRICE_MAX = 10_000_000
const DEFAULT_PER_PAGE = 24

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
  brand?: string | null
  country?: string | null
  alcoholContent?: number | null
  volume?: number | null
  showContactCta?: boolean
  categories?: Array<{ id: number; name: string; slug: string }>
  extraAttrs?: Record<string, ExtraAttr>
}

interface AttributeFilter {
  code: string
  name: string
  filter_type: string
  input_type?: string
  display_config: Record<string, unknown>
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
}

interface WineStoreActions {
  initialize: () => Promise<void>
  fetchProducts: (append?: boolean) => Promise<boolean>
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

const mapProductToWine = (product: ProductListItem): Wine => {
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
    country: product.country_term?.name ?? null,
    alcoholContent: product.alcohol_percent,
    volume: product.volume_ml,
    image: product.main_image_url ?? fallbackImage,
    badges: product.badges,
    wineType: product.type?.name ?? product.category?.name ?? null,
    showContactCta: product.show_contact_cta,
    categories: product.categories ?? [],
    extraAttrs: product.extra_attrs ?? {},
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
}

export const useWineStore = create<WineStore>((set, get) => ({
  ...initialState,
  initialize: async () => {
    if (get().initialized) {
      return
    }

    set({ loading: true, loadingMore: false, error: null })

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

      // Don't fetch products here - let useFilterUrlSync handle it after applying URL params
      set({ loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai tuy chon loc."
      set({ error: message, loading: false, loadingMore: false })
    }
  },
  fetchProducts: async (append = false) => {
    const { filters, initialized } = get()
    
    if (!initialized) {
      return false
    }

    if (append) {
      set({ loadingMore: true, error: null })
    } else {
      set({ loading: true, loadingMore: false, error: null })
    }

    try {
      const queryParams = buildQueryParams(filters)
      const response = await fetchProductList(queryParams)
      const mapped = response.data.map(mapProductToWine)
      
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
        }
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai danh sach san pham."
      set({ error: message, loading: false, loadingMore: false })
      return false
    }
  },
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
      void get().fetchProducts()
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
      void get().fetchProducts()
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
      void get().fetchProducts()
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

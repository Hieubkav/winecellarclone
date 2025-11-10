import { create } from "zustand"

import {
  fetchProductFilters,
  fetchProductList,
  type ProductFilterOption,
  type ProductListItem,
  type ProductListMeta,
} from "@/lib/api/products"

const DEFAULT_PRICE_MAX = 10_000_000
const DEFAULT_ALCOHOL_RANGE: [number, number] = [0, 100]
const DEFAULT_PER_PAGE = 24

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc"

type FilterOption = ProductFilterOption

type PriceRange = [number, number]

type AlcoholBucket = "10" | "10-12" | "12-14" | "14-16" | "over16"

const ALCOHOL_BUCKETS: Record<AlcoholBucket, { min: number | null; max: number | null }> = {
  "10": { min: null, max: 10 },
  "10-12": { min: 10, max: 12 },
  "12-14": { min: 12, max: 14 },
  "14-16": { min: 14, max: 16 },
  over16: { min: 16, max: null },
}

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
}

interface AttributeFilter {
  code: string
  name: string
  filter_type: string
  display_config: Record<string, any>
  options: FilterOption[]
}

interface FilterOptionsState {
  categories: FilterOption[]
  priceRange: PriceRange
  alcoholRange: PriceRange
  attributeFilters: AttributeFilter[]
}

interface FiltersState {
  categoryId: number | null
  priceRange: PriceRange
  alcoholBuckets: AlcoholBucket[]
  sortBy: SortOption
  searchQuery: string
  page: number
  perPage: number
  // Dynamic attribute filter selections (e.g., { brand: [1,2], grape: [3,4] })
  attributeSelections: Record<string, number[]>
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
  resetFilters: () => void
  setViewMode: (mode: "grid" | "list") => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (id: number | null, skipFetch?: boolean) => void
  toggleAttributeFilter: (attributeCode: string, optionId: number, skipFetch?: boolean) => void
  setPriceRange: (range: PriceRange, skipFetch?: boolean) => void
  toggleAlcoholBucket: (bucket: AlcoholBucket, skipFetch?: boolean) => void
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
  }
}

// Memoized search to avoid recomputing on every render
// Only recomputes when items array or query actually changes
const applySearch = (items: Wine[], query: string): Wine[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return items
  }

  return items.filter((wine) => {
    const haystack = [
      wine.name,
      wine.brand ?? "",
      wine.producer ?? "",
      wine.country ?? "",
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(normalized)
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

const computeAlcoholRange = (buckets: AlcoholBucket[]): { min: number | null; max: number | null } => {
  if (buckets.length === 0) {
    return { min: null, max: null }
  }

  let min: number | null = null
  let max: number | null = null

  buckets.forEach((bucket) => {
    const config = ALCOHOL_BUCKETS[bucket]
    if (config.min !== null) {
      min = min === null ? config.min : Math.min(min, config.min)
    }
    if (config.max !== null) {
      max = max === null ? config.max : Math.max(max, config.max)
    }
  })

  return { min, max }
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

  if (filters.categoryId) {
    params["category[]"] = [filters.categoryId]
  }

  const alcoholRange = computeAlcoholRange(filters.alcoholBuckets)
  if (alcoholRange.min !== null) {
    params.alcohol_min = alcoholRange.min
  }

  if (alcoholRange.max !== null) {
    params.alcohol_max = alcoholRange.max
  }

  return params
}

const transformOptions = (payload: {
  categories: FilterOption[]
  price: { min: number; max: number }
  alcohol: { min: number; max: number }
  attribute_filters: Array<{
    code: string
    name: string
    filter_type: string
    display_config: Record<string, any>
    options: FilterOption[]
  }>
}): FilterOptionsState => {
  const priceRange: PriceRange = [
    Math.max(0, payload.price.min ?? 0),
    Math.max(payload.price.max ?? 0, DEFAULT_PRICE_MAX),
  ]

  const alcoholRange: PriceRange = [
    Math.max(0, payload.alcohol.min ?? DEFAULT_ALCOHOL_RANGE[0]),
    Math.max(payload.alcohol.max ?? DEFAULT_ALCOHOL_RANGE[1], DEFAULT_ALCOHOL_RANGE[1]),
  ]

  return {
    categories: payload.categories,
    priceRange,
    alcoholRange,
    attributeFilters: payload.attribute_filters,
  }
}

const initialState: WineStoreState = {
  options: {
    categories: [],
    priceRange: [0, DEFAULT_PRICE_MAX],
    alcoholRange: DEFAULT_ALCOHOL_RANGE,
    attributeFilters: [],
  },
  filters: {
    categoryId: null,
    priceRange: [0, DEFAULT_PRICE_MAX],
    alcoholBuckets: [],
    sortBy: "name-asc",
    searchQuery: "",
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    attributeSelections: {},
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

      await get().fetchProducts()
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
      // Build query params once
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
  resetFilters: () => {
    const { options, initialized } = get()
    if (!initialized) {
      return
    }

    set((state) => ({
      filters: {
        ...state.filters,
        categoryId: null,
        priceRange: options.priceRange,
        alcoholBuckets: [],
        page: 1,
        sortBy: "name-asc",
        searchQuery: "",
        attributeSelections: {},
      },
    }))

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
  toggleAlcoholBucket: (bucket, skipFetch = false) => {
    set((state) => {
      const exists = state.filters.alcoholBuckets.includes(bucket)
      const next = exists
        ? state.filters.alcoholBuckets.filter((item) => item !== bucket)
        : [...state.filters.alcoholBuckets, bucket]

      return {
        filters: {
          ...state.filters,
          alcoholBuckets: next,
          page: 1,
        },
      }
    })
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

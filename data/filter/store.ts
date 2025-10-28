import { create } from "zustand"

import {
  fetchProductFilters,
  fetchProductList,
  type CountryFilterOption,
  type ProductFilterOption,
  type ProductListItem,
  type ProductListMeta,
} from "@/lib/api/products"

const DEFAULT_PRICE_MAX = 10_000_000
const DEFAULT_ALCOHOL_RANGE: [number, number] = [0, 100]
const DEFAULT_PER_PAGE = 12

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

interface FilterOptionsState {
  categories: FilterOption[]
  brands: FilterOption[]
  grapes: FilterOption[]
  countries: CountryFilterOption[]
  regions: FilterOption[]
  priceRange: PriceRange
  alcoholRange: PriceRange
}

interface FiltersState {
  categoryId: number | null
  brandIds: number[]
  grapeIds: number[]
  countryIds: number[]
  regionIds: number[]
  priceRange: PriceRange
  alcoholBuckets: AlcoholBucket[]
  sortBy: SortOption
  searchQuery: string
  page: number
  perPage: number
}

interface WineStoreState {
  options: FilterOptionsState
  filters: FiltersState
  products: Wine[]
  wines: Wine[]
  meta: ProductListMeta | null
  loading: boolean
  error: string | null
  initialized: boolean
  viewMode: "grid" | "list"
}

interface WineStoreActions {
  initialize: () => Promise<void>
  fetchProducts: () => Promise<void>
  resetFilters: () => void
  setViewMode: (mode: "grid" | "list") => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (id: number | null) => void
  toggleBrand: (id: number) => void
  toggleGrape: (id: number) => void
  toggleCountry: (id: number) => void
  toggleRegion: (id: number) => void
  setPriceRange: (range: PriceRange) => void
  toggleAlcoholBucket: (bucket: AlcoholBucket) => void
  setSortBy: (sort: SortOption) => void
  setPage: (page: number) => void
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

  if (filters.brandIds.length > 0) {
    params["terms[brand][]"] = filters.brandIds
  }

  if (filters.countryIds.length > 0) {
    params["terms[origin.country][]"] = filters.countryIds
  }

  if (filters.regionIds.length > 0) {
    params["terms[origin.region][]"] = filters.regionIds
  }

  if (filters.grapeIds.length > 0) {
    params["terms[grape][]"] = filters.grapeIds
  }

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
  brands: FilterOption[]
  grapes: FilterOption[]
  countries: CountryFilterOption[]
  price: { min: number; max: number }
  alcohol: { min: number; max: number }
}): FilterOptionsState => {
  const priceRange: PriceRange = [
    Math.max(0, payload.price.min ?? 0),
    Math.max(payload.price.max ?? 0, DEFAULT_PRICE_MAX),
  ]

  const regions: FilterOption[] = payload.countries.flatMap((country) => country.regions)

  const alcoholRange: PriceRange = [
    Math.max(0, payload.alcohol.min ?? DEFAULT_ALCOHOL_RANGE[0]),
    Math.max(payload.alcohol.max ?? DEFAULT_ALCOHOL_RANGE[1], DEFAULT_ALCOHOL_RANGE[1]),
  ]

  return {
    categories: payload.categories,
    brands: payload.brands,
    grapes: payload.grapes,
    countries: payload.countries,
    regions,
    priceRange,
    alcoholRange,
  }
}

const initialState: WineStoreState = {
  options: {
    categories: [],
    brands: [],
    grapes: [],
    countries: [],
    regions: [],
    priceRange: [0, DEFAULT_PRICE_MAX],
    alcoholRange: DEFAULT_ALCOHOL_RANGE,
  },
  filters: {
    categoryId: null,
    brandIds: [],
    grapeIds: [],
    countryIds: [],
    regionIds: [],
    priceRange: [0, DEFAULT_PRICE_MAX],
    alcoholBuckets: [],
    sortBy: "name-asc",
    searchQuery: "",
    page: 1,
    perPage: DEFAULT_PER_PAGE,
  },
  products: [],
  wines: [],
  meta: null,
  loading: false,
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

    set({ loading: true, error: null })

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
      set({ error: message, loading: false })
    }
  },
  fetchProducts: async () => {
    const { filters, initialized } = get()
    if (!initialized) {
      return
    }

    set({ loading: true, error: null })

    try {
      const response = await fetchProductList(buildQueryParams(filters))
      const mapped = response.data.map(mapProductToWine)
      const filtered = applySearch(mapped, filters.searchQuery)

      set({
        products: mapped,
        wines: filtered,
        meta: response.meta,
        loading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai danh sach san pham."
      set({ error: message, loading: false })
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
        brandIds: [],
        grapeIds: [],
        countryIds: [],
        regionIds: [],
        priceRange: options.priceRange,
        alcoholBuckets: [],
        page: 1,
        sortBy: "name-asc",
        searchQuery: "",
      },
    }))

    get().fetchProducts()
  },
  setViewMode: (mode) => {
    set({ viewMode: mode })
  },
  setSearchQuery: (query) => {
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
      wines: applySearch(state.products, query),
    }))
  },
  setSelectedCategory: (id) => {
    set((state) => ({
      filters: {
        ...state.filters,
        categoryId: id,
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  toggleBrand: (id) => {
    set((state) => ({
      filters: {
        ...state.filters,
        brandIds: toggleIdInList(state.filters.brandIds, id),
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  toggleGrape: (id) => {
    set((state) => ({
      filters: {
        ...state.filters,
        grapeIds: toggleIdInList(state.filters.grapeIds, id),
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  toggleCountry: (id) => {
    set((state) => ({
      filters: {
        ...state.filters,
        countryIds: toggleIdInList(state.filters.countryIds, id),
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  toggleRegion: (id) => {
    set((state) => ({
      filters: {
        ...state.filters,
        regionIds: toggleIdInList(state.filters.regionIds, id),
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  setPriceRange: (range) => {
    set((state) => ({
      filters: {
        ...state.filters,
        priceRange: ensureRangeWithinBounds(range, state.options.priceRange),
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  toggleAlcoholBucket: (bucket) => {
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
    get().fetchProducts()
  },
  setSortBy: (sort) => {
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy: sort,
        page: 1,
      },
    }))
    get().fetchProducts()
  },
  setPage: (page) => {
    set((state) => ({
      filters: {
        ...state.filters,
        page,
      },
    }))
    get().fetchProducts()
  },
}))

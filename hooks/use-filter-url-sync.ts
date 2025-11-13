import { useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { useWineStore } from "@/data/filter/store"

/**
 * Hook to synchronize filter state with URL query parameters
 * Enables deep linking and shareable filter URLs
 * 
 * Best Practice: URL as Single Source of Truth
 * - Effect 1 (URL → Store): ALWAYS syncs when URL changes (navigation, back/forward, direct link)
 *   - Parses URL params or uses defaults if not present
 *   - Ensures /filter?type=1 → /filter correctly resets filters
 * - Effect 2 (Store → URL): Syncs filter changes to URL for shareable links
 * - Loop prevention: previousUrlParams tracks changes, isApplyingUrlParams prevents Effect 2 during Effect 1
 */
export function useFilterUrlSync() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isApplyingUrlParams = useRef(false)
  const previousUrlParams = useRef<string>("")
  const previousPathname = useRef<string>("")

  const {
    filters,
    initialized,
    options,
  } = useWineStore(
    useShallow((state) => ({
      filters: state.filters,
      initialized: state.initialized,
      options: state.options,
    }))
  )

  // Effect 1: URL → Store (ALWAYS sync when URL changes, not just on mount)
  // This ensures /filter?type=1 → /filter correctly resets filters
  useEffect(() => {
    if (!initialized) {
      return
    }

    // Detect if URL or pathname changed
    const currentUrlString = searchParams.toString()
    const pathnameChanged = pathname !== previousPathname.current
    
    // Skip only if BOTH URL and pathname haven't changed
    // CRITICAL: Don't skip if pathname changed (fresh navigation to /filter)
    if (!pathnameChanged && currentUrlString === previousUrlParams.current) {
      return
    }

    // Mark that we're syncing FROM URL TO store (prevents Effect 2 from running)
    isApplyingUrlParams.current = true
    previousUrlParams.current = currentUrlString
    previousPathname.current = pathname

    try {
      // Parse all URL params - if not present, use null/default values
      // This ensures filters are cleared when navigating from /filter?type=1 to /filter
      
      const categoryParam = searchParams.get("category")
      const categoryId = categoryParam ? parseInt(categoryParam, 10) : null
      
      const typeParam = searchParams.get("type")
      const typeId = typeParam ? parseInt(typeParam, 10) : null
      
      const searchParam = searchParams.get("q")
      const searchQuery = searchParam?.trim() || ""
      
      const sortParam = searchParams.get("sort")
      const sortBy = (sortParam && ["name-asc", "name-desc", "price-asc", "price-desc"].includes(sortParam)) 
        ? (sortParam as "name-asc" | "name-desc" | "price-asc" | "price-desc")
        : "name-asc"
      
      const priceMinParam = searchParams.get("price_min")
      const priceMaxParam = searchParams.get("price_max")
      const priceMin = priceMinParam ? parseInt(priceMinParam, 10) : options.priceRange[0]
      const priceMax = priceMaxParam ? parseInt(priceMaxParam, 10) : options.priceRange[1]
      
      // Alcohol buckets - parse from URL or empty array
      const alcoholParam = searchParams.get("alcohol")
      const alcoholBuckets = alcoholParam 
        ? (alcoholParam.split(",").filter(b => ["10", "10-12", "12-14", "14-16", "over16"].includes(b)) as Array<"10" | "10-12" | "12-14" | "14-16" | "over16">)
        : []
      
      // Dynamic attribute filters - parse from URL or empty object
      const attributeSelections: Record<string, number[]> = {}
      options.attributeFilters.forEach((attrFilter) => {
        const attrParam = searchParams.get(attrFilter.code)
        if (attrParam) {
          const ids = attrParam.split(",").map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
          if (ids.length > 0) {
            attributeSelections[attrFilter.code] = ids
          }
        }
      })

      // Apply ALL filters at once directly to store (atomic update)
      // This prevents partial state updates and is more predictable
      useWineStore.setState((state) => ({
        filters: {
          ...state.filters,
          categoryId: (categoryId && !isNaN(categoryId)) ? categoryId : null,
          productTypeId: (typeId && !isNaN(typeId)) ? typeId : null,
          priceRange: (!isNaN(priceMin) && !isNaN(priceMax)) ? [priceMin, priceMax] : options.priceRange,
          alcoholBuckets,
          sortBy,
          searchQuery,
          attributeSelections,
          page: 1,
        }
      }))

      // Fetch products once with all filters applied
      setTimeout(() => {
        isApplyingUrlParams.current = false
        useWineStore.getState().fetchProducts()
      }, 0)
    } catch (error) {
      isApplyingUrlParams.current = false
      throw error
    }
  }, [initialized, pathname, searchParams, options.attributeFilters, options.priceRange])

  // Effect 2: Store → URL (sync filter changes to URL for shareable links)
  useEffect(() => {
    if (!initialized || isApplyingUrlParams.current) {
      return
    }

    const params = new URLSearchParams()

    // Category
    if (filters.categoryId) {
      params.set("category", String(filters.categoryId))
    }

    // Product Type
    if (filters.productTypeId) {
      params.set("type", String(filters.productTypeId))
    }

    // Search query
    if (filters.searchQuery) {
      params.set("q", filters.searchQuery)
    }

    // Sort (only if not default)
    if (filters.sortBy !== "name-asc") {
      params.set("sort", filters.sortBy)
    }

    // Price range (only if not default)
    const isPriceChanged =
      filters.priceRange[0] !== options.priceRange[0] ||
      filters.priceRange[1] !== options.priceRange[1]
    if (isPriceChanged) {
      params.set("price_min", String(filters.priceRange[0]))
      params.set("price_max", String(filters.priceRange[1]))
    }

    // Alcohol buckets
    if (filters.alcoholBuckets.length > 0) {
      params.set("alcohol", filters.alcoholBuckets.join(","))
    }

    // Dynamic attribute filters
    Object.entries(filters.attributeSelections).forEach(([code, ids]) => {
      if (ids.length > 0) {
        params.set(code, ids.join(","))
      }
    })

    // Update URL without adding to history (replace instead of push)
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    const currentUrl = `${pathname}${window.location.search}`
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
      previousUrlParams.current = queryString
    }
  }, [
    filters,
    initialized,
    pathname,
    router,
    options.priceRange,
  ])
}

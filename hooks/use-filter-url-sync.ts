import { useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { useWineStore } from "@/data/filter/store"

/**
 * Hook to synchronize filter state with URL query parameters
 * Enables deep linking and shareable filter URLs
 */
export function useFilterUrlSync() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialMount = useRef(true)
  const isApplyingUrlParams = useRef(false)

  const {
    filters,
    initialized,
    setSelectedCategory,
    toggleAttributeFilter,
    setPriceRange,
    toggleAlcoholBucket,
    setSortBy,
    setSearchQuery,
    options,
  } = useWineStore(
    useShallow((state) => ({
      filters: state.filters,
      initialized: state.initialized,
      setSelectedCategory: state.setSelectedCategory,
      toggleAttributeFilter: state.toggleAttributeFilter,
      setPriceRange: state.setPriceRange,
      toggleAlcoholBucket: state.toggleAlcoholBucket,
      setSortBy: state.setSortBy,
      setSearchQuery: state.setSearchQuery,
      options: state.options,
    }))
  )

  // Read URL params on initial mount and apply to store
  useEffect(() => {
    if (!isInitialMount.current) {
      return
    }

    if (!initialized) {
      return
    }

    isInitialMount.current = false
    isApplyingUrlParams.current = true

    try {
      // Category
      const categoryParam = searchParams.get("category")
      if (categoryParam) {
        const categoryId = parseInt(categoryParam, 10)
        if (!isNaN(categoryId)) {
          setSelectedCategory(categoryId, true) // Skip fetch for now
        }
      }

      // Search query - set directly to avoid triggering Effect 2
      const searchParam = searchParams.get("q")

      // Sort
      const sortParam = searchParams.get("sort")
      if (sortParam && ["name-asc", "name-desc", "price-asc", "price-desc"].includes(sortParam)) {
        setSortBy(sortParam as any, true) // Skip fetch
      }

      // Price range
      const priceMinParam = searchParams.get("price_min")
      const priceMaxParam = searchParams.get("price_max")
      if (priceMinParam || priceMaxParam) {
        const priceMin = priceMinParam ? parseInt(priceMinParam, 10) : options.priceRange[0]
        const priceMax = priceMaxParam ? parseInt(priceMaxParam, 10) : options.priceRange[1]
        if (!isNaN(priceMin) && !isNaN(priceMax)) {
          setPriceRange([priceMin, priceMax], true) // Skip fetch
        }
      }

      // Alcohol buckets
      const alcoholParam = searchParams.get("alcohol")
      if (alcoholParam) {
        const buckets = alcoholParam.split(",")
        buckets.forEach((bucket) => {
          if (["10", "10-12", "12-14", "14-16", "over16"].includes(bucket)) {
            toggleAlcoholBucket(bucket as any, true) // Skip fetch
          }
        })
      }

      // Dynamic attribute filters (e.g., brand=1,2,3&grape=4,5)
      options.attributeFilters.forEach((attrFilter) => {
        const attrParam = searchParams.get(attrFilter.code)
        if (attrParam) {
          const ids = attrParam.split(",").map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
          ids.forEach((id) => {
            toggleAttributeFilter(attrFilter.code, id, true) // Skip fetch for each individual toggle
          })
        }
      })

      // Apply search query directly to store state without triggering actions
      if (searchParam) {
        useWineStore.setState((state) => ({
          filters: {
            ...state.filters,
            searchQuery: searchParam.trim(),
          }
        }))
      }

      // Now fetch products once with all filters applied
      setTimeout(() => {
        isApplyingUrlParams.current = false
        useWineStore.getState().fetchProducts()
      }, 0)
    } catch (error) {
      isApplyingUrlParams.current = false
      throw error
    }
  }, [initialized, searchParams, options.attributeFilters, options.priceRange])

  // Sync filters to URL whenever they change
  useEffect(() => {
    if (!initialized || isApplyingUrlParams.current || isInitialMount.current) {
      return
    }

    const params = new URLSearchParams()

    // Category
    if (filters.categoryId) {
      params.set("category", String(filters.categoryId))
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

    // Only update if URL actually changed
    const currentUrl = `${pathname}${window.location.search}`
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [
    filters,
    initialized,
    pathname,
    router,
    options.priceRange,
  ])
}

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { useWineStore } from "@/data/filter/store"
import type { ProductFilterOption } from "@/lib/api/products"

/**
 * Helper: Find ID by slug from options array
 */
const findIdBySlug = (options: ProductFilterOption[], slug: string): number | null => {
  const option = options.find((opt) => opt.slug === slug)
  return option?.id ?? null
}

/**
 * Helper: Find slug by ID from options array
 */
const findSlugById = (options: ProductFilterOption[], id: number): string | null => {
  const option = options.find((opt) => opt.id === id)
  return option?.slug ?? null
}

/**
 * Hook to synchronize filter state with URL query parameters
 * Enables deep linking and shareable filter URLs
 * 
 * Best Practice: URL as Single Source of Truth
 * - Effect 1 (URL → Store): ALWAYS syncs when URL changes (navigation, back/forward, direct link)
 *   - Parses URL params (slug) and converts to ID for store
 *   - Ensures /filter?type=vang-do → /filter correctly resets filters
 * - Effect 2 (Store → URL): Syncs filter changes to URL (converts ID to slug)
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
      // Parse all URL params (slug-based) - convert to IDs for store
      // This ensures filters are cleared when navigating from /filter?type=vang-do to /filter
      
      const categoryParam = searchParams.get("category")
      let categoryId: number | null = null
      if (categoryParam) {
        // Try as slug first, fallback to ID for backward compatibility
        categoryId = findIdBySlug(options.categories, categoryParam)
        if (categoryId === null) {
          const parsed = parseInt(categoryParam, 10)
          categoryId = !isNaN(parsed) ? parsed : null
        }
      }
      
      const typeParam = searchParams.get("type")
      let typeId: number | null = null
      if (typeParam) {
        // Try as slug first, fallback to ID for backward compatibility
        typeId = findIdBySlug(options.productTypes, typeParam)
        if (typeId === null) {
          const parsed = parseInt(typeParam, 10)
          typeId = !isNaN(parsed) ? parsed : null
        }
      }
      
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
      
      // Dynamic attribute filters - parse slug from URL, convert to IDs
      const attributeSelections: Record<string, number[]> = {}
      options.attributeFilters.forEach((attrFilter) => {
        const attrParam = searchParams.get(attrFilter.code)
        if (attrParam) {
          const slugs = attrParam.split(",")
          const ids: number[] = []
          slugs.forEach((slugOrId) => {
            // Try as slug first
            const idFromSlug = findIdBySlug(attrFilter.options, slugOrId)
            if (idFromSlug !== null) {
              ids.push(idFromSlug)
            } else {
              // Fallback to ID for backward compatibility
              const parsed = parseInt(slugOrId, 10)
              if (!isNaN(parsed)) {
                ids.push(parsed)
              }
            }
          })
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
  }, [initialized, pathname, searchParams, options.attributeFilters, options.priceRange, options.categories, options.productTypes])

  // Effect 2: Store → URL (sync filter changes to URL with slug for SEO-friendly URLs)
  useEffect(() => {
    if (!initialized || isApplyingUrlParams.current) {
      return
    }

    const params = new URLSearchParams()

    // Category - use slug instead of ID
    if (filters.categoryId) {
      const categorySlug = findSlugById(options.categories, filters.categoryId)
      params.set("category", categorySlug ?? String(filters.categoryId))
    }

    // Product Type - use slug instead of ID
    if (filters.productTypeId) {
      const typeSlug = findSlugById(options.productTypes, filters.productTypeId)
      params.set("type", typeSlug ?? String(filters.productTypeId))
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

    // Dynamic attribute filters - use slug instead of ID
    Object.entries(filters.attributeSelections).forEach(([code, ids]) => {
      if (ids.length > 0) {
        const attrFilter = options.attributeFilters.find((f) => f.code === code)
        if (attrFilter) {
          const slugs = ids.map((id) => {
            const slug = findSlugById(attrFilter.options, id)
            return slug ?? String(id)
          })
          params.set(code, slugs.join(","))
        } else {
          params.set(code, ids.join(","))
        }
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
    options.categories,
    options.productTypes,
    options.attributeFilters,
  ])
}

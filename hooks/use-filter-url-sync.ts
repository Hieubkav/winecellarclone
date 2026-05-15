import { useEffect, useRef } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { useWineStore } from "@/data/filter/store"
import { fetchProductFilters, type ProductFilterOption } from "@/lib/api/products"

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

const buildAttributePathSegments = (
  attributeSelections: Record<string, number[]>,
  attributeFilters: Array<{ code: string; slug: string; options: ProductFilterOption[] }>
) => {
  const segments: string[] = []

  Object.entries(attributeSelections).forEach(([code, ids]) => {
    if (ids.length === 0) {
      return
    }

    const attrFilter = attributeFilters.find((filter) => filter.code === code)
    if (!attrFilter?.slug) {
      return
    }

    const termSlugs = ids
      .map((id) => findSlugById(attrFilter.options, id))
      .filter((slug): slug is string => Boolean(slug))

    if (termSlugs.length > 0) {
      segments.push(attrFilter.slug, termSlugs.join(","))
    }
  })

  return segments
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
export function useFilterUrlSync(syncOptions?: {
  initialTypeSlug?: string | null
  initialCategorySlug?: string | null
  initialAttributeSelections?: Record<string, string[]>
  initialPriceRange?: { min: number; max: number } | null
  listingMode?: "generic" | "type-landing"
}) {
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

    const applyUrlFilters = async () => {
      try {
        // Parse all URL params (slug-based) - convert to IDs for store
        // This ensures filters are cleared when navigating from /filter?type=vang-do to /filter
        
        const categoryParam = searchParams.get("category") || syncOptions?.initialCategorySlug || null
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
        const routeTypeSlug = syncOptions?.initialTypeSlug?.trim() || null
        const listingMode = syncOptions?.listingMode ?? (routeTypeSlug ? "type-landing" : "generic")
        const effectiveTypeParam = listingMode === "type-landing" ? routeTypeSlug : (typeParam || routeTypeSlug)
        let typeId: number | null = null
        if (effectiveTypeParam) {
          // Try as slug first, fallback to ID for backward compatibility
          typeId = findIdBySlug(options.productTypes, effectiveTypeParam)
          if (typeId === null) {
            const parsed = parseInt(effectiveTypeParam, 10)
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
        const routePriceRange = syncOptions?.initialPriceRange ?? null
        const effectivePriceMin = routePriceRange ? routePriceRange.min : priceMin
        const effectivePriceMax = routePriceRange ? routePriceRange.max : priceMax
        
        // If type changed, fetch type-specific filters FIRST before parsing attribute params
        let attributeFiltersToUse = options.attributeFilters
        const currentTypeId = useWineStore.getState().filters.productTypeId
        
        const hasRouteType = listingMode === "type-landing" && Boolean(routeTypeSlug)
        const hasBaseNonDefaultParams = Boolean(
          hasRouteType ||
          typeId ||
          categoryId ||
          searchQuery ||
          sortBy !== "name-asc" ||
          effectivePriceMin !== options.priceRange[0] ||
          effectivePriceMax !== options.priceRange[1]
        )
        
        if (typeId && typeId !== currentTypeId && hasBaseNonDefaultParams) {
          try {
            const payload = await fetchProductFilters(typeId)
            attributeFiltersToUse = payload.attribute_filters
            
            // Update options in store with new filters
            useWineStore.setState((state) => ({
              options: {
                ...state.options,
                attributeFilters: payload.attribute_filters,
                categories: payload.categories,
              },
            }))
          } catch (error) {
            console.error('Failed to fetch type-specific filters:', error)
          }
        } else if (!typeId && currentTypeId && hasBaseNonDefaultParams) {
          // Type was cleared, fetch common filters
          try {
            const payload = await fetchProductFilters(null)
            attributeFiltersToUse = payload.attribute_filters
            
            useWineStore.setState((state) => ({
              options: {
                ...state.options,
                attributeFilters: payload.attribute_filters,
                categories: payload.categories,
              },
            }))
          } catch (error) {
            console.error('Failed to fetch common filters:', error)
          }
        }
        
        // Dynamic attribute filters - parse slug from URL, convert to IDs
        // Now using the correct attributeFilters for the selected type
        const attributeSelections: Record<string, number[]> = {}
        attributeFiltersToUse.forEach((attrFilter) => {
          const routeAttrSlugs = syncOptions?.initialAttributeSelections?.[attrFilter.code]
          const attrParam = searchParams.get(attrFilter.code) || (routeAttrSlugs?.join(",") ?? null)
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

        const hasAttributeParams = Object.keys(attributeSelections).length > 0
        const hasNonDefaultParams = hasBaseNonDefaultParams || hasAttributeParams

        // Check if filters actually changed
        const currentFilters = useWineStore.getState().filters
        const nextPriceRange: [number, number] = (!isNaN(effectivePriceMin) && !isNaN(effectivePriceMax))
          ? [effectivePriceMin, effectivePriceMax]
          : [options.priceRange[0], options.priceRange[1]]
        const filtersChanged =
          currentFilters.categoryId !== categoryId ||
          currentFilters.productTypeId !== typeId ||
          currentFilters.searchQuery !== searchQuery ||
          currentFilters.sortBy !== sortBy ||
          currentFilters.priceRange[0] !== nextPriceRange[0] ||
          currentFilters.priceRange[1] !== nextPriceRange[1] ||
          JSON.stringify(currentFilters.attributeSelections) !== JSON.stringify(attributeSelections)

        const hadActiveFiltersBeforeSync = Boolean(
          currentFilters.categoryId ||
          currentFilters.productTypeId ||
          currentFilters.searchQuery ||
          currentFilters.sortBy !== "name-asc" ||
          currentFilters.priceRange[0] !== options.priceRange[0] ||
          currentFilters.priceRange[1] !== options.priceRange[1] ||
          Object.keys(currentFilters.attributeSelections).some((code) => (currentFilters.attributeSelections[code]?.length ?? 0) > 0) ||
          Object.keys(currentFilters.rangeFilters ?? {}).length > 0
        )

        // Apply ALL filters at once directly to store (atomic update)
        // This prevents partial state updates and is more predictable
        useWineStore.setState((state) => ({
          filters: {
            ...state.filters,
            categoryId: (categoryId && !isNaN(categoryId)) ? categoryId : null,
            productTypeId: (typeId && !isNaN(typeId)) ? typeId : null,
            priceRange: nextPriceRange,
            sortBy,
            searchQuery,
            attributeSelections,
            rangeFilters: {},
            page: 1,
          }
        }))

        const shouldFetchProducts = filtersChanged && (hasNonDefaultParams || hadActiveFiltersBeforeSync)

        if (shouldFetchProducts) {
          await useWineStore.getState().fetchProducts()
        }
      } catch (error) {
        console.error('Error applying URL filters:', error)
      } finally {
        isApplyingUrlParams.current = false
      }
    }

    void applyUrlFilters()
  }, [
    initialized,
    pathname,
    searchParams,
    options.attributeFilters,
    options.priceRange,
    options.categories,
    options.productTypes,
    syncOptions?.initialTypeSlug,
    syncOptions?.initialCategorySlug,
    syncOptions?.initialAttributeSelections,
    syncOptions?.initialPriceRange,
    syncOptions?.listingMode,
  ])

  // Effect 2: Store → URL (sync filter changes to URL with slug for SEO-friendly URLs)
  useEffect(() => {
    if (!initialized || isApplyingUrlParams.current) {
      return
    }

    const params = new URLSearchParams()

    const listingMode = syncOptions?.listingMode ?? (syncOptions?.initialTypeSlug ? "type-landing" : "generic")
    const selectedTypeSlug = filters.productTypeId
      ? findSlugById(options.productTypes, filters.productTypeId)
      : null
    const selectedCategorySlug = filters.categoryId
      ? findSlugById(options.categories, filters.categoryId)
      : null

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

    if (listingMode === "type-landing") {
      const routePriceRange = syncOptions?.initialPriceRange ?? null
      if (
        routePriceRange &&
        params.get("price_min") === String(routePriceRange.min) &&
        params.get("price_max") === String(routePriceRange.max)
      ) {
        params.delete("price_min")
        params.delete("price_max")
      }
    }

    const pathSegments: string[] = []
    if (selectedTypeSlug) {
      pathSegments.push(selectedTypeSlug)
      if (selectedCategorySlug) {
        pathSegments.push(selectedCategorySlug)
      }
    } else if (selectedCategorySlug) {
      params.set("category", selectedCategorySlug)
    }

    pathSegments.push(...buildAttributePathSegments(filters.attributeSelections, options.attributeFilters))

    const basePath = pathSegments.length > 0 ? `/san-pham/${pathSegments.join("/")}` : "/san-pham"

    // Update URL without adding to history (replace instead of push)
    const queryString = params.toString()
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath
    const currentUrl = `${window.location.pathname}${window.location.search}`
    
    if (newUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", newUrl)
      previousUrlParams.current = queryString
    }
  }, [
    filters,
    initialized,
    pathname,
    options.priceRange,
    options.categories,
    options.productTypes,
    options.attributeFilters,
    syncOptions?.initialCategorySlug,
    syncOptions?.initialAttributeSelections,
    syncOptions?.initialPriceRange,
    syncOptions?.initialTypeSlug,
    syncOptions?.listingMode,
  ])
}

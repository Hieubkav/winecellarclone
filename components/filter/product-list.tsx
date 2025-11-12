"use client"

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react"
import { useShallow } from "zustand/react/shallow"
import { Grid3X3, List, Filter, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useWineStore, type SortOption, type Wine } from "@/data/filter/store"
import { useFilterUrlSync } from "@/hooks/use-filter-url-sync"
const FilterSidebar = lazy(() => import("./filter-sidebar").then(mod => ({ default: mod.FilterSidebar })))
const FilterProductCard = lazy(() => import("./product-card").then(mod => ({ default: mod.FilterProductCard })))
import { FilterSearchBar } from "./search-bar"
import { ProductSkeleton } from "./product-skeleton"



export default function WineList() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  // Sync filters with URL for shareable links
  useFilterUrlSync()
  const {
    wines,
    loading,
    loadingMore,
    error,
    viewMode,
    filters,
    meta,
    setViewMode,
    setSortBy,
    loadMore,
    setSearchQuery,
    initialize,
    initialized,
  } = useWineStore(
    useShallow((state) => ({
      wines: state.wines,
      loading: state.loading,
      loadingMore: state.loadingMore,
      error: state.error,
      viewMode: state.viewMode,
      filters: state.filters,
      meta: state.meta,
      setViewMode: state.setViewMode,
      setSortBy: state.setSortBy,
      loadMore: state.loadMore,
      setSearchQuery: state.setSearchQuery,
      initialize: state.initialize,
      initialized: state.initialized,
    })),
  )

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!initialized) {
      initialize().catch(() => undefined)
    }
  }, [initialized, initialize])

  const totalProducts = meta?.total ?? wines.length
  const totalPages = meta && meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 0
  const currentPage = filters.page
  const canLoadMore = !!meta && currentPage < totalPages

  const requestMore = useCallback(() => {
    if (!canLoadMore || loading || loadingMore) {
      return
    }

    void loadMore()
  }, [canLoadMore, loadMore, loading, loadingMore])

  useEffect(() => {
    const node = sentinelRef.current

    if (!node || !canLoadMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          requestMore()
        }
      },
      { rootMargin: "100px 0px" }, // Reduced from 600px to prevent aggressive pre-loading
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [canLoadMore, requestMore])

  return (
    <div className="bg-white text-[#1C1C1C]">
      <div className="mx-auto flex flex-col gap-10 px-4 py-8 lg:flex-row lg:py-12">
        <aside className="hidden w-full max-w-[300px] space-y-6 lg:block">
        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
            <FilterSidebar />
          </Suspense>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 relative z-30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4 sm:flex-none">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-[#ECAA4D] text-[#ECAA4D] hover:bg-[#ECAA4D] hover:text-white transition-colors"
                      aria-label="Mở bộ lọc"
                    >
                      <Filter className="h-4 w-4" />
                      Bộ lọc
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
                    <SheetHeader className="sticky top-0 z-10 bg-[#ECAA4D] py-4 px-6">
                      <SheetTitle className="text-center text-base font-semibold text-[#1C1C1C]">
                      Bộ lọc
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-3 text-[#1C1C1C] hover:bg-[#1C1C1C]/10"
                        onClick={() => setMobileFiltersOpen(false)}
                        aria-label="Đóng bộ lọc"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetHeader>
                    <div className="py-4 px-6">
                    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
                        <FilterSidebar />
                      </Suspense>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      Đang tải...
                    </span>
                  ) : (
                    <span>{totalProducts} sản phẩm</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="border border-[#ECAA4D]/60 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECAA4D] focus:border-[#ECAA4D] transition-colors bg-white text-[#1C1C1C] cursor-pointer hover:border-[#ECAA4D]"
                  aria-label="Sắp xếp sản phẩm"
                >
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="name-desc">Tên: Z-A</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>

                <div className="hidden sm:block">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                    <ToggleGroupItem value="grid" aria-label="Hiển thị dạng lưới" className="hover:bg-[#ECAA4D]/10 data-[state=on]:bg-[#ECAA4D] data-[state=on]:text-white">
                      <Grid3X3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="Hiển thị dạng danh sách" className="hover:bg-[#ECAA4D]/10 data-[state=on]:bg-[#ECAA4D] data-[state=on]:text-white">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FilterSearchBar
                value={filters.searchQuery}
                onChange={setSearchQuery}
                disabled={!initialized}
              />

              <div className="sm:hidden">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                  <ToggleGroupItem value="grid" aria-label="Hiển thị dạng lưới" size="sm" className="hover:bg-[#ECAA4D]/10 data-[state=on]:bg-[#ECAA4D] data-[state=on]:text-white">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Hiển thị dạng danh sách" size="sm" className="hover:bg-[#ECAA4D]/10 data-[state=on]:bg-[#ECAA4D] data-[state=on]:text-white">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          {error ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Loading overlay with backdrop - only covers products area */}
              {loading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg min-h-[400px]">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-[#ECAA4D]" />
                    <p className="text-sm text-muted-foreground font-medium">Đang tải sản phẩm...</p>
                  </div>
                </div>
              )}

              {/* Products grid with smooth transition */}
              <div
                className={`grid gap-4 sm:gap-6 transition-opacity duration-300 ${
                  viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                } ${loading ? "opacity-50" : "opacity-100"}`}
              >
                {wines.length === 0 && !loading ? (
                  <div className="col-span-full py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3 px-6 py-8 rounded-lg bg-gray-50">
                      <svg className="h-16 w-16 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-muted-foreground font-medium">Không tìm thấy sản phẩm phù hợp</p>
                      <p className="text-sm text-muted-foreground/70">Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </div>
                ) : loading && wines.length === 0 ? (
                  // Show skeletons on first load
                  Array.from({ length: 6 }).map((_, index) => (
                    <ProductSkeleton key={`skeleton-${index}`} />
                  ))
                ) : (
                  <Suspense fallback={
                    Array.from({ length: 6 }).map((_, index) => (
                      <ProductSkeleton key={`skeleton-suspense-${index}`} />
                    ))
                  }>
                    {wines.map((wine: Wine, index) => (
                      <FilterProductCard
                        key={wine.id}
                        wine={wine}
                        viewMode={viewMode}
                        priority={index < 4}
                      />
                    ))}
                  </Suspense>
                )}
              </div>
            </div>
          )}

          <div ref={sentinelRef} className="flex justify-center py-10">
            {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-[#ECAA4D]" aria-hidden="true" />}
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react"
import { useShallow } from "zustand/react/shallow"
import { LayoutGrid, List, Filter, Loader2, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWineStore, type SortOption, type Wine } from "@/data/filter/store"
import { useFilterUrlSync } from "@/hooks/use-filter-url-sync"
import { FilterSearchBar } from "./search-bar"
import { ProductSkeleton } from "./product-skeleton"

const FilterSidebar = lazy(() => import("./filter-sidebar").then(mod => ({ default: mod.FilterSidebar })))
const FilterProductCard = lazy(() => import("./product-card").then(mod => ({ default: mod.FilterProductCard })))

export default function WineList() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
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
        if (entry?.isIntersecting) {
          requestMore()
        }
      },
      { rootMargin: "100px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, requestMore])

  return (
    <div className="flex flex-col font-sans text-stone-800 bg-stone-50 min-h-screen" suppressHydrationWarning>
      
      <main className="container mx-auto flex-1 px-4 py-6 md:py-8">
        {/* Page Title & Search (Desktop) */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#9B2C3B]">Sản phẩm của chúng tôi</h1>
          </div>
          <div className="hidden w-full max-w-xs md:block">
            <FilterSearchBar
              value={filters.searchQuery}
              onChange={setSearchQuery}
              disabled={!initialized}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden w-64 flex-none lg:block">
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
              <FilterSidebar />
            </Suspense>
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Toolbar - Sticky on Mobile */}
            <div className="sticky top-0 z-30 -mx-4 mb-4 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md transition-all sm:static sm:mx-0 sm:mb-6 sm:rounded-lg sm:border sm:border-stone-100/50 sm:bg-white sm:p-4 sm:shadow-sm">
              <div className="flex items-center justify-between gap-3">
                {/* Filter Button (Mobile) & Count */}
                <div className="flex items-center gap-3">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 bg-stone-50 border-stone-200 text-stone-700 h-9"
                      >
                        <Filter size={15} /> <span className="text-xs font-medium">Bộ lọc</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
                      <SheetHeader className="sticky top-0 z-10 bg-stone-50 -mx-6 mb-6 px-6 py-4">
                        <SheetTitle className="text-base font-semibold text-stone-900 flex items-center gap-2">
                          <Filter size={18} /> Bộ lọc & Tìm kiếm
                        </SheetTitle>
                      </SheetHeader>
                      <div className="space-y-6 px-6">
                        <div>
                          <label className="text-sm font-bold text-stone-900 mb-2 block">Tìm kiếm</label>
                          <FilterSearchBar
                            value={filters.searchQuery}
                            onChange={setSearchQuery}
                            disabled={!initialized}
                          />
                        </div>
                        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
                          <FilterSidebar />
                        </Suspense>
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  <div className="text-xs text-stone-500 sm:text-sm">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Đang tải...
                      </span>
                    ) : (
                      <>
                        <strong className="text-stone-900">{totalProducts}</strong>
                        <span> SP</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Controls (Sort & View) */}
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                  <div className="relative">
                    <select 
                      value={filters.sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="h-9 appearance-none rounded-sm border border-stone-200 bg-stone-50 pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#9B2C3B] cursor-pointer text-stone-700 hover:border-[#ECAA4D] sm:text-sm w-[110px] sm:w-auto truncate"
                    >
                      <option value="name-asc">Tên: A-Z</option>
                      <option value="name-desc">Tên: Z-A</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                    <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>

                  <div className="hidden sm:flex items-center rounded-md border border-stone-200 p-1 bg-stone-50 shrink-0">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`rounded-sm p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-[#9B2C3B] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                      title="Lưới"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`rounded-sm p-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-[#9B2C3B] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                      title="Danh sách"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error State */}
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
                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-[#ECAA4D]" />
                      <p className="text-sm text-stone-500 font-medium">Đang tải sản phẩm...</p>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                <div
                  className={`grid transition-opacity duration-300 ${
                    viewMode === "grid" 
                      ? "grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4" 
                      : "grid-cols-1 gap-4"
                  } ${loading ? "opacity-50" : "opacity-100"}`}
                >
                  {wines.length === 0 && !loading ? (
                    <div className="col-span-full py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3 px-6 py-8 rounded-lg bg-stone-100">
                        <svg className="h-16 w-16 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-stone-600 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                        <p className="text-sm text-stone-500">Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </div>
                  ) : loading && wines.length === 0 ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <ProductSkeleton key={`skeleton-${index}`} />
                    ))
                  ) : (
                    <Suspense fallback={
                      Array.from({ length: 8 }).map((_, index) => (
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

            {/* Load More / Pagination */}
            <div ref={sentinelRef} className="mt-8 flex justify-center pb-8 sm:mt-12">
              {loadingMore ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#ECAA4D]" />
              ) : canLoadMore ? (
                <Button 
                  variant="ghost" 
                  onClick={requestMore}
                  className="w-full sm:w-auto min-w-[200px] text-stone-500 hover:text-[#9B2C3B] hover:bg-stone-100 border border-stone-100 sm:border-0"
                >
                  Xem thêm sản phẩm
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

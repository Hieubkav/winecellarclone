"use client"

import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { Search, Grid3X3, List, Filter, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useWineStore, type SortOption, type Wine } from "@/data/filter/store"
import { FilterSidebar } from "./filter-sidebar"
import { FilterProductCard } from "./product-card"


interface LoadMoreProps {
  active: boolean
  loading: boolean
  onLoadMore: () => void
}

function LoadMoreTrigger({ active, loading, onLoadMore }: LoadMoreProps) {
  if (!active) {
    return null
  }

  return (
    <div className="mt-8 flex justify-center">
      <Button
        size="lg"
        className="rounded-full bg-[#ECAA4D] px-6 text-[#1C1C1C] transition-all hover:bg-[#ECAA4D] hover:opacity-90 focus-visible:ring-[#ECAA4D]"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chờ
          </>
        ) : (
          "Thêm"
        )}
      </Button>
    </div>
  )
}

export default function WineList() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
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

  useEffect(() => {
    if (!initialized) {
      initialize().catch(() => undefined)
    }
  }, [initialized, initialize])

  const totalProducts = meta?.total ?? wines.length
  const totalPages = meta && meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 0
  const currentPage = filters.page
  const canLoadMore = !!meta && currentPage < totalPages

  return (
    <div className="bg-white text-[#1C1C1C]">
      <div className="mx-auto flex flex-col gap-10 px-4 py-8 lg:flex-row lg:py-12">
        <aside className="hidden w-full max-w-[300px] space-y-6 lg:block">
          <FilterSidebar />
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4 sm:flex-none">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-[#ECAA4D] text-[#ECAA4D]"
                    >
                      <Filter className="h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
                    <SheetHeader className="relative sticky top-0 z-10 bg-[#ECAA4D] py-4 px-6">
                      <SheetTitle className="text-center text-base font-semibold text-[#1C1C1C]">
                        Bộ lọc
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-3 text-[#1C1C1C]"
                        onClick={() => setMobileFiltersOpen(false)}
                        aria-label="Đóng bộ lọc"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetHeader>
                    <div className="py-4 px-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  {loading ? "Đợi..." : `${totalProducts} sp`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>

                <div className="hidden sm:block">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                      <Grid3X3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Tìm..."
                  value={filters.searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10"
                />
              </div>

              <div className="sm:hidden">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                  <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" size="sm">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Đợi...</div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">{error}</div>
          ) : wines.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Chưa có.</div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {wines.map((wine: Wine) => (
                <FilterProductCard
                  key={wine.id}
                  wine={wine}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          <LoadMoreTrigger
            active={!loading && canLoadMore}
            loading={loadingMore}
            onLoadMore={() => {
              void loadMore()
            }}
          />
        </main>
      </div>
    </div>
  )
}

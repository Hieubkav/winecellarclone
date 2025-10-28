"use client"

import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { Search, Grid3X3, List, Filter, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useWineStore, type SortOption, type Wine } from "@/data/filter/store"
import { FilterProductCard } from "./product-card"

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const ALCOHOL_FILTERS = [
  { id: "10", label: "Dưới 10%" },
  { id: "10-12", label: "10% - 12%" },
  { id: "12-14", label: "12% - 14%" },
  { id: "14-16", label: "14% - 16%" },
  { id: "over16", label: "Trên 16%" },
] as const

type AlcoholFilterId = typeof ALCOHOL_FILTERS[number]["id"]

function FilterSection() {
  const {
    options,
    filters,
    setPriceRange,
    toggleCountry,
    toggleGrape,
    toggleRegion,
    toggleBrand,
    toggleAlcoholBucket,
    setSelectedCategory,
    resetFilters,
  } = useWineStore(
    useShallow((state) => ({
      options: state.options,
      filters: state.filters,
      setPriceRange: state.setPriceRange,
      toggleCountry: state.toggleCountry,
      toggleGrape: state.toggleGrape,
      toggleRegion: state.toggleRegion,
      toggleBrand: state.toggleBrand,
      toggleAlcoholBucket: state.toggleAlcoholBucket,
      setSelectedCategory: state.setSelectedCategory,
      resetFilters: state.resetFilters,
    })),
  )

  const sliderDisabled = options.priceRange[1] <= options.priceRange[0]
  const categoryValue = filters.categoryId ? String(filters.categoryId) : "all"

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : Number(value))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Bộ lọc</h3>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-xs text-[#9B2C3B]"
          onClick={() => {
            resetFilters()
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Làm mới
        </Button>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Danh mục liên quan</h3>
        <RadioGroup value={categoryValue} onValueChange={handleCategoryChange}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="category-all" />
              <Label htmlFor="category-all" className="cursor-pointer text-sm font-normal">
                Tất cả
              </Label>
            </div>
            {options.categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={String(category.id)} id={`category-${category.id}`} />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Quốc gia</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {options.countries.map((country) => (
            <div key={country.id} className="flex items-center space-x-2">
              <Checkbox
                id={`country-${country.id}`}
                checked={filters.countryIds.includes(country.id)}
                onCheckedChange={() => toggleCountry(country.id)}
              />
              <Label htmlFor={`country-${country.id}`} className="cursor-pointer text-sm font-normal">
                {country.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Giống nho</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {options.grapes.map((grape) => (
            <div key={grape.id} className="flex items-center space-x-2">
              <Checkbox
                id={`grape-${grape.id}`}
                checked={filters.grapeIds.includes(grape.id)}
                onCheckedChange={() => toggleGrape(grape.id)}
              />
              <Label htmlFor={`grape-${grape.id}`} className="cursor-pointer text-sm font-normal">
                {grape.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Vùng</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {options.regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region.id}`}
                checked={filters.regionIds.includes(region.id)}
                onCheckedChange={() => toggleRegion(region.id)}
              />
              <Label htmlFor={`region-${region.id}`} className="cursor-pointer text-sm font-normal">
                {region.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Thương hiệu</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {options.brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brandIds.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              />
              <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm font-normal">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Giá</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setPriceRange([value[0] ?? options.priceRange[0], value[1] ?? options.priceRange[1]])}
            min={options.priceRange[0]}
            max={options.priceRange[1]}
            step={50_000}
            disabled={sliderDisabled}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(filters.priceRange[0])}</span>
            <span>{formatCurrency(filters.priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Nồng độ</h3>
        <div className="space-y-3">
          {ALCOHOL_FILTERS.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`alcohol-${item.id}`}
                checked={filters.alcoholBuckets.includes(item.id)}
                onCheckedChange={() => toggleAlcoholBucket(item.id as AlcoholFilterId)}
              />
              <Label htmlFor={`alcohol-${item.id}`} className="cursor-pointer text-sm font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface PaginationControlsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </Button>
      <span className="text-sm text-muted-foreground">
        Trang {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function WineList() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const {
    wines,
    loading,
    error,
    viewMode,
    filters,
    meta,
    setViewMode,
    setSortBy,
    setPage,
    setSearchQuery,
    initialize,
    initialized,
  } = useWineStore(
    useShallow((state) => ({
      wines: state.wines,
      loading: state.loading,
      error: state.error,
      viewMode: state.viewMode,
      filters: state.filters,
      meta: state.meta,
      setViewMode: state.setViewMode,
      setSortBy: state.setSortBy,
      setPage: state.setPage,
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
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.per_page)) : 1
  const currentPage = filters.page

  return (
    <div className="bg-white text-[#1C1C1C]">
      <div className="mx-auto flex flex-col gap-10 px-4 py-8 lg:flex-row lg:py-12">
        <aside className="hidden w-full max-w-[300px] space-y-6 lg:block">
          <FilterSection />
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
                      <FilterSection />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  {loading ? "Đang tải dữ liệu..." : `${totalProducts} sản phẩm`}
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
                  placeholder="Tìm kiếm sản phẩm..."
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
            <div className="py-12 text-center text-muted-foreground">Đang tải dữ liệu sản phẩm...</div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">{error}</div>
          ) : wines.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</div>
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

          <div className="mt-8">
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

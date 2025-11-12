"use client"

import { useShallow } from "zustand/react/shallow"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useWineStore } from "@/data/filter/store"

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

type AlcoholFilterId = (typeof ALCOHOL_FILTERS)[number]["id"]

export function FilterSidebar() {
  const {
    options,
    filters,
    setPriceRange,
    toggleAttributeFilter,
    toggleAlcoholBucket,
    setSelectedCategory,
    setSelectedProductType,
    resetFilters,
  } = useWineStore(
    useShallow((state) => ({
      options: state.options,
      filters: state.filters,
      setPriceRange: state.setPriceRange,
      toggleAttributeFilter: state.toggleAttributeFilter,
      toggleAlcoholBucket: state.toggleAlcoholBucket,
      setSelectedCategory: state.setSelectedCategory,
      setSelectedProductType: state.setSelectedProductType,
      resetFilters: state.resetFilters,
    })),
  )

  const sliderDisabled = options.priceRange[1] <= options.priceRange[0]
  const categoryValue = filters.categoryId ? String(filters.categoryId) : "all"
  const productTypeValue = filters.productTypeId ? String(filters.productTypeId) : "all"

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : Number(value))
  }

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value === "all" ? null : Number(value))
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

      {/* Categories (Built-in filter) */}
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

      {/* Product Types (Built-in filter) */}
      {options.productTypes.length > 0 && (
        <>
          <div>
            <h3 className="mb-3 font-semibold">Loại sản phẩm</h3>
            <RadioGroup value={productTypeValue} onValueChange={handleProductTypeChange}>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="type-all" />
                  <Label htmlFor="type-all" className="cursor-pointer text-sm font-normal">
                    Tất cả
                  </Label>
                </div>
                {options.productTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(type.id)} id={`type-${type.id}`} />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />
        </>
      )}

      {/* Dynamic Attribute Filters */}
      {options.attributeFilters.map((attributeFilter) => {
        const selectedIds = filters.attributeSelections[attributeFilter.code] || []
        
        return (
          <div key={attributeFilter.code}>
            <div>
              <h3 className="mb-3 font-semibold">{attributeFilter.name}</h3>
              <div className="max-h-48 space-y-3 overflow-y-auto">
                {attributeFilter.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${attributeFilter.code}-${option.id}`}
                      checked={selectedIds.includes(option.id)}
                      onCheckedChange={() => toggleAttributeFilter(attributeFilter.code, option.id)}
                    />
                    <Label
                      htmlFor={`${attributeFilter.code}-${option.id}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {option.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="mt-6" />
          </div>
        )
      })}

      {/* Price Filter (Built-in) */}
      <div>
        <h3 className="mb-3 font-semibold">Giá</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => {
              // Update local state immediately for smooth UI
              setPriceRange([value[0] ?? options.priceRange[0], value[1] ?? options.priceRange[1]], true)
            }}
            onValueCommit={(value) => {
              // Only trigger API call when user releases the slider
              setPriceRange([value[0] ?? options.priceRange[0], value[1] ?? options.priceRange[1]], false)
            }}
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

      {/* Alcohol Filter (Built-in) */}
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

"use client"

import { useMemo, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { RotateCcw, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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

const COLLAPSE_THRESHOLD = 6

interface CollapsibleFilterSectionProps {
  title: string
  items: { id: number; name: string }[]
  selectedIds: number[]
  onToggle: (id: number) => void
  code: string
}

function CollapsibleFilterSection({ 
  title, 
  items, 
  selectedIds, 
  onToggle, 
  code 
}: CollapsibleFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCount = selectedIds.length
  const shouldCollapse = items.length > COLLAPSE_THRESHOLD
  const visibleItems = shouldCollapse && !isOpen ? items.slice(0, COLLAPSE_THRESHOLD) : items
  const hiddenCount = items.length - COLLAPSE_THRESHOLD

  if (shouldCollapse) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
            {title}
          </h3>
          {selectedCount > 0 && (
            <span 
              className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-xs font-semibold text-white bg-[#ECAA4D] rounded-full"
              aria-label={`${selectedCount} ${title} đã chọn`}
            >
              {selectedCount}
            </span>
          )}
        </div>
        
        <div className="space-y-2.5" role="group" aria-label={`Lọc theo ${title}`}>
          {visibleItems.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={`${code}-${option.id}`}
                checked={selectedIds.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
                className="transition-colors"
              />
              <Label
                htmlFor={`${code}-${option.id}`}
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
              >
                {option.name}
              </Label>
            </div>
          ))}
        </div>

        <CollapsibleContent className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          {items.slice(COLLAPSE_THRESHOLD).map((option) => (
            <div key={option.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={`${code}-${option.id}`}
                checked={selectedIds.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
                className="transition-colors"
              />
              <Label
                htmlFor={`${code}-${option.id}`}
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
              >
                {option.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>

        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#9B2C3B] hover:text-[#1C1C1C] hover:bg-[#ECAA4D]/10 transition-all mt-2"
          >
            <span>{isOpen ? 'Thu gọn' : `Xem thêm ${hiddenCount}`}</span>
            <ChevronDown 
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </Button>
        </CollapsibleTrigger>
      </Collapsible>
    )
  }

  // Non-collapsible version for short lists
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
          {title}
        </h3>
        {selectedCount > 0 && (
          <span 
            className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-xs font-semibold text-white bg-[#ECAA4D] rounded-full"
            aria-label={`${selectedCount} ${title} đã chọn`}
          >
            {selectedCount}
          </span>
        )}
      </div>
      <div className="space-y-2.5" role="group" aria-label={`Lọc theo ${title}`}>
        {items.map((option) => (
          <div key={option.id} className="flex items-center space-x-3 group">
            <Checkbox
              id={`${code}-${option.id}`}
              checked={selectedIds.includes(option.id)}
              onCheckedChange={() => onToggle(option.id)}
              className="transition-colors"
            />
            <Label
              htmlFor={`${code}-${option.id}`}
              className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
            >
              {option.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categoryId) count++
    if (filters.productTypeId) count++
    if (filters.alcoholBuckets.length > 0) count += filters.alcoholBuckets.length
    Object.values(filters.attributeSelections).forEach(selections => {
      count += selections.length
    })
    const isPriceFiltered = filters.priceRange[0] !== options.priceRange[0] || 
                           filters.priceRange[1] !== options.priceRange[1]
    if (isPriceFiltered) count++
    return count
  }, [filters, options.priceRange])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : Number(value))
  }

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value === "all" ? null : Number(value))
  }

  return (
    <div className="space-y-6">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#ECAA4D]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#1C1C1C]">Bộ lọc</h2>
          {activeFilterCount > 0 && (
            <span 
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#ECAA4D] rounded-full"
              aria-label={`${activeFilterCount} bộ lọc đang áp dụng`}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-xs font-medium text-[#9B2C3B] hover:text-[#1C1C1C] hover:bg-[#ECAA4D]/10 transition-colors"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
          aria-label="Xóa tất cả bộ lọc"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Làm mới
        </Button>
      </div>

      {/* Categories (Built-in filter) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
          Danh mục
        </h3>
        <RadioGroup 
          value={categoryValue} 
          onValueChange={handleCategoryChange}
          aria-label="Chọn danh mục sản phẩm"
        >
          <div className="space-y-2.5">
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem 
                value="all" 
                id="category-all"
                className="transition-colors" 
              />
              <Label 
                htmlFor="category-all" 
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
              >
                Tất cả
              </Label>
            </div>
            {options.categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-3 group">
                <RadioGroupItem 
                  value={String(category.id)} 
                  id={`category-${category.id}`}
                  className="transition-colors"
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator className="bg-[#ECAA4D]/20" />

      {/* Product Types (Built-in filter) */}
      {options.productTypes.length > 0 && (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
              Loại sản phẩm
            </h3>
            <RadioGroup 
              value={productTypeValue} 
              onValueChange={handleProductTypeChange}
              aria-label="Chọn loại sản phẩm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem 
                    value="all" 
                    id="type-all"
                    className="transition-colors"
                  />
                  <Label 
                    htmlFor="type-all" 
                    className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
                  >
                    Tất cả
                  </Label>
                </div>
                {options.productTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-3 group">
                    <RadioGroupItem 
                      value={String(type.id)} 
                      id={`type-${type.id}`}
                      className="transition-colors"
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
                    >
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-[#ECAA4D]/20" />
        </>
      )}

      {/* Dynamic Attribute Filters */}
      {options.attributeFilters.map((attributeFilter) => {
        const selectedIds = filters.attributeSelections[attributeFilter.code] || []
        
        return (
          <div key={attributeFilter.code}>
            <CollapsibleFilterSection
              title={attributeFilter.name}
              items={attributeFilter.options}
              selectedIds={selectedIds}
              onToggle={(id) => toggleAttributeFilter(attributeFilter.code, id)}
              code={attributeFilter.code}
            />
            <Separator className="bg-[#ECAA4D]/20 mt-6" />
          </div>
        )
      })}

      {/* Price Filter (Built-in) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
          Khoảng giá
        </h3>
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
            aria-label="Chọn khoảng giá"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 px-3 py-2 text-xs font-medium text-center bg-[#ECAA4D]/10 text-[#1C1C1C] rounded-md border border-[#ECAA4D]/20">
              {formatCurrency(filters.priceRange[0])}
            </div>
            <span className="text-[#1C1C1C]/40 text-xs">-</span>
            <div className="flex-1 px-3 py-2 text-xs font-medium text-center bg-[#ECAA4D]/10 text-[#1C1C1C] rounded-md border border-[#ECAA4D]/20">
              {formatCurrency(filters.priceRange[1])}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-[#ECAA4D]/20" />

      {/* Alcohol Filter (Built-in) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
            Nồng độ cồn
          </h3>
          {filters.alcoholBuckets.length > 0 && (
            <span 
              className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-xs font-semibold text-white bg-[#ECAA4D] rounded-full"
              aria-label={`${filters.alcoholBuckets.length} mức độ đã chọn`}
            >
              {filters.alcoholBuckets.length}
            </span>
          )}
        </div>
        <div 
          className="space-y-2.5"
          role="group"
          aria-label="Lọc theo nồng độ cồn"
        >
          {ALCOHOL_FILTERS.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={`alcohol-${item.id}`}
                checked={filters.alcoholBuckets.includes(item.id)}
                onCheckedChange={() => toggleAlcoholBucket(item.id as AlcoholFilterId)}
                className="transition-colors"
              />
              <Label 
                htmlFor={`alcohol-${item.id}`} 
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

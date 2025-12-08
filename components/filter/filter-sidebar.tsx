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

const COLLAPSE_THRESHOLD = 6

interface CollapsibleCheckboxSectionProps {
  title: string
  items: { id: number; name: string; count?: number }[]
  selectedIds: number[]
  onToggle: (id: number) => void
  code: string
  hideZeroCount?: boolean
}

function CollapsibleCheckboxSection({ 
  title, 
  items, 
  selectedIds, 
  onToggle, 
  code,
  hideZeroCount = true 
}: CollapsibleCheckboxSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCount = selectedIds.length
  
  // Lọc bỏ items có count = 0 nếu hideZeroCount = true
  const filteredItems = hideZeroCount 
    ? items.filter(item => item.count === undefined || item.count > 0)
    : items
  
  const shouldCollapse = filteredItems.length > COLLAPSE_THRESHOLD
  const visibleItems = shouldCollapse && !isOpen ? filteredItems.slice(0, COLLAPSE_THRESHOLD) : filteredItems
  const hiddenCount = filteredItems.length - COLLAPSE_THRESHOLD

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
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
              >
                <span>{option.name}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
                )}
              </Label>
            </div>
          ))}
        </div>

        <CollapsibleContent className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          {filteredItems.slice(COLLAPSE_THRESHOLD).map((option) => (
            <div key={option.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={`${code}-${option.id}`}
                checked={selectedIds.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
                className="transition-colors"
              />
              <Label
                htmlFor={`${code}-${option.id}`}
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
              >
                <span>{option.name}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
                )}
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

  // Nếu không có items sau khi filter → không render
  if (filteredItems.length === 0) {
    return null
  }

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
        {filteredItems.map((option) => (
          <div key={option.id} className="flex items-center space-x-3 group">
            <Checkbox
              id={`${code}-${option.id}`}
              checked={selectedIds.includes(option.id)}
              onCheckedChange={() => onToggle(option.id)}
              className="transition-colors"
            />
            <Label
              htmlFor={`${code}-${option.id}`}
              className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
            >
              <span>{option.name}</span>
              {option.count !== undefined && (
                <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
              )}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RadioFilterSectionProps {
  title: string
  items: { id: number; name: string; count?: number }[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  code: string
  hideZeroCount?: boolean
}

interface RangeSliderSectionProps {
  title: string
  min: number
  max: number
  currentMin: number
  currentMax: number
  onRangeChange: (min: number, max: number, skipFetch?: boolean) => void
  step?: number
  unit?: string
}

function RangeSliderSection({
  title,
  min,
  max,
  currentMin,
  currentMax,
  onRangeChange,
  step = 1,
  unit = "",
}: RangeSliderSectionProps) {
  const sliderDisabled = max <= min

  const formatValue = (value: number) => {
    return unit ? `${value}${unit}` : String(value)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-4">
        <Slider
          value={[currentMin, currentMax]}
          onValueChange={(value) => {
            onRangeChange(value[0] ?? min, value[1] ?? max, true)
          }}
          onValueCommit={(value) => {
            onRangeChange(value[0] ?? min, value[1] ?? max, false)
          }}
          min={min}
          max={max}
          step={step}
          disabled={sliderDisabled}
          className="w-full"
          aria-label={`Chọn khoảng ${title}`}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 px-3 py-2 text-xs font-medium text-center bg-[#ECAA4D]/10 text-[#1C1C1C] rounded-md border border-[#ECAA4D]/20">
            {formatValue(currentMin)}
          </div>
          <span className="text-[#1C1C1C]/40 text-xs">-</span>
          <div className="flex-1 px-3 py-2 text-xs font-medium text-center bg-[#ECAA4D]/10 text-[#1C1C1C] rounded-md border border-[#ECAA4D]/20">
            {formatValue(currentMax)}
          </div>
        </div>
      </div>
    </div>
  )
}

function RadioFilterSection({
  title,
  items,
  selectedId,
  onSelect,
  code,
  hideZeroCount = true,
}: RadioFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Lọc bỏ items có count = 0 nếu hideZeroCount = true
  const filteredItems = hideZeroCount 
    ? items.filter(item => item.count === undefined || item.count > 0)
    : items
  
  const shouldCollapse = filteredItems.length > COLLAPSE_THRESHOLD
  const visibleItems = shouldCollapse && !isOpen ? filteredItems.slice(0, COLLAPSE_THRESHOLD) : filteredItems
  const hiddenCount = filteredItems.length - COLLAPSE_THRESHOLD

  const handleChange = (value: string) => {
    onSelect(value === "all" ? null : Number(value))
  }

  if (shouldCollapse) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
          {title}
        </h3>
        
        <RadioGroup
          value={selectedId !== null ? String(selectedId) : "all"}
          onValueChange={handleChange}
          aria-label={`Lọc theo ${title}`}
        >
          <div className="space-y-2.5">
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem value="all" id={`${code}-all`} className="transition-colors" />
              <Label
                htmlFor={`${code}-all`}
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
              >
                Tất cả
              </Label>
            </div>
            {visibleItems.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 group">
                <RadioGroupItem
                  value={String(option.id)}
                  id={`${code}-${option.id}`}
                  className="transition-colors"
                />
                <Label
                  htmlFor={`${code}-${option.id}`}
                  className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
                >
                  <span>{option.name}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <CollapsibleContent className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          <RadioGroup
            value={selectedId !== null ? String(selectedId) : "all"}
            onValueChange={handleChange}
          >
            {filteredItems.slice(COLLAPSE_THRESHOLD).map((option) => (
              <div key={option.id} className="flex items-center space-x-3 group">
                <RadioGroupItem
                  value={String(option.id)}
                  id={`${code}-${option.id}`}
                  className="transition-colors"
                />
                <Label
                  htmlFor={`${code}-${option.id}`}
                  className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
                >
                  <span>{option.name}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
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

  // Nếu không có items sau khi filter → không render
  if (filteredItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
        {title}
      </h3>
      <RadioGroup
        value={selectedId !== null ? String(selectedId) : "all"}
        onValueChange={handleChange}
        aria-label={`Lọc theo ${title}`}
      >
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 group">
            <RadioGroupItem value="all" id={`${code}-all`} className="transition-colors" />
            <Label
              htmlFor={`${code}-all`}
              className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1"
            >
              Tất cả
            </Label>
          </div>
          {filteredItems.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 group">
              <RadioGroupItem
                value={String(option.id)}
                id={`${code}-${option.id}`}
                className="transition-colors"
              />
              <Label
                htmlFor={`${code}-${option.id}`}
                className="cursor-pointer text-sm font-normal text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors flex-1 flex items-center justify-between"
              >
                <span>{option.name}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-[#1C1C1C]/50">({option.count})</span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export function FilterSidebar() {
  const {
    options,
    filters,
    setPriceRange,
    setRangeFilter,
    toggleAttributeFilter,
    setAttributeSelection,
    setSelectedCategory,
    setSelectedProductType,
    resetFilters,
  } = useWineStore(
    useShallow((state) => ({
      options: state.options,
      filters: state.filters,
      setPriceRange: state.setPriceRange,
      setRangeFilter: state.setRangeFilter,
      toggleAttributeFilter: state.toggleAttributeFilter,
      setAttributeSelection: state.setAttributeSelection,
      setSelectedCategory: state.setSelectedCategory,
      setSelectedProductType: state.setSelectedProductType,
      resetFilters: state.resetFilters,
    })),
  )

  const sliderDisabled = options.priceRange[1] <= options.priceRange[0]
  const categoryValue = filters.categoryId ? String(filters.categoryId) : "all"
  const productTypeValue = filters.productTypeId ? String(filters.productTypeId) : "all"

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categoryId) count++
    if (filters.productTypeId) count++
    Object.values(filters.attributeSelections).forEach(selections => {
      count += selections.length
    })
    const isPriceFiltered = filters.priceRange[0] !== options.priceRange[0] || 
                           filters.priceRange[1] !== options.priceRange[1]
    if (isPriceFiltered) count++
    // Đếm range filters (nhap_tay number)
    Object.entries(filters.rangeFilters).forEach(([code, range]) => {
      const bounds = options.rangeFilterBounds[code]
      if (bounds && (range.min !== bounds.min || range.max !== bounds.max)) {
        count++
      }
    })
    return count
  }, [filters, options.priceRange, options.rangeFilterBounds])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : Number(value))
  }

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value === "all" ? null : Number(value))
  }

  const renderDynamicFilter = (attributeFilter: {
    code: string
    name: string
    filter_type: string
    input_type?: string
    options: { id: number; name: string; slug: string }[]
    range?: { min: number; max: number }
  }) => {
    const selectedIds = filters.attributeSelections[attributeFilter.code] || []
    const selectedId = selectedIds.length > 0 ? selectedIds[0] : null

    switch (attributeFilter.filter_type) {
      case 'chon_don':
        return (
          <RadioFilterSection
            title={attributeFilter.name}
            items={attributeFilter.options}
            selectedId={selectedId}
            onSelect={(id) => setAttributeSelection(attributeFilter.code, id)}
            code={attributeFilter.code}
          />
        )

      case 'chon_nhieu':
        return (
          <CollapsibleCheckboxSection
            title={attributeFilter.name}
            items={attributeFilter.options}
            selectedIds={selectedIds}
            onToggle={(id) => toggleAttributeFilter(attributeFilter.code, id)}
            code={attributeFilter.code}
          />
        )

      case 'nhap_tay':
        // Nếu là number và có range → hiển thị Range Slider
        if (attributeFilter.input_type === 'number' && attributeFilter.range) {
          const bounds = options.rangeFilterBounds[attributeFilter.code] || attributeFilter.range
          const currentRange = filters.rangeFilters[attributeFilter.code]
          
          // Xác định unit dựa trên code (ví dụ: nong_do → %)
          const unit = attributeFilter.code === 'nong_do' ? '%' : ''
          const step = attributeFilter.code === 'nong_do' ? 0.5 : 1
          
          return (
            <RangeSliderSection
              title={attributeFilter.name}
              min={bounds.min}
              max={bounds.max}
              currentMin={currentRange?.min ?? bounds.min}
              currentMax={currentRange?.max ?? bounds.max}
              onRangeChange={(min, max, skipFetch) => setRangeFilter(attributeFilter.code, min, max, skipFetch)}
              step={step}
              unit={unit}
            />
          )
        }
        
        // Nếu là text và có options → Radio
        if (attributeFilter.input_type === 'text' && attributeFilter.options.length > 0) {
          return (
            <RadioFilterSection
              title={attributeFilter.name}
              items={attributeFilter.options}
              selectedId={selectedId}
              onSelect={(id) => setAttributeSelection(attributeFilter.code, id)}
              code={attributeFilter.code}
            />
          )
        }
        return null

      default:
        return (
          <CollapsibleCheckboxSection
            title={attributeFilter.name}
            items={attributeFilter.options}
            selectedIds={selectedIds}
            onToggle={(id) => toggleAttributeFilter(attributeFilter.code, id)}
            code={attributeFilter.code}
          />
        )
    }
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

      {/* Product Types - ĐƯA LÊN ĐẦU */}
      {options.productTypes.length > 0 && (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
              Phân loại sp
            </h3>
            <RadioGroup 
              value={productTypeValue} 
              onValueChange={handleProductTypeChange}
              aria-label="Chọn phân loại sản phẩm"
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
            
            {/* Hint khi chưa chọn phân loại */}
            {!filters.productTypeId && (
              <div className="mt-3 text-xs text-[#9B2C3B] bg-[#9B2C3B]/5 px-3 py-2 rounded-md flex items-center gap-2">
                <span>💡</span>
                <span>Chọn phân loại để xem thêm bộ lọc chi tiết</span>
              </div>
            )}
          </div>

          <Separator className="bg-[#ECAA4D]/20" />
        </>
      )}

      {/* Categories - XUỐNG SAU */}
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

      {/* Dynamic Attribute Filters - Render theo filter_type */}
      {/* Animation wrapper cho filters mới xuất hiện khi chọn type */}
      <div className="space-y-6 transition-all duration-300 ease-in-out">
        {options.attributeFilters.map((attributeFilter) => {
          const filterUI = renderDynamicFilter(attributeFilter)
          if (!filterUI) return null
          
          return (
            <div 
              key={attributeFilter.code}
              className="animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {filterUI}
              <Separator className="bg-[#ECAA4D]/20 mt-6" />
            </div>
          )
        })}
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wide">
          Khoảng giá
        </h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => {
              setPriceRange([value[0] ?? options.priceRange[0], value[1] ?? options.priceRange[1]], true)
            }}
            onValueCommit={(value) => {
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
    </div>
  )
}

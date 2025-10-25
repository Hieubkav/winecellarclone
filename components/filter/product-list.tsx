"use client";

import { useEffect, useState } from "react";
import { Search, Grid3X3, List, Heart, Star, ShoppingCart, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWineStore } from "@/app/filter/store";

const categories = [
  { id: "all", label: "Tất cả", icon: "🍷" },
  { id: "red", label: "Vang đỏ", icon: "🍷" },
  { id: "white", label: "Vang trắng", icon: "🥂" },
  { id: "rose", label: "Vang hồng", icon: "🌸" },
  { id: "sparkling", label: "Vang sủi", icon: "🍾" },
  { id: "dessert", label: "Vang tráng miệng", icon: "🍯" },
  { id: "fortified", label: "Vang mạnh", icon: "🥃" },
  { id: "organic", label: "Vang hữu cơ", icon: "🌿" },
  { id: "vintage", label: "Vang cổ điển", icon: "🏺" }
];

const brands = [
  { id: "chateau-margaux", label: "Château Margaux" },
  { id: "romanee-conti", label: "Domaine de la Romanée-Conti" },
  { id: "veuve-clicquot", label: "Veuve Clicquot" },
  { id: "cloudy-bay", label: "Cloudy Bay" },
  { id: "nino-franco", label: "Nino Franco" },
  { id: "s-a-prum", label: "S.A. Prüm" },
  { id: "opus-one", label: "Opus One" },
  { id: "dal-forno-romano", label: "Dal Forno Romano" },
  { id: "william-fevre", label: "William Fèvre" },
  { id: "giacomo-conterno", label: "Giacomo Conterno" },
  { id: "chateau-esclans", label: "Château d'Esclans" }
];

const colors = [
  { id: "red", label: "Red", color: "bg-red-500" },
  { id: "orange", label: "Orange", color: "bg-orange-500" },
  { id: "blue", label: "Blue", color: "bg-blue-500" },
  { id: "black", label: "Black", color: "bg-black" },
  { id: "white", label: "White", color: "bg-white border" },
  { id: "purple", label: "Purple", color: "bg-purple-500" },
  { id: "gray", label: "Gray", color: "bg-gray-600" }
];

// Filter component for reuse in both desktop and mobile
function FilterSection() {
  const {
    priceRange,
    selectedBrands,
    selectedColors,
    deliveryDate,
    selectedCategory, // Added selectedCategory
    setPriceRange,
    toggleBrand,
    toggleColor,
    setDeliveryDate,
    setSelectedCategory // Added setSelectedCategory
  } = useWineStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Danh mục liên quan</h3>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="space-y-2 text-sm">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer text-sm font-normal">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="mb-3 font-semibold">Thương hiệu</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              />
              <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm font-normal">
                {brand.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <h3 className="mb-3 font-semibold">Màu sắc</h3>
        <div className="grid grid-cols-1 gap-2">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color.id}`}
                checked={selectedColors.includes(color.id)}
                onCheckedChange={() => toggleColor(color.id)}
              />
              <div className={`h-4 w-4 rounded ${color.color}`} />
              <Label htmlFor={`color-${color.id}`} className="cursor-pointer text-sm font-normal">
                {color.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Delivery Date */}
      <div>
        <h3 className="mb-3 font-semibold">Thời gian giao hàng</h3>
        <RadioGroup value={deliveryDate} onValueChange={setDeliveryDate}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="delivery-any" />
            <Label htmlFor="delivery-any" className="text-sm font-normal">
              Bất kỳ ngày nào
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="today" id="delivery-today" />
            <Label htmlFor="delivery-today" className="text-sm font-normal">
              Hôm nay
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tomorrow" id="delivery-tomorrow" />
            <Label htmlFor="delivery-tomorrow" className="text-sm font-normal">
              Ngày mai
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="week" id="delivery-week" />
            <Label htmlFor="delivery-week" className="text-sm font-normal">
              Trong 7 ngày
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Giá</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={3000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="price-from" className="text-muted-foreground text-xs">
                Từ
              </Label>
              <Input
                id="price-from"
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])
                }
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="price-to" className="text-muted-foreground text-xs">
                Đến
              </Label>
              <Input
                id="price-to"
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 3000])
                }
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WineList() {
  const {
    filteredWines,
    selectedCategory,
    searchQuery,
    viewMode,
    setSelectedCategory,
    setSearchQuery,
    setViewMode,
    applyFilters
  } = useWineStore();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Apply initial filters on mount
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-64 lg:block">
          <FilterSection />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Controls Bar */}
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            {/* Top row - Mobile filter button and product count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <SheetHeader className="sticky top-0 bg-[#ECAA4D] z-10 py-4 px-6 border-b border-[#ECAA4D] flex items-center justify-between">
                      <SheetTitle className="text-center flex-1">Bộ lọc</SheetTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-auto w-auto text-white hover:bg-[#1C1C1C]/20"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        ✕
                      </Button>
                    </SheetHeader>
                    <div className="py-4 px-6">
                      <FilterSection />
                    </div>
                    <div className="sticky bottom-0 bg-white p-4 border-t border-[#ECAA4D] flex gap-2">
                      <Button 
                        className="flex-1 bg-[#ECAA4D] hover:bg-[#d4952d] text-[#1C1C1C]"
                        onClick={() => {
                          applyFilters();
                          setMobileFiltersOpen(false);
                        }}
                      >
                        Áp dụng
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-[#ECAA4D] text-[#ECAA4D]"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Đóng
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  {filteredWines.length} sản phẩm
                </div>
              </div>

              {/* View Toggle - Desktop only */}
              <div className="hidden sm:block">
                <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Bottom row - Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Tìm kiếm rượu vang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>

              {/* View Toggle - Mobile */}
              <div className="sm:hidden">
                <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
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

          {/* Product Grid */}
          {filteredWines.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Hãy thử điều chỉnh tiêu chí tìm kiếm.
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "xs:grid-cols-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}>
              {filteredWines.map((wine: any) => (
                <Card key={wine.id} className="group transition-shadow hover:shadow-lg">
                  <CardContent className="p-3 sm:p-4">
                    <div className="relative mb-3 sm:mb-4">
                      <img
                        src={wine.image || "/placeholder.svg"}
                        alt={wine.name}
                        className="h-40 w-full rounded-md object-cover sm:h-48"
                      />
                      {wine.originalPrice && wine.discount && (
                        <Badge variant="destructive" className="absolute top-2 right-2 text-xs z-10">
                          -{wine.discount}%
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-sm leading-tight font-medium">
                        {wine.name}
                      </h3>

                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-blue-600 sm:text-lg">
                          {wine.price.toLocaleString('vi-VN')}₫
                        </span>
                        {wine.originalPrice && (
                          <span className="text-muted-foreground text-xs line-through sm:text-sm">
                            {wine.originalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>





                      <Button className="w-full mt-2" size="sm">
                        Xem ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
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
import { useWineStore } from "@/data/filter/store";

const wineTypes = [
  { id: "Vang đỏ", label: "Vang đỏ", icon: "🍷" },
  { id: "Vang trắng", label: "Vang trắng", icon: "🥂" },
  { id: "Vang hồng", label: "Vang hồng", icon: "🌸" },
  { id: "Vang sủi", label: "Vang sủi", icon: "🍾" },
  { id: "Vang tráng miệng", label: "Vang tráng miệng", icon: "🍯" },
  { id: "Vang mạnh", label: "Vang mạnh", icon: "🥃" },
  { id: "Vang hữu cơ", label: "Vang hữu cơ", icon: "🌿" },
  { id: "Vang cổ điển", label: "Vang cổ điển", icon: "🏺" }
];

const categories = [
  { id: "all", label: "Tất cả", icon: "🍷" },
  { id: "Vang đỏ", label: "Vang đỏ", icon: "🍷" },
  { id: "Vang trắng", label: "Vang trắng", icon: "🥂" },
  { id: "Vang hồng", label: "Vang hồng", icon: "🌸" },
  { id: "Vang sủi", label: "Vang sủi", icon: "🍾" },
  { id: "Vang tráng miệng", label: "Vang tráng miệng", icon: "🍯" },
  { id: "Vang mạnh", label: "Vang mạnh", icon: "🥃" },
  { id: "Vang hữu cơ", label: "Vang hữu cơ", icon: "🌿" },
  { id: "Vang cổ điển", label: "Vang cổ điển", icon: "🏺" }
];

const countries = [
  { id: "Pháp", label: "Pháp" },
  { id: "Ý", label: "Ý" },
  { id: "Đức", label: "Đức" },
  { id: "Tây Ban Nha", label: "Tây Ban Nha" },
  { id: "Mỹ", label: "Mỹ" },
  { id: "Úc", label: "Úc" },
  { id: "New Zealand", label: "New Zealand" }
];

const grapeVarieties = [
  { id: "Cabernet Sauvignon", label: "Cabernet Sauvignon" },
  { id: "Chardonnay", label: "Chardonnay" },
  { id: "Pinot Noir", label: "Pinot Noir" },
  { id: "Sauvignon Blanc", label: "Sauvignon Blanc" },
  { id: "Merlot", label: "Merlot" },
  { id: "Nebbiolo", label: "Nebbiolo" },
  { id: "Tempranillo", label: "Tempranillo" },
  { id: "Grenache", label: "Grenache" },
  { id: "Syrah/Shiraz", label: "Syrah/Shiraz" },
  { id: "Riesling", label: "Riesling" },
  { id: "Glera", label: "Glera" },
  { id: "Cinsault", label: "Cinsault" },
  { id: "Rolle", label: "Rolle" },
  { id: "Garnacha", label: "Garnacha" },
  { id: "Corvina", label: "Corvina" },
  { id: "Rondinella", label: "Rondinella" },
  { id: "Molinara", label: "Molinara" },
  { id: "Tinto Fino (Tempranillo)", label: "Tinto Fino (Tempranillo)" }
];

const regions = [
  { id: "Bordeaux", label: "Bordeaux" },
  { id: "Burgundy", label: "Burgundy" },
  { id: "Provence", label: "Provence" },
  { id: "Veneto", label: "Veneto" },
  { id: "Piedmont", label: "Piedmont" },
  { id: "Mosel", label: "Mosel" },
  { id: "Rioja", label: "Rioja" },
  { id: "Marlborough", label: "Marlborough" },
  { id: "Valpolicella", label: "Valpolicella" },
  { id: "Champagne", label: "Champagne" },
  { id: "Napa Valley", label: "Napa Valley" },
  { id: "South Australia", label: "South Australia" },
  { id: "Ribera del Duero", label: "Ribera del Duero" }
];

const brands = [
  { id: "Château Margaux", label: "Château Margaux" },
  { id: "Domaine de la Romanée-Conti", label: "Domaine de la Romanée-Conti" },
  { id: "Veuve Clicquot", label: "Veuve Clicquot" },
  { id: "Cloudy Bay", label: "Cloudy Bay" },
  { id: "Nino Franco", label: "Nino Franco" },
  { id: "S.A. Prüm", label: "S.A. Prüm" },
  { id: "Opus One", label: "Opus One" },
  { id: "Dal Forno Romano", label: "Dal Forno Romano" },
  { id: "William Fèvre", label: "William Fèvre" },
  { id: "Giacomo Conterno", label: "Giacomo Conterno" },
  { id: "Château d'Esclans", label: "Château d'Esclans" },
  { id: "Penfolds", label: "Penfolds" },
  { id: "Vega Sicilia", label: "Vega Sicilia" }
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
    selectedWineTypes,
    selectedCountries,
    selectedGrapeVarieties,
    selectedRegions,
    selectedBrands,
    selectedCategory, // Added selectedCategory
    setPriceRange,
    toggleWineType,
    toggleCountry,
    toggleGrapeVariety,
    toggleRegion,
    toggleBrand,
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

      {/* Countries */}
      <div>
        <h3 className="mb-3 font-semibold">Quốc gia</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {countries.map((country) => (
            <div key={country.id} className="flex items-center space-x-2">
              <Checkbox
                id={`country-${country.id}`}
                checked={selectedCountries.includes(country.id)}
                onCheckedChange={() => toggleCountry(country.id)}
              />
              <Label htmlFor={`country-${country.id}`} className="cursor-pointer text-sm font-normal">
                {country.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Grape Varieties */}
      <div>
        <h3 className="mb-3 font-semibold">Giống nho</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {grapeVarieties.map((grape) => (
            <div key={grape.id} className="flex items-center space-x-2">
              <Checkbox
                id={`grape-${grape.id}`}
                checked={selectedGrapeVarieties.includes(grape.id)}
                onCheckedChange={() => toggleGrapeVariety(grape.id)}
              />
              <Label htmlFor={`grape-${grape.id}`} className="cursor-pointer text-sm font-normal">
                {grape.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Regions */}
      <div>
        <h3 className="mb-3 font-semibold">Vùng nổi tiếng</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region.id}`}
                checked={selectedRegions.includes(region.id)}
                onCheckedChange={() => toggleRegion(region.id)}
              />
              <Label htmlFor={`region-${region.id}`} className="cursor-pointer text-sm font-normal">
                {region.label}
              </Label>
            </div>
          ))}
        </div>
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

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Giá</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000}
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
                  setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 5000])
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
    sortBy,
    setSelectedCategory,
    setSearchQuery,
    setViewMode,
    setSortBy,
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

              {/* Sort and View Toggle - Desktop only */}
              <div className="flex items-center gap-2">
                {/* Sort Options */}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
                
                {/* View Toggle */}
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
            </div>

            {/* Bottom row - Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Tìm kiếm rượu vang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
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
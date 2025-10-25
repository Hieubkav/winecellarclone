import { create } from "zustand";

export interface Wine {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  orders: number;
  producer: string;
  image: string;
  isNew: boolean;
  wineType: string; // instead of 'category'
  brand: string;
  colors: string[];
  deliveryDays: number;
  vintage: number;
  grapeVariety: string; // instead of 'grape'
  region: string;
  country: string; // separate country field
  alcoholContent: number;
  volume: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface WineStore {
  // State
  wines: Wine[];
  filteredWines: Wine[];
  selectedCategory: string;
  searchQuery: string;
  priceRange: [number, number];
  selectedWineTypes: string[]; // loại rượu
  selectedCountries: string[]; // quốc gia
  selectedGrapeVarieties: string[]; // giống nho
  selectedRegions: string[]; // vùng nổi tiếng
  selectedBrands: string[]; // thương hiệu
  selectedColors: string[];
  deliveryDate: string;
  viewMode: string;
  sortBy: SortOption; // Thêm trạng thái sắp xếp

  // Actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleWineType: (type: string) => void; // instead of toggleType
  toggleCountry: (country: string) => void;
  toggleGrapeVariety: (grape: string) => void; // instead of toggleGrape
  toggleRegion: (region: string) => void;
  toggleBrand: (brand: string) => void;
  toggleColor: (color: string) => void;
  setDeliveryDate: (date: string) => void;
  setViewMode: (mode: string) => void;
  setSortBy: (sortBy: SortOption) => void; // Thêm hành động sắp xếp
  applyFilters: () => void;
}

// Sample wines data with comprehensive filtering properties
const sampleWines: Wine[] = [
  {
    id: 1,
    name: "Rượu vang đỏ Château Margaux Grand Vin 2018",
    price: 2499.0,
    originalPrice: 2999.0,
    discount: 17,
    rating: 4.9,
    orders: 124,
    producer: "Château Margaux",
    image: "https://placehold.co/600x400?text=Vang+Đỏ",
    isNew: true,
    wineType: "Vang đỏ",
    brand: "Château Margaux",
    colors: ["red"],
    deliveryDays: 2,
    vintage: 2018,
    grapeVariety: "Cabernet Sauvignon, Merlot",
    region: "Bordeaux",
    country: "Pháp",
    alcoholContent: 13.5,
    volume: 750
  },
  {
    id: 2,
    name: "Rượu vang trắng Chablis Premier Cru 2020",
    price: 1299.0,
    originalPrice: 1599.0,
    discount: 19,
    rating: 4.7,
    orders: 98,
    producer: "Domaine William Fèvre",
    image: "https://placehold.co/600x400?text=Vang+Trắng",
    isNew: true,
    wineType: "Vang trắng",
    brand: "William Fèvre",
    colors: ["yellow"],
    deliveryDays: 3,
    vintage: 2020,
    grapeVariety: "Chardonnay",
    region: "Burgundy",
    country: "Pháp",
    alcoholContent: 12.8,
    volume: 750
  },
  {
    id: 3,
    name: "Rượu vang hồng Côtes de Provence Rosé 2021",
    price: 699.0,
    originalPrice: 899.0,
    discount: 22,
    rating: 4.5,
    orders: 254,
    producer: "Château d'Esclans",
    image: "https://placehold.co/600x400?text=Vang+Hồng",
    isNew: false,
    wineType: "Vang hồng",
    brand: "Château d'Esclans",
    colors: ["pink"],
    deliveryDays: 2,
    vintage: 2021,
    grapeVariety: "Grenache, Cinsault, Rolle",
    region: "Provence",
    country: "Pháp",
    alcoholContent: 13.0,
    volume: 750
  },
  {
    id: 4,
    name: "Rượu vang sủi bong bóng Prosecco Valdobbiadene DOCG",
    price: 749.0,
    originalPrice: 999.0,
    discount: 25,
    rating: 4.8,
    orders: 416,
    producer: "Nino Franco",
    image: "https://placehold.co/600x400?text=Vang+Sủi",
    isNew: true,
    wineType: "Vang sủi",
    brand: "Nino Franco",
    colors: ["yellow"],
    deliveryDays: 1,
    vintage: 2021,
    grapeVariety: "Glera",
    region: "Veneto",
    country: "Ý",
    alcoholContent: 11.0,
    volume: 750
  },
  {
    id: 5,
    name: "Rượu vang đỏ Barolo DOCG 2017",
    price: 1899.0,
    rating: 4.9,
    orders: 154,
    producer: "Giacomo Conterno",
    image: "https://placehold.co/600x400?text=Barolo",
    isNew: false,
    wineType: "Vang đỏ",
    brand: "Giacomo Conterno",
    colors: ["red"],
    deliveryDays: 4,
    vintage: 2017,
    grapeVariety: "Nebbiolo",
    region: "Piedmont",
    country: "Ý",
    alcoholContent: 14.5,
    volume: 750
  },
  {
    id: 6,
    name: "Rượu vang trắng Riesling S.A. Prüm 2019",
    price: 1599.0,
    originalPrice: 1999.0,
    discount: 20,
    rating: 4.8,
    orders: 87,
    producer: "S.A. Prüm",
    image: "https://placehold.co/600x400?text=Riesling",
    isNew: true,
    wineType: "Vang trắng",
    brand: "S.A. Prüm",
    colors: ["yellow"],
    deliveryDays: 5,
    vintage: 2019,
    grapeVariety: "Riesling",
    region: "Mosel",
    country: "Đức",
    alcoholContent: 12.5,
    volume: 750
  },
  {
    id: 7,
    name: "Rượu vang đỏ Pinot Noir Domaine de la Romanée-Conti 2018",
    price: 4999.0,
    originalPrice: 5999.0,
    discount: 17,
    rating: 5.0,
    orders: 34,
    producer: "Domaine de la Romanée-Conti",
    image: "https://placehold.co/600x400?text=Romanee",
    isNew: true,
    wineType: "Vang đỏ",
    brand: "Domaine de la Romanée-Conti",
    colors: ["red"],
    deliveryDays: 7,
    vintage: 2018,
    grapeVariety: "Pinot Noir",
    region: "Burgundy",
    country: "Pháp",
    alcoholContent: 13.0,
    volume: 750
  },
  {
    id: 8,
    name: "Rượu vang đỏ Rioja Reserva Vina Ardanza 2016",
    price: 1199.0,
    rating: 4.6,
    orders: 234,
    producer: "Lopez de Heredia",
    image: "https://placehold.co/600x400?text=Rioja",
    isNew: false,
    wineType: "Vang đỏ",
    brand: "Vina Ardanza",
    colors: ["red"],
    deliveryDays: 3,
    vintage: 2016,
    grapeVariety: "Tempranillo, Garnacha",
    region: "Rioja",
    country: "Tây Ban Nha",
    alcoholContent: 13.5,
    volume: 750
  },
  {
    id: 9,
    name: "Rượu vang trắng Sauvignon Blanc Cloudy Bay 2020",
    price: 1499.0,
    originalPrice: 1799.0,
    discount: 17,
    rating: 4.7,
    orders: 112,
    producer: "Cloudy Bay",
    image: "https://placehold.co/600x400?text=Cloudy+Bay",
    isNew: true,
    wineType: "Vang trắng",
    brand: "Cloudy Bay",
    colors: ["yellow"],
    deliveryDays: 2,
    vintage: 2020,
    grapeVariety: "Sauvignon Blanc",
    region: "Marlborough",
    country: "New Zealand",
    alcoholContent: 13.0,
    volume: 750
  },
  {
    id: 10,
    name: "Rượu vang đỏ Amarone della Valpolicella 2017",
    price: 2199.0,
    originalPrice: 2599.0,
    discount: 15,
    rating: 4.8,
    orders: 78,
    producer: "Dal Forno Romano",
    image: "https://placehold.co/600x400?text=Amarone",
    isNew: true,
    wineType: "Vang đỏ",
    brand: "Dal Forno Romano",
    colors: ["red"],
    deliveryDays: 6,
    vintage: 2017,
    grapeVariety: "Corvina, Rondinella, Molinara",
    region: "Valpolicella",
    country: "Ý",
    alcoholContent: 15.5,
    volume: 750
  },
  {
    id: 11,
    name: "Rượu vang sủi bong bóng Champagne Veuve Clicquot",
    price: 2299.0,
    originalPrice: 2699.0,
    discount: 15,
    rating: 4.9,
    orders: 367,
    producer: "Veuve Clicquot",
    image: "https://placehold.co/600x400?text=Champagne",
    isNew: false,
    wineType: "Vang sủi",
    brand: "Veuve Clicquot",
    colors: ["yellow"],
    deliveryDays: 1,
    vintage: 2016,
    grapeVariety: "Chardonnay, Pinot Noir, Pinot Meunier",
    region: "Champagne",
    country: "Pháp",
    alcoholContent: 12.0,
    volume: 750
  },
  {
    id: 12,
    name: "Rượu vang đỏ Napa Valley Cabernet Sauvignon 2019",
    price: 1799.0,
    originalPrice: 1999.0,
    discount: 10,
    rating: 4.7,
    orders: 194,
    producer: "Opus One",
    image: "https://placehold.co/600x400?text=Opus+One",
    isNew: true,
    wineType: "Vang đỏ",
    brand: "Opus One",
    colors: ["red"],
    deliveryDays: 4,
    vintage: 2019,
    grapeVariety: "Cabernet Sauvignon",
    region: "Napa Valley",
    country: "Mỹ",
    alcoholContent: 14.5,
    volume: 750
  },
  {
    id: 13,
    name: "Rượu vang đỏ Penfolds Grange 2018",
    price: 3299.0,
    originalPrice: 3999.0,
    discount: 18,
    rating: 4.9,
    orders: 89,
    producer: "Penfolds",
    image: "https://placehold.co/600x400?text=Penfolds",
    isNew: true,
    wineType: "Vang đỏ",
    brand: "Penfolds",
    colors: ["red"],
    deliveryDays: 5,
    vintage: 2018,
    grapeVariety: "Shiraz",
    region: "South Australia",
    country: "Úc",
    alcoholContent: 14.0,
    volume: 750
  },
  {
    id: 14,
    name: "Rượu vang trắng Cloudy Bay Sauvignon Blanc 2021",
    price: 1199.0,
    originalPrice: 1499.0,
    discount: 20,
    rating: 4.6,
    orders: 145,
    producer: "Cloudy Bay",
    image: "https://placehold.co/600x400?text=CB+SB",
    isNew: true,
    wineType: "Vang trắng",
    brand: "Cloudy Bay",
    colors: ["yellow"],
    deliveryDays: 2,
    vintage: 2021,
    grapeVariety: "Sauvignon Blanc",
    region: "Marlborough",
    country: "New Zealand",
    alcoholContent: 12.5,
    volume: 750
  },
  {
    id: 15,
    name: "Rượu vang đỏ Vega Sicilia Único 2016",
    price: 2799.0,
    originalPrice: 3299.0,
    discount: 15,
    rating: 4.8,
    orders: 65,
    producer: "Vega Sicilia",
    image: "https://placehold.co/600x400?text=Vega",
    isNew: false,
    wineType: "Vang đỏ",
    brand: "Vega Sicilia",
    colors: ["red"],
    deliveryDays: 6,
    vintage: 2016,
    grapeVariety: "Tinto Fino (Tempranillo)",
    region: "Ribera del Duero",
    country: "Tây Ban Nha",
    alcoholContent: 14.0,
    volume: 750
  }
];

export const useWineStore = create<WineStore>((set, get) => ({
  // Initial state
  wines: sampleWines,
  filteredWines: sampleWines,
  selectedCategory: "all",
  searchQuery: "",
  priceRange: [0, 5000],
  selectedWineTypes: [], // loại rượu
  selectedCountries: [], // quốc gia
  selectedGrapeVarieties: [], // giống nho
  selectedRegions: [], // vùng nổi tiếng
  selectedBrands: [], // thương hiệu
  selectedColors: [],
  deliveryDate: "any",
  viewMode: "grid",
  sortBy: 'name-asc', // Mặc định sắp xếp theo tên A-Z

  // Actions
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setPriceRange: (range) => {
    set({ priceRange: range });
    get().applyFilters();
  },

  toggleWineType: (type) => {
    const { selectedWineTypes } = get();
    const newWineTypes = selectedWineTypes.includes(type)
      ? selectedWineTypes.filter((t) => t !== type)
      : [...selectedWineTypes, type];
    set({ selectedWineTypes: newWineTypes });
    get().applyFilters();
  },

  toggleCountry: (country) => {
    const { selectedCountries } = get();
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter((c) => c !== country)
      : [...selectedCountries, country];
    set({ selectedCountries: newCountries });
    get().applyFilters();
  },

  toggleGrapeVariety: (grape) => {
    const { selectedGrapeVarieties } = get();
    const newGrapeVarieties = selectedGrapeVarieties.includes(grape)
      ? selectedGrapeVarieties.filter((g) => g !== grape)
      : [...selectedGrapeVarieties, grape];
    set({ selectedGrapeVarieties: newGrapeVarieties });
    get().applyFilters();
  },

  toggleRegion: (region) => {
    const { selectedRegions } = get();
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    set({ selectedRegions: newRegions });
    get().applyFilters();
  },

  toggleBrand: (brand) => {
    const { selectedBrands } = get();
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    set({ selectedBrands: newBrands });
    get().applyFilters();
  },

  toggleColor: (color) => {
    const { selectedColors } = get();
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    set({ selectedColors: newColors });
    get().applyFilters();
  },

  setDeliveryDate: (date) => {
    set({ deliveryDate: date });
    get().applyFilters();
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    // Gọi lại applyFilters để áp dụng sắp xếp
    get().applyFilters();
  },

  applyFilters: () => {
    const {
      wines,
      selectedCategory,
      searchQuery,
      priceRange,
      selectedWineTypes,
      selectedCountries,
      selectedGrapeVarieties,
      selectedRegions,
      selectedBrands,
      selectedColors,
      deliveryDate,
      sortBy
    } = get();

    let filtered = wines;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((wine) => wine.wineType === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wine) =>
          wine.name.toLowerCase().includes(query) ||
          wine.brand.toLowerCase().includes(query) ||
          wine.producer.toLowerCase().includes(query)
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (wine) => wine.price >= priceRange[0] && wine.price <= priceRange[1]
    );

    // Wine Type filter (loại rượu)
    if (selectedWineTypes.length > 0) {
      filtered = filtered.filter((wine) => selectedWineTypes.includes(wine.wineType));
    }

    // Country filter (quốc gia)
    if (selectedCountries.length > 0) {
      filtered = filtered.filter((wine) => selectedCountries.includes(wine.country));
    }

    // Grape Variety filter (giống nho)
    if (selectedGrapeVarieties.length > 0) {
      filtered = filtered.filter((wine) => {
        // Check if any grape in selectedGrapeVarieties is included in wine.grapeVariety
        return selectedGrapeVarieties.some(grape => 
          wine.grapeVariety.toLowerCase().includes(grape.toLowerCase())
        );
      });
    }

    // Region filter (vùng nổi tiếng)
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((wine) => {
        // Check if the wine's region is in the selected regions
        return selectedRegions.some(region => 
          wine.region.toLowerCase().includes(region.toLowerCase())
        );
      });
    }

    // Brand filter (thương hiệu)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((wine) => selectedBrands.includes(wine.brand));
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((wine) =>
        wine.colors.some((color) => selectedColors.includes(color))
      );
    }

    // Delivery date filter
    if (deliveryDate !== "any") {
      const maxDays =
        deliveryDate === "today"
          ? 0
          : deliveryDate === "tomorrow"
            ? 1
            : deliveryDate === "week"
              ? 7
              : 999;
      filtered = filtered.filter((wine) => wine.deliveryDays <= maxDays);
    }

    // Sort the filtered wines
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    set({ filteredWines: filtered });
  }
}));
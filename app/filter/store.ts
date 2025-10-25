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
  category: string;
  brand: string;
  colors: string[];
  deliveryDays: number;
  vintage: number;
  grape: string;
  region: string;
  alcoholContent: number;
  volume: number;
}

interface WineStore {
  // State
  wines: Wine[];
  filteredWines: Wine[];
  selectedCategory: string;
  searchQuery: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedColors: string[];
  deliveryDate: string;
  viewMode: string;

  // Actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleBrand: (brand: string) => void;
  toggleColor: (color: string) => void;
  setDeliveryDate: (date: string) => void;
  setViewMode: (mode: string) => void;
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
    category: "red",
    brand: "chateau-margaux",
    colors: ["red"],
    deliveryDays: 2,
    vintage: 2018,
    grape: "Cabernet Sauvignon, Merlot",
    region: "Bordeaux, Pháp",
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
    category: "white",
    brand: "william-fevre",
    colors: ["yellow"],
    deliveryDays: 3,
    vintage: 2020,
    grape: "Chardonnay",
    region: "Burgundy, Pháp",
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
    category: "rose",
    brand: "chateau-esclans",
    colors: ["pink"],
    deliveryDays: 2,
    vintage: 2021,
    grape: "Grenache, Cinsault, Rolle",
    region: "Provence, Pháp",
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
    category: "sparkling",
    brand: "nino-franco",
    colors: ["yellow"],
    deliveryDays: 1,
    vintage: 2021,
    grape: "Glera",
    region: "Veneto, Ý",
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
    category: "red",
    brand: "giacomo-conterno",
    colors: ["red"],
    deliveryDays: 4,
    vintage: 2017,
    grape: "Nebbiolo",
    region: "Piedmont, Ý",
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
    category: "white",
    brand: "s-a-prum",
    colors: ["yellow"],
    deliveryDays: 5,
    vintage: 2019,
    grape: "Riesling",
    region: "Mosel, Đức",
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
    category: "red",
    brand: "romanee-conti",
    colors: ["red"],
    deliveryDays: 7,
    vintage: 2018,
    grape: "Pinot Noir",
    region: "Burgundy, Pháp",
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
    category: "red",
    brand: "vinas-ardanza",
    colors: ["red"],
    deliveryDays: 3,
    vintage: 2016,
    grape: "Tempranillo, Garnacha",
    region: "Rioja, Tây Ban Nha",
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
    category: "white",
    brand: "cloudy-bay",
    colors: ["yellow"],
    deliveryDays: 2,
    vintage: 2020,
    grape: "Sauvignon Blanc",
    region: "Marlborough, New Zealand",
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
    category: "red",
    brand: "dal-forno-romano",
    colors: ["red"],
    deliveryDays: 6,
    vintage: 2017,
    grape: "Corvina, Rondinella, Molinara",
    region: "Veneto, Ý",
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
    category: "sparkling",
    brand: "veuve-clicquot",
    colors: ["yellow"],
    deliveryDays: 1,
    vintage: 2016,
    grape: "Chardonnay, Pinot Noir, Pinot Meunier",
    region: "Champagne, Pháp",
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
    category: "red",
    brand: "opus-one",
    colors: ["red"],
    deliveryDays: 4,
    vintage: 2019,
    grape: "Cabernet Sauvignon",
    region: "Napa Valley, Mỹ",
    alcoholContent: 14.5,
    volume: 750
  }
];

export const useWineStore = create<WineStore>((set, get) => ({
  // Initial state
  wines: sampleWines,
  filteredWines: sampleWines,
  selectedCategory: "all",
  searchQuery: "",
  priceRange: [0, 3000],
  selectedBrands: [],
  selectedColors: [],
  deliveryDate: "any",
  viewMode: "grid",

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

  applyFilters: () => {
    const {
      wines,
      selectedCategory,
      searchQuery,
      priceRange,
      selectedBrands,
      selectedColors,
      deliveryDate
    } = get();

    let filtered = wines;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((wine) => wine.category === selectedCategory);
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

    // Brand filter
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

    set({ filteredWines: filtered });
  }
}));
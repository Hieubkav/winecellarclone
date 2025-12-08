export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  type: string;
  volume: number; // ml
  alcohol: number; // %
  price: number;
  originalPrice?: number; // Giá gốc để tính chiết khấu
  origin?: string;
  age?: number; // Tuổi rượu
  brand?: string; // Thương hiệu
  material?: string; // Chất liệu (cho phụ kiện)
  flavor?: string; // Hương vị đặc trưng
}

export interface FilterState {
  search: string;
  types: string[];
  categories: string[];
  origins: string[];
  priceRange: [number, number];
  sort: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

export type ViewMode = 'grid' | 'list';
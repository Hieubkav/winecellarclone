import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ballantines Finest',
    image: 'https://picsum.photos/400/400?random=1',
    category: 'Rượu vang & sâm panh',
    type: 'Rượu mạnh',
    volume: 777,
    alcohol: 13,
    price: 333000,
    originalPrice: 450000,
    origin: 'Scotland',
    brand: 'Ballantines',
    flavor: 'Socola, táo đỏ & vani'
  },
  {
    id: '2',
    name: 'Phụ kiện mở rượu DGA',
    image: 'https://picsum.photos/400/400?random=2',
    category: 'Phụ kiện',
    type: 'Phụ kiện',
    volume: 0,
    alcohol: 0,
    price: 213000,
    originalPrice: 213000,
    material: 'Thép không gỉ',
    brand: 'DGA Accessories'
  },
  {
    id: '3',
    name: 'Rượu vang bịch ABC',
    image: 'https://picsum.photos/400/400?random=3',
    category: 'Rượu vang & sâm panh',
    type: 'Vang bịch',
    volume: 3000,
    alcohol: 12.5,
    price: 3000, 
    originalPrice: 5000,
    origin: 'Pháp',
    brand: 'Bordeaux',
    flavor: 'Quả mọng chín, chát nhẹ'
  },
  {
    id: '4',
    name: 'Macallan 12 Years Old',
    image: 'https://picsum.photos/400/400?random=4',
    category: 'Rượu mạnh',
    type: 'Single Malt',
    volume: 700,
    alcohol: 40,
    price: 4210000,
    originalPrice: 4500000,
    age: 12,
    origin: 'Scotland',
    brand: 'Macallan',
    flavor: 'Gỗ sồi, khói & trái cây khô'
  },
  {
    id: '5',
    name: 'Chateau Dalat Reserve',
    image: 'https://picsum.photos/400/400?random=5',
    category: 'Rượu vang & sâm panh',
    type: 'Vang đỏ',
    volume: 750,
    alcohol: 12,
    price: 444000,
    origin: 'Việt Nam',
    brand: 'Ladofoods',
    flavor: 'Dâu tây & mận đen'
  },
  {
    id: '6',
    name: 'Don Vino Reserva Tempranillo',
    image: 'https://picsum.photos/400/400?random=6',
    category: 'Rượu vang & sâm panh',
    type: 'Vang đỏ',
    volume: 750,
    alcohol: 14,
    price: 299000,
    originalPrice: 350000,
    origin: 'Tây Ban Nha',
    brand: 'Don Vino',
    flavor: 'Hương thảo mộc & gỗ tuyết tùng'
  },
  {
    id: '7',
    name: 'Sake Junmai Ginjo',
    image: 'https://picsum.photos/400/400?random=7',
    category: 'Rượu sake/soju/umeshu',
    type: 'Sake Junmai',
    volume: 213,
    alcohol: 11,
    price: 341000,
    origin: 'Nhật Bản',
    brand: 'Hakutsuru',
    flavor: 'Thanh mát, hương gạo mới'
  },
  {
    id: '8',
    name: 'Brewdog Punk IPA',
    image: 'https://picsum.photos/400/400?random=8',
    category: 'Rượu vang & sâm panh',
    type: 'Bia thủ công',
    volume: 100,
    alcohol: 2,
    price: 10000,
    originalPrice: 15000,
    origin: 'Mỹ',
    brand: 'Brewdog',
    flavor: 'Đậm đà hoa bia, cam chanh'
  },
  {
    id: '9',
    name: 'Vang bịch Chile',
    image: 'https://picsum.photos/400/400?random=9',
    category: 'Rượu vang & sâm panh',
    type: 'Vang bịch',
    volume: 222,
    alcohol: 2,
    price: 3000,
    origin: 'Chile',
    brand: 'Concha y Toro',
    flavor: 'Nho đen & tiêu xanh'
  },
];

export const FILTERS = {
  types: [
    'Tất cả',
    'Rượu vang & sâm panh',
    'Rượu mạnh',
    'Rượu sake/soju/umeshu',
    'Phụ kiện'
  ],
  categories: [
    'Tất cả',
    'Vang đỏ',
    'Vang trắng',
    'Vang sủi',
    'Vang hồng',
    'Whisky',
    'Single Malt',
    'Blended',
    'Bourbon',
    'Sake Junmai',
    'Soju',
    'Vang Nổ - Sparkling',
    'Vang Bịch'
  ],
  origins: [
    'Tất cả',
    'Pháp',
    'Ý',
    'Tây Ban Nha',
    'Úc',
    'Scotland',
    'Nhật Bản',
    'Chile'
  ]
};
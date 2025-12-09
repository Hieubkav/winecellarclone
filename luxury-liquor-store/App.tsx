import React from 'react';
import { ProductDetail } from './components/ProductDetail';
import { RelatedProducts } from './components/RelatedProducts';
import { Product, RelatedProduct } from './types';

const mockProduct: Product = {
  id: 'ballantines-finest',
  name: "Ballantine's Finest Blended Scotch Whisky",
  subtitle: "", // Removed as requested
  price: 333000,
  originalPrice: 380000,
  description: `
    <p class="mb-4">Ballantine's Finest là loại rượu whisky pha trộn (blended scotch whisky) lâu đời và nổi tiếng của Scotland. Với màu vàng hổ phách rực rỡ và hương vị phong phú, tinh tế của sô-cô-la, táo đỏ và vani.</p>
    <p class="mb-4">Đây là sự lựa chọn tuyệt vời cho những buổi tiệc sang trọng hoặc làm quà biếu. Hương vị cân bằng hoàn hảo, không quá gắt, phù hợp với khẩu vị của người hiện đại.</p>
    <div class="my-6">
      <img src="https://picsum.photos/id/40/800/400" alt="Ballantine's Lifestyle" class="w-full rounded-lg shadow-md" />
      <p class="text-center text-xs text-gray-500 mt-2">Thiết kế chai cổ điển đặc trưng</p>
    </div>
    <h4 class="font-bold text-slate-900 mb-2">Đặc điểm nổi bật:</h4>
    <ul class="list-disc pl-5 mb-4 space-y-1">
      <li>Màu sắc: Vàng hổ phách.</li>
      <li>Mùi hương: Nhẹ nhàng, thanh lịch với hương hoa, cây thạch nam, mật ong và thoang thoảng gia vị.</li>
      <li>Vị: Cân bằng, phảng phất vị sô-cô-la sữa, táo đỏ và vani.</li>
      <li>Dư vị: Lắng đọng, tinh tế mang đến cảm giác sảng khoái.</li>
    </ul>
    <p>Thưởng thức Ballantine's Finest ngon nhất khi dùng trực tiếp (neat), ướp lạnh hoặc pha chế thành các loại cocktail sành điệu.</p>
  `,
  images: [
    "https://picsum.photos/id/40/800/800",
    "https://picsum.photos/id/42/800/800",
    "https://picsum.photos/id/60/800/800"
  ],
  specs: [
    { label: "Xuất xứ", value: "Scotland", iconName: "Globe" },
    { label: "Nồng độ", value: "40%", iconName: "Droplets" },
    { label: "Dung tích", value: "750ml", iconName: "FlaskConical" },
    { label: "Thương hiệu", value: "Ballantine's", iconName: "Award" },
  ],
  tags: ["Whisky", "Scotland", "Blended"],
  rating: 4.8,
  reviews: 124
};

const relatedItems: RelatedProduct[] = [
  { 
    id: '1', 
    name: 'Chivas Regal 12 Years Old', 
    price: 650000, 
    discount: 10, 
    image: 'https://picsum.photos/id/102/400/500', 
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '700ml' }
    ]
  },
  { 
    id: '2', 
    name: 'Johnnie Walker Black Label', 
    price: 590000, 
    image: 'https://picsum.photos/id/103/400/500', 
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '750ml' }
    ]
  },
  { 
    id: '3', 
    name: 'Rượu Vang Đỏ Tây Ban Nha Nho Đen', 
    price: 299000, 
    discount: 5, 
    image: 'https://picsum.photos/id/104/400/500', 
    specs: [
      { icon: 'Globe', text: 'Tây Ban Nha' },
      { icon: 'Grape', text: 'Cabernet' },
      { icon: 'Droplets', text: '13.5%' }
    ]
  },
  { 
    id: '4', 
    name: 'Macallan Double Cask 12YO', 
    price: 1850000, 
    image: 'https://picsum.photos/id/106/400/500',
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '700ml' }
    ]
  },
];

const sameCategoryItems: RelatedProduct[] = [
  { 
    id: '5', 
    name: 'Ballantine\'s 17 Years Old', 
    price: 1200000, 
    image: 'https://picsum.photos/id/110/400/500',
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '750ml' }
    ]
  },
  { 
    id: '6', 
    name: 'Ballantine\'s 21 Years Old', 
    price: 2100000, 
    discount: 15, 
    image: 'https://picsum.photos/id/111/400/500',
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '700ml' }
    ]
  },
  { 
    id: '7', 
    name: 'Glenfiddich 12 Year Old', 
    price: 950000, 
    image: 'https://picsum.photos/id/112/400/500',
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '700ml' }
    ]
  },
  { 
    id: '8', 
    name: 'Singleton of Glen Ord 12', 
    price: 890000, 
    image: 'https://picsum.photos/id/113/400/500',
    specs: [
      { icon: 'Globe', text: 'Scotland' },
      { icon: 'Droplets', text: '40% Vol' },
      { icon: 'FlaskConical', text: '700ml' }
    ]
  },
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <main className="flex-grow container mx-auto px-4">
        <ProductDetail product={mockProduct} />
        
        <RelatedProducts title="Cùng loại Rượu vang & Sâm panh" products={sameCategoryItems} />
        <RelatedProducts title="Sản phẩm liên quan" products={relatedItems} />
      </main>
    </div>
  );
};

export default App;
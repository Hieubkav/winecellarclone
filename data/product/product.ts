// Interface định nghĩa cấu trúc dữ liệu sản phẩm rượu
export interface WineProduct {
  id: string;
  category: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: string;
  originalPrice: string;
  unitsSold: number;
  images: {
    main: string;
    thumbnails: string[];
  };
  details: {
    grape: string;
    region: string;
    vintage: string;
    alcoholContent: string;
    producer: string;
    wineType: string;
    country: string;
  };
  description: string;
  badgeText: string;
}

// Dữ liệu sản phẩm rượu vang Louis Latour Ardeche Chardonnay
export const wineProductData: WineProduct = {
  id: "wine-002",
  category: "Vang Trắng",
  name: "Rượu Vang Louis Latour Ardeche Chardonnay",
  rating: 4.8,
  reviewCount: 96,
  price: "1,650,000₫",
  originalPrice: "1,950,000₫",
  unitsSold: 96,
  images: {
    main: "https://tse3.mm.bing.net/th/id/OIP.2VNUenKAzNqeSrUlTC4i-wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
    thumbnails: [
      "https://tse3.mm.bing.net/th/id/OIP.2VNUenKAzNqeSrUlTC4i-wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://bizweb.dktcdn.net/thumb/1024x1024/100/441/574/products/ardeche-chardonnay-louis-latour.jpg?v=1672740619780",
      "https://ruouchat.net/wp-content/uploads/2024/05/louis-latour-ardeche-chardonnay-4.jpg",
      "https://khoruou.com/wp-content/uploads/2023/04/ruou-vang-phap-louis-latour-ardeche-chardonnay.jpg"
    ]
  },
  details: {
    grape: "Chardonnay",
    region: "Ardeche",
    vintage: "2022",
    alcoholContent: "13%",
    producer: "Louis Latour",
    wineType: "Vang trắng",
    country: "Pháp"
  },
  description: "Rượu vang Louis Latour Ardeche Chardonnay 2022 mang đến hương vị tinh tế của giống nho Chardonnay hảo hạng. Vang có màu vàng rơm sáng bóng, hương thơm phức hợp của trái cây nhiệt đới, hoa trắng và một chút vanilla. Vị vang cân bằng, mềm mại với độ chua vừa phải và hậu vị kéo dài, mang lại cảm giác sảng khoái.",
  badgeText: "Mới"
};
import { Metadata } from "next";
import ProductList from "@/components/filter/product-list";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Tìm kiếm rượu vang - Thiên Kim Wine",
  description: "Tìm kiếm và lọc rượu vang theo loại, xuất xứ, giá cả. Hơn 1000+ sản phẩm rượu vang chính hãng, giá tốt nhất.",
  keywords: "tìm kiếm rượu vang, lọc rượu vang, mua rượu vang, rượu vang giá tốt",
  alternates: {
    canonical: `${SITE_URL}/filter`,
  },
  openGraph: {
    title: "Tìm kiếm rượu vang - Thiên Kim Wine",
    description: "Tìm kiếm và lọc rượu vang theo loại, xuất xứ, giá cả. Hơn 1000+ sản phẩm chính hãng.",
    type: "website",
    url: `${SITE_URL}/filter`,
    images: [
      {
        url: `${SITE_URL}/media/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Thiên Kim Wine - Tìm kiếm",
      }
    ],
  },
};

export default function Page() {
  return <ProductList />;
}
import { Metadata } from "next";
import { fetchProductFilters, fetchProductList } from "@/lib/api/products";
import ProductList from "@/components/filter/product-list";
import { CollectionPageSchema, ItemListSchema } from "@/lib/seo/structured-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Tìm kiếm rượu vang - Thiên Kim Wine",
  description: "Tìm kiếm và lọc rượu vang theo loại, xuất xứ, giá cả. Hơn 1000+ sản phẩm rượu vang chính hãng, giá tốt nhất.",
  keywords: "tìm kiếm rượu vang, lọc rượu vang, mua rượu vang, rượu vang giá tốt, wine, rượu ngoại, rượu nhập khẩu",
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

export default async function Page() {
  const [filterOptions, initialProducts] = await Promise.all([
    fetchProductFilters().catch(() => null),
    fetchProductList({ 
      page: 1, 
      per_page: 24,
      sort: 'name',
    }).catch(() => null),
  ]);

  const itemListProducts = initialProducts?.data?.map((product) => ({
    name: product.name,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    image: product.main_image_url || undefined,
    price: product.price || undefined,
  })) || [];

  return (
    <>
      <CollectionPageSchema
        name="Bộ sưu tập rượu vang - Thiên Kim Wine"
        description="Khám phá hơn 1000+ loại rượu vang cao cấp từ các vùng rượu nổi tiếng thế giới"
        url={`${SITE_URL}/filter`}
        numberOfItems={initialProducts?.meta?.total || 0}
      />
      {itemListProducts.length > 0 && (
        <ItemListSchema
          name="Danh sách rượu vang"
          description="Các sản phẩm rượu vang chính hãng tại Thiên Kim Wine"
          items={itemListProducts}
          url={`${SITE_URL}/filter`}
        />
      )}
      <ProductList 
        initialFilterOptions={filterOptions} 
        initialProducts={initialProducts}
      />
    </>
  );
}
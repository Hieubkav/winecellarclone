export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailPage from "@/components/products/productDetailPage";
import { fetchProductDetail } from "@/lib/api/products";
import { ProductSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";

type ProductDetailRouteParams = {
  slug: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductDetailRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetail(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Sản phẩm này không tồn tại hoặc đã bị xóa.",
    };
  }

  const title = product.meta?.title || `${product.name} - Thiên Kim Wine`;
  const description = product.meta?.description || product.description?.substring(0, 160) || `Mua ${product.name} chính hãng tại Thiên Kim Wine. Giá tốt, giao hàng nhanh.`;
  const url = `${SITE_URL}/san-pham/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Thiên Kim Wine",
      locale: "vi_VN",
      type: "website",
      images: product.cover_image_url ? [
        {
          url: product.cover_image_url,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.cover_image_url ? [product.cover_image_url] : [],
    },
    other: {
      "product:price:amount": product.price?.toString() || "",
      "product:price:currency": "VND",
      "product:availability": "in stock",
    },
  };
}

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<ProductDetailRouteParams>;
}) {
  const { slug } = await params;
  const product = await fetchProductDetail(slug);

  if (!product) {
    notFound();
  }

  const productUrl = `${SITE_URL}/san-pham/${product.slug}`;
  
  return (
    <>
      {/* SEO: Product Structured Data */}
      <ProductSchema
        name={product.name}
        description={product.description || undefined}
        image={product.cover_image_url || undefined}
        brand={product.brand_term?.name || undefined}
        price={product.price || undefined}
        availability='in stock'
        url={productUrl}
      />
      
      {/* SEO: Breadcrumb */}
      <BreadcrumbSchema
        items={[
          { name: 'Trang chủ', url: SITE_URL },
          { name: 'Sản phẩm', url: `${SITE_URL}/san-pham` },
          { name: product.name, url: productUrl },
        ]}
      />

      <ProductDetailPage product={product} />
    </>
  );
}

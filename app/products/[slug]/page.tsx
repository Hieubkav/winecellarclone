import { notFound } from "next/navigation";

import ProductDetailPage from "@/components/products/productDetailPage";
import { fetchProductDetail } from "@/lib/api/products";

interface ProductDetailRouteProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const product = await fetchProductDetail(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}

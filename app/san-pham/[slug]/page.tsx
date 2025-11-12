export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { notFound } from "next/navigation";

import ProductDetailPage from "@/components/products/productDetailPage";
import { fetchProductDetail } from "@/lib/api/products";

type ProductDetailRouteParams = {
  slug: string;
};

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

  return <ProductDetailPage product={product} />;
}

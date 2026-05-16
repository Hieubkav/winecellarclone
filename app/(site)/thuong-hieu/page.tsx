import type { Metadata } from "next";
import { buildFilterMetadata, renderFilterListing } from "../filter/shared";
import { resolveProductLandingContext } from "@/lib/seo/ia-products";

export async function generateMetadata(): Promise<Metadata> {
  const landingContext = await resolveProductLandingContext(["thuong-hieu"]);

  return buildFilterMetadata({
    searchParams: {},
    canonicalPath: "/thuong-hieu",
    routeTypeName: landingContext?.title ?? "Thương hiệu",
  });
}

export default async function BrandsPage() {
  const landingContext = await resolveProductLandingContext(["thuong-hieu"]);

  return renderFilterListing({
    canonicalPath: "/thuong-hieu",
    routeAttributeGroupSlug: landingContext?.routeFilters.attributeGroupSlug ?? "thuong-hieu",
    routeAttributeSelections: landingContext?.routeFilters.attributeSelections,
    initialProductParams: landingContext?.apiParams,
    pageTitle: landingContext?.title ?? "Thương hiệu",
    collectionName: "Thương hiệu - Thiên Kim Wine",
    collectionDescription: "Khám phá sản phẩm theo thương hiệu tại Thiên Kim Wine.",
    itemListName: "Danh sách sản phẩm theo thương hiệu",
    itemListDescription: "Các sản phẩm chính hãng được lọc theo thương hiệu.",
  });
}

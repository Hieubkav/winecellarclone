import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildFilterMetadata, renderFilterListing } from "../../filter/shared";
import { resolveProductLandingContext } from "@/lib/seo/ia-products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const landingContext = await resolveProductLandingContext(["thuong-hieu", slug]);

  if (!landingContext) {
    return {};
  }

  return buildFilterMetadata({
    searchParams: {},
    canonicalPath: `/thuong-hieu/${slug}`,
    routeTypeName: landingContext.title,
  });
}

export default async function BrandChildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landingContext = await resolveProductLandingContext(["thuong-hieu", slug]);

  if (!landingContext) {
    notFound();
  }

  return renderFilterListing({
    canonicalPath: `/thuong-hieu/${slug}`,
    routeAttributeGroupSlug: landingContext.routeFilters.attributeGroupSlug,
    routeAttributeSelections: landingContext.routeFilters.attributeSelections,
    initialProductParams: landingContext.apiParams,
    pageTitle: landingContext.title,
    collectionName: `${landingContext.title} - Thiên Kim Wine`,
    collectionDescription: landingContext.description,
    itemListName: `Danh sách ${landingContext.title}`,
    itemListDescription: landingContext.description,
  });
}

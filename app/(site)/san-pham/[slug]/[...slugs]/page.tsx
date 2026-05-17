import { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildFilterMetadata, renderFilterListing } from "../../../filter/shared";
import { resolveProductLandingContext } from "@/lib/seo/ia-products";

type ProductLandingRouteParams = {
  slug: string;
  slugs: string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductLandingRouteParams>;
}): Promise<Metadata> {
  const { slug, slugs } = await params;
  const landingContext = await resolveProductLandingContext([slug, ...slugs]);

  if (!landingContext) {
    return {};
  }

  return buildFilterMetadata({
    searchParams: {},
    canonicalPath: landingContext.canonicalPath,
    routeTypeSlug: landingContext.routeFilters.typeSlug,
    routeTypeName: landingContext.title,
  });
}

export default async function ProductLandingRoute({
  params,
}: {
  params: Promise<ProductLandingRouteParams>;
}) {
  const { slug, slugs } = await params;
  const landingContext = await resolveProductLandingContext([slug, ...slugs]);

  if (!landingContext) {
    notFound();
  }

  return renderFilterListing({
    canonicalPath: landingContext.canonicalPath,
    routeTypeSlug: landingContext.routeFilters.typeSlug,
    routeTypeName: landingContext.title,
    routeCategorySlug: landingContext.routeFilters.categorySlug,
    routeAttributeGroupSlug: landingContext.routeFilters.attributeGroupSlug,
    routeAttributeSelections: landingContext.routeFilters.attributeSelections,
    routePriceRange: landingContext.routeFilters.priceRange,
    initialProductParams: landingContext.apiParams,
    pageTitle: landingContext.title,
    pageSubtitle: landingContext.subtitle,
    collectionName: `${landingContext.title} - Thiên Kim Wine`,
    collectionDescription: landingContext.description,
    itemListName: `Danh sách ${landingContext.title}`,
    itemListDescription: landingContext.description,
  });
}

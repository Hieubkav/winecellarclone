import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildFilterMetadata,
  renderFilterListing,
  resolveTypeContext,
  type FilterRouteSearchParams,
} from "../filter/shared";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ typeSlug: string }>;
  searchParams: Promise<FilterRouteSearchParams>;
}): Promise<Metadata> {
  const [{ typeSlug }, resolvedSearchParams, typeContext] = await Promise.all([
    params,
    searchParams,
    params.then(({ typeSlug }) => resolveTypeContext(typeSlug)),
  ]);

  if (!typeContext.matchedType) {
    return {};
  }

  return buildFilterMetadata({
    searchParams: resolvedSearchParams,
    canonicalPath: `/${typeSlug}`,
    routeTypeSlug: typeContext.matchedType.slug,
    routeTypeName: typeContext.matchedType.name,
  });
}

export default async function ProductTypeLandingPage({
  params,
}: {
  params: Promise<{ typeSlug: string }>;
}) {
  const { typeSlug } = await params;
  const { matchedType } = await resolveTypeContext(typeSlug);

  if (!matchedType) {
    notFound();
  }

  return renderFilterListing({
    canonicalPath: `/${matchedType.slug}`,
    routeTypeSlug: matchedType.slug,
    routeTypeName: matchedType.name,
    pageTitle: matchedType.name,
    collectionName: `${matchedType.name} - Thiên Kim Wine`,
    collectionDescription: `Khám phá danh mục ${matchedType.name.toLowerCase()} chính hãng tại Thiên Kim Wine`,
    itemListName: `Danh sách ${matchedType.name}`,
    itemListDescription: `Các sản phẩm ${matchedType.name.toLowerCase()} chính hãng tại Thiên Kim Wine`,
  });
}

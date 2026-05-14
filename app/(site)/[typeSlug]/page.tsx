import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  buildFilterMetadata,
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
    canonicalPath: `/san-pham/${typeSlug}`,
    routeTypeSlug: typeContext.matchedType.slug,
    routeTypeName: typeContext.matchedType.name,
  });
}

export default async function ProductTypeLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ typeSlug: string }>;
  searchParams: Promise<FilterRouteSearchParams>;
}) {
  const [{ typeSlug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { matchedType } = await resolveTypeContext(typeSlug);

  if (!matchedType) {
    notFound();
  }

  const query = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  });

  redirect(`/san-pham/${matchedType.slug}${query.toString() ? `?${query}` : ""}`);
}

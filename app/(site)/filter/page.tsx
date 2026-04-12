import { Metadata } from "next";
import { buildFilterMetadata, renderFilterListing, type FilterRouteSearchParams } from "./shared";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<FilterRouteSearchParams>;
}): Promise<Metadata> {
  return buildFilterMetadata({
    searchParams: await searchParams,
    canonicalPath: "/filter",
  });
}

export default async function Page() {
  return renderFilterListing({
    canonicalPath: "/filter",
    pageTitle: "Sản phẩm của chúng tôi",
  });
}

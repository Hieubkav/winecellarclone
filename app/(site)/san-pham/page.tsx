import { Metadata } from "next";
import { buildFilterMetadata, renderFilterListing, type FilterRouteSearchParams } from "../filter/shared";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<FilterRouteSearchParams>;
}): Promise<Metadata> {
  return buildFilterMetadata({
    searchParams: await searchParams,
    canonicalPath: "/san-pham",
  });
}

export default async function ProductsPage() {
  return renderFilterListing({
    canonicalPath: "/san-pham",
    pageTitle: "Sản phẩm",
    collectionName: "Sản phẩm rượu vang, rượu mạnh và phụ kiện - Thiên Kim Wine",
    collectionDescription: "Khám phá danh mục sản phẩm chính hãng tại Thiên Kim Wine theo loại rượu, thương hiệu, xuất xứ và mức giá.",
    itemListName: "Danh sách sản phẩm Thiên Kim Wine",
    itemListDescription: "Các sản phẩm rượu vang, rượu mạnh và phụ kiện chính hãng tại Thiên Kim Wine.",
  });
}

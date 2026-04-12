import { Metadata } from "next";
import { CollectionPageSchema, ItemListSchema, WebPageSchema } from "@/lib/seo/structured-data";
import { fetchSettingsSafe, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { fetchProductFiltersSafe, fetchProductListSafe, type ProductFiltersPayload } from "@/lib/api/products";
import ProductList from "@/components/filter/product-list";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export type FilterRouteSearchParams = {
  type?: string;
  category?: string;
  q?: string;
  price_min?: string;
  price_max?: string;
};

export type ProductTypeOption = {
  id: number;
  name: string;
  slug: string;
};

export type ListingMode = "generic" | "type-landing";

export type ListingSeoContext = {
  canonicalPath: string;
  routeTypeSlug?: string | null;
  routeTypeName?: string | null;
  pageTitle?: string;
  collectionName?: string;
  collectionDescription?: string;
  itemListName?: string;
  itemListDescription?: string;
};

const formatPrice = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed.toLocaleString("vi-VN");
};

export const resolveFilterLabel = (slug: string | null, options: { name: string; slug: string }[]) => {
  if (!slug) return null;
  return options.find((option) => option.slug === slug)?.name || slug;
};

export const buildAbsoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const resolveTypeContext = async (routeTypeSlug?: string | null): Promise<{
  filterOptions: ProductFiltersPayload | null;
  matchedType: ProductTypeOption | null;
}> => {
  const filterOptions = await fetchProductFiltersSafe();
  const matchedType = routeTypeSlug && filterOptions
    ? filterOptions.types.find((type) => type.slug === routeTypeSlug) ?? null
    : null;

  return {
    filterOptions,
    matchedType,
  };
};

export async function buildFilterMetadata({
  searchParams,
  canonicalPath,
  routeTypeSlug,
  routeTypeName,
}: {
  searchParams: FilterRouteSearchParams;
  canonicalPath: string;
  routeTypeSlug?: string | null;
  routeTypeName?: string | null;
}): Promise<Metadata> {
  const [settings, filterOptions] = await Promise.all([
    fetchSettingsSafe(),
    fetchProductFiltersSafe(),
  ]);

  const typeSlug = routeTypeSlug || (typeof searchParams.type === "string" ? searchParams.type : null);
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : null;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : null;
  const priceMin = typeof searchParams.price_min === "string" ? searchParams.price_min : null;
  const priceMax = typeof searchParams.price_max === "string" ? searchParams.price_max : null;

  const typeName = routeTypeName || (filterOptions ? resolveFilterLabel(typeSlug, filterOptions.types) : typeSlug);
  const categoryName = filterOptions ? resolveFilterLabel(categorySlug, filterOptions.categories) : categorySlug;

  const baseIntent = query
    ? `Mua ${query}`
    : typeName
      ? `Mua ${typeName}`
      : categoryName
        ? `Mua ${categoryName}`
        : "Mua rượu vang";

  const priceRangeLabel = priceMin || priceMax
    ? `giá ${formatPrice(priceMin) || ""}${priceMin && priceMax ? " - " : ""}${formatPrice(priceMax) || ""}`.trim()
    : null;

  const titleParts = [baseIntent, priceRangeLabel, settings.site_name].filter(Boolean);
  const title = titleParts.join(" | ");
  const descriptionSuffix = settings.site_tagline?.trim() ? ` ${settings.site_tagline.trim()}` : "";
  const description = `${baseIntent} chính hãng tại ${settings.site_name}${priceRangeLabel ? `, ${priceRangeLabel}` : ""}. Lọc theo loại, xuất xứ, thương hiệu và mức giá.${descriptionSuffix}`;

  const keywordsBase = typeof settings.meta_defaults.keywords === "string"
    ? settings.meta_defaults.keywords.split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  const keywords = Array.from(
    new Set([
      ...keywordsBase,
      query,
      typeName,
      categoryName,
      "mua rượu vang",
      "shop rượu vang",
    ].filter(Boolean) as string[])
  );

  const canonical = buildAbsoluteUrl(canonicalPath);
  const ogImageUrl = settings.og_image_url || settings.logo_url || FALLBACK_SETTINGS.logo_url;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: settings.site_name,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export async function renderFilterListing({
  canonicalPath,
  routeTypeSlug,
  routeTypeName,
  pageTitle,
  collectionName,
  collectionDescription,
  itemListName,
  itemListDescription,
}: ListingSeoContext) {
  const listingMode: ListingMode = routeTypeSlug ? "type-landing" : "generic";
  const productTypeContext = routeTypeSlug
    ? await fetchProductFiltersSafe(undefined, { bypassCache: true })
    : null;
  const matchedType = routeTypeSlug && productTypeContext
    ? productTypeContext.types.find((type) => type.slug === routeTypeSlug) ?? null
    : null;
  const effectiveType = matchedType ?? (routeTypeSlug && routeTypeName ? { id: 0, slug: routeTypeSlug, name: routeTypeName } : null);

  const [filterOptions, initialProducts, settings] = await Promise.all([
    effectiveType?.id && effectiveType.id > 0
      ? fetchProductFiltersSafe(effectiveType.id, { bypassCache: true })
      : fetchProductFiltersSafe(),
    fetchProductListSafe({
      page: 1,
      per_page: 16,
      sort: "name",
      ...(effectiveType?.id && effectiveType.id > 0 ? { "type[]": [effectiveType.id] } : {}),
    }),
    fetchSettingsSafe(),
  ]);

  const productListFontStyle = getScopedFontStyle(settings, "product_list");
  const pageUrl = buildAbsoluteUrl(canonicalPath);
  const defaultCollectionName = effectiveType?.name
    ? `${effectiveType.name} - Thiên Kim Wine`
    : "Bộ sưu tập rượu vang - Thiên Kim Wine";
  const defaultCollectionDescription = effectiveType?.name
    ? `Khám phá danh mục ${effectiveType.name.toLowerCase()} chính hãng tại Thiên Kim Wine`
    : "Khám phá hơn 1000+ loại rượu vang cao cấp từ các vùng rượu nổi tiếng thế giới";
  const defaultItemListName = effectiveType?.name
    ? `Danh sách ${effectiveType.name}`
    : "Danh sách rượu vang";
  const defaultItemListDescription = effectiveType?.name
    ? `Các sản phẩm ${effectiveType.name.toLowerCase()} chính hãng tại Thiên Kim Wine`
    : "Các sản phẩm rượu vang chính hãng tại Thiên Kim Wine";
  const resolvedPageTitle = pageTitle || effectiveType?.name || "Sản phẩm của chúng tôi";

  const itemListProducts = initialProducts?.data?.map((product) => ({
    name: product.name,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    image: product.main_image_url || undefined,
    price: product.price || undefined,
  })) || [];

  return (
    <>
      <CollectionPageSchema
        name={collectionName || defaultCollectionName}
        description={collectionDescription || defaultCollectionDescription}
        url={pageUrl}
        numberOfItems={initialProducts?.meta?.total || 0}
      />
      <WebPageSchema
        name={resolvedPageTitle}
        url={pageUrl}
        description={collectionDescription || defaultCollectionDescription}
      />
      {itemListProducts.length > 0 && (
        <ItemListSchema
          name={itemListName || defaultItemListName}
          description={itemListDescription || defaultItemListDescription}
          items={itemListProducts}
          url={pageUrl}
        />
      )}
      <ProductList
        initialFilterOptions={filterOptions}
        initialProducts={initialProducts}
        fontFamily={productListFontStyle.fontFamily}
        initialTypeSlug={routeTypeSlug ?? null}
        listingMode={listingMode}
      />
    </>
  );
}

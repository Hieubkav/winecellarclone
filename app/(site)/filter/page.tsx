import { Metadata } from "next";
import { fetchProductFilters, fetchProductList } from "@/lib/api/products";
import ProductList from "@/components/filter/product-list";
import { CollectionPageSchema, ItemListSchema, WebPageSchema } from "@/lib/seo/structured-data";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const formatPrice = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed.toLocaleString("vi-VN");
};

const buildCanonicalParams = (params: Record<string, string | null>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${SITE_URL}/filter?${query}` : `${SITE_URL}/filter`;
};

const resolveFilterLabel = (slug: string | null, options: { name: string; slug: string }[]) => {
  if (!slug) return null;
  return options.find((option) => option.slug === slug)?.name || slug;
};

type FilterRouteSearchParams = {
  type?: string;
  category?: string;
  q?: string;
  price_min?: string;
  price_max?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<FilterRouteSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  let settings = FALLBACK_SETTINGS;
  let filterOptions = null;

  try {
    const [settingsResult, filtersResult] = await Promise.all([
      fetchSettings().catch(() => null),
      fetchProductFilters().catch(() => null),
    ]);
    settings = settingsResult ?? FALLBACK_SETTINGS;
    filterOptions = filtersResult;
  } catch (error) {
    console.error("Failed to load settings for filter metadata:", error);
  }

  const typeSlug = typeof params.type === "string" ? params.type : null;
  const categorySlug = typeof params.category === "string" ? params.category : null;
  const query = typeof params.q === "string" ? params.q.trim() : null;
  const priceMin = typeof params.price_min === "string" ? params.price_min : null;
  const priceMax = typeof params.price_max === "string" ? params.price_max : null;

  const typeName = filterOptions ? resolveFilterLabel(typeSlug, filterOptions.types) : typeSlug;
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

  const canonical = buildCanonicalParams({
    type: typeSlug,
    category: categorySlug,
    q: query,
    price_min: priceMin,
    price_max: priceMax,
  });

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

export default async function Page() {
  const [filterOptions, initialProducts, settingsResult] = await Promise.all([
    fetchProductFilters().catch(() => null),
    fetchProductList({
      page: 1,
      per_page: 24,
      sort: 'name',
    }).catch(() => null),
    fetchSettings().catch(() => null),
  ]);

  const settings = settingsResult ?? FALLBACK_SETTINGS;
  const productListFontStyle = getScopedFontStyle(settings, "product_list");

  const itemListProducts = initialProducts?.data?.map((product) => ({
    name: product.name,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    image: product.main_image_url || undefined,
    price: product.price || undefined,
  })) || [];

  return (
    <>
      <CollectionPageSchema
        name="Bộ sưu tập rượu vang - Thiên Kim Wine"
        description="Khám phá hơn 1000+ loại rượu vang cao cấp từ các vùng rượu nổi tiếng thế giới"
        url={`${SITE_URL}/filter`}
        numberOfItems={initialProducts?.meta?.total || 0}
      />
      <WebPageSchema
        name={settings.meta_defaults.title || settings.site_name}
        url={`${SITE_URL}/filter`}
        description={settings.meta_defaults.description}
      />
      {itemListProducts.length > 0 && (
        <ItemListSchema
          name="Danh sách rượu vang"
          description="Các sản phẩm rượu vang chính hãng tại Thiên Kim Wine"
          items={itemListProducts}
          url={`${SITE_URL}/filter`}
        />
      )}
      <ProductList 
        initialFilterOptions={filterOptions} 
        initialProducts={initialProducts}
        fontFamily={productListFontStyle.fontFamily}
      />
    </>
  );
}
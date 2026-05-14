import {
  fetchProductFiltersSafe,
  type AttributeFilter,
  type ProductFilterOption,
  type ProductFiltersPayload,
} from "@/lib/api/products";

export type ProductLandingRouteFilters = {
  typeSlug?: string | null;
  categorySlug?: string | null;
  attributeSelections?: Record<string, string[]>;
  priceRange?: { min: number; max: number } | null;
};

export type ProductLandingContext = {
  canonicalPath: string;
  title: string;
  description: string;
  routeFilters: ProductLandingRouteFilters;
  apiParams: Record<string, string | number | Array<string | number> | undefined>;
  filterOptions: ProductFiltersPayload | null;
};

const PRICE_PRESETS: Record<string, { label: string; min?: number; max?: number }> = {
  "duoi-500k": { label: "Dưới 500k", max: 500_000 },
  "500k-1-trieu": { label: "500k - 1 triệu", min: 500_000, max: 1_000_000 },
  "1-2-trieu": { label: "1 - 2 triệu", min: 1_000_000, max: 2_000_000 },
  "2-5-trieu": { label: "2 - 5 triệu", min: 2_000_000, max: 5_000_000 },
  "duoi-1-trieu": { label: "Dưới 1 triệu", max: 1_000_000 },
  "1-3-trieu": { label: "1 - 3 triệu", min: 1_000_000, max: 3_000_000 },
  "3-5-trieu": { label: "3 - 5 triệu", min: 3_000_000, max: 5_000_000 },
  "tren-5-trieu": { label: "Trên 5 triệu", min: 5_000_000 },
};

const PREFERRED_TERM_GROUPS = [
  "category",
  "occasion",
  "dip",
  "muc_dich",
  "origin",
  "xuat_xu",
  "country",
  "quoc_gia",
  "brand",
  "thuong_hieu",
  "grape",
  "giong_nho",
  "accessory_type",
  "loai_phu_kien",
];

const findBySlug = <T extends { slug: string }>(items: T[], slug: string): T | null =>
  items.find((item) => item.slug === slug) ?? null;

const findTermBySlug = (
  attributeFilters: AttributeFilter[],
  slug: string
): { group: AttributeFilter; term: ProductFilterOption } | null => {
  const sortedFilters = [...attributeFilters].sort((a, b) => {
    const aIndex = PREFERRED_TERM_GROUPS.indexOf(a.code);
    const bIndex = PREFERRED_TERM_GROUPS.indexOf(b.code);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  for (const group of sortedFilters) {
    const term = findBySlug(group.options, slug);
    if (term) {
      return { group, term };
    }
  }

  return null;
};

const appendParamValue = (
  params: ProductLandingContext["apiParams"],
  key: string,
  value: number
) => {
  const current = params[key];
  if (Array.isArray(current)) {
    params[key] = [...current, value];
    return;
  }

  params[key] = [value];
};

export const buildProductLandingPath = (typeSlug?: string | null, childSlug?: string | null) => {
  if (!typeSlug) {
    return "/san-pham";
  }

  return childSlug ? `/san-pham/${typeSlug}/${childSlug}` : `/san-pham/${typeSlug}`;
};

export async function resolveProductLandingContext(
  slugs: string[]
): Promise<ProductLandingContext | null> {
  const cleanSlugs = slugs.map((slug) => slug.trim()).filter(Boolean);
  const allFilters = await fetchProductFiltersSafe(undefined, { bypassCache: true });

  if (!allFilters) {
    return null;
  }

  const [typeSlug, ...restSlugs] = cleanSlugs;
  const matchedType = typeSlug ? findBySlug(allFilters.types, typeSlug) : null;

  if (typeSlug && !matchedType) {
    return null;
  }

  const scopedFilters = matchedType
    ? await fetchProductFiltersSafe(matchedType.id, { bypassCache: true })
    : allFilters;
  const filters = scopedFilters ?? allFilters;
  const routeFilters: ProductLandingRouteFilters = {
    typeSlug: matchedType?.slug ?? null,
    attributeSelections: {},
    priceRange: null,
  };
  const apiParams: ProductLandingContext["apiParams"] = {};
  const titleParts: string[] = [];

  if (matchedType) {
    apiParams["type[]"] = [matchedType.id];
    titleParts.push(matchedType.name);
  }

  for (const slug of restSlugs) {
    const category = findBySlug(filters.categories, slug);
    if (category) {
      routeFilters.categorySlug = category.slug;
      apiParams["category[]"] = [category.id];
      titleParts.push(category.name);
      continue;
    }

    const pricePreset = PRICE_PRESETS[slug];
    if (pricePreset) {
      if (typeof pricePreset.min === "number") {
        apiParams.price_min = pricePreset.min;
      }
      if (typeof pricePreset.max === "number") {
        apiParams.price_max = pricePreset.max;
      }
      routeFilters.priceRange = {
        min: pricePreset.min ?? filters.price.min ?? 0,
        max: pricePreset.max ?? filters.price.max ?? 10_000_000,
      };
      titleParts.push(pricePreset.label);
      continue;
    }

    const termMatch = findTermBySlug(filters.attribute_filters, slug);
    if (termMatch) {
      const { group, term } = termMatch;
      appendParamValue(apiParams, `terms[${group.code}][]`, term.id);
      routeFilters.attributeSelections = {
        ...(routeFilters.attributeSelections ?? {}),
        [group.code]: [...(routeFilters.attributeSelections?.[group.code] ?? []), term.slug],
      };
      titleParts.push(term.name);
      continue;
    }

    return null;
  }

  const resolvedTitle = titleParts.length > 0 ? titleParts.join(" - ") : "Sản phẩm";
  const canonicalPath = cleanSlugs.length > 0 ? `/san-pham/${cleanSlugs.join("/")}` : "/san-pham";

  return {
    canonicalPath,
    title: resolvedTitle,
    description: `Khám phá ${resolvedTitle.toLowerCase()} chính hãng tại Thiên Kim Wine. Dễ lọc theo nhu cầu, giá và phong cách thưởng thức.`,
    routeFilters,
    apiParams,
    filterOptions: filters,
  };
}

import {
  fetchProductFiltersSafe,
  type AttributeFilter,
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

const findBySlug = <T extends { slug: string }>(items: T[], slug: string): T | null =>
  items.find((item) => item.slug === slug) ?? null;

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

const applyPresetPayload = (
  params: ProductLandingContext["apiParams"],
  payload: Record<string, unknown>
) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === "terms" && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value as Record<string, unknown>).forEach(([groupCode, rawIds]) => {
        const ids = Array.isArray(rawIds) ? rawIds : [rawIds];
        params[`terms[${groupCode}][]`] = ids.filter((id): id is number | string => typeof id === "number" || typeof id === "string");
      });
      return;
    }
    params[key] = Array.isArray(value)
      ? value.filter((item): item is number | string => typeof item === "number" || typeof item === "string")
      : typeof value === "number" || typeof value === "string"
        ? value
        : undefined;
  });
};

const resolvePresetPriceRange = (
  payload: Record<string, unknown>,
  fallbackPrice?: { min: number; max: number }
) => {
  const min = typeof payload.price_min === "number" ? payload.price_min : null;
  const max = typeof payload.price_max === "number" ? payload.price_max : null;

  if (min === null && max === null) {
    return null;
  }

  const fallbackMin = fallbackPrice?.min ?? 0;
  const fallbackMax = fallbackPrice?.max ?? 0;
  const safeMin = Math.max(fallbackMin, min ?? fallbackMin);
  const safeMax = Math.min(fallbackMax, max ?? fallbackMax);

  return safeMin > safeMax
    ? { min: safeMin, max: safeMin }
    : { min: safeMin, max: safeMax };
};

const findFilterPresetBySlug = (
  filters: ProductFiltersPayload,
  presetSlug?: string | null
) => {
  if (!presetSlug) {
    return null;
  }

  for (const group of filters.filter_groups ?? []) {
    if (group.route_prefix !== "san-pham") {
      continue;
    }

    const preset = group.presets.find((item) => item.slug === presetSlug);
    if (preset) {
      return { group, preset };
    }
  }

  return null;
};

const applyAttributeRouteSegments = (
  attributeFilters: AttributeFilter[],
  slugs: string[],
  apiParams: ProductLandingContext["apiParams"],
  routeFilters: ProductLandingRouteFilters
): string[] | null => {
  if (slugs.length === 0) {
    return [];
  }

  if (slugs.length % 2 !== 0) {
    return null;
  }

  const titleParts: string[] = [];
  const attributeSelections: Record<string, string[]> = {
    ...routeFilters.attributeSelections,
  };

  for (let index = 0; index < slugs.length; index += 2) {
    const groupSlug = slugs[index];
    const termSegment = slugs[index + 1];
    const group = attributeFilters.find((item) => item.slug === groupSlug);

    if (!group || !termSegment) {
      return null;
    }

    const termSlugs = termSegment.split(",").map((slug) => slug.trim()).filter(Boolean);
    if (termSlugs.length === 0) {
      return null;
    }

    const matchedTerms = termSlugs.map((slug) => findBySlug(group.options, slug));
    if (matchedTerms.some((term) => !term)) {
      return null;
    }

    matchedTerms.forEach((term) => {
      if (!term) return;
      appendParamValue(apiParams, `terms[${group.code}][]`, term.id);
    });

    attributeSelections[group.code] = matchedTerms
      .filter((term): term is NonNullable<typeof term> => Boolean(term))
      .map((term) => term.slug);
    titleParts.push(...matchedTerms.filter((term): term is NonNullable<typeof term> => Boolean(term)).map((term) => term.name));
  }

  routeFilters.attributeSelections = attributeSelections;
  return titleParts;
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
  const matchedAttributeGroup = typeSlug
    ? allFilters.attribute_filters.find((group) => group.slug === typeSlug)
    : null;
  if (typeSlug && !matchedType && !matchedAttributeGroup) {
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

  if (matchedAttributeGroup) {
    if (restSlugs.length === 0) {
      const resolvedTitle = matchedAttributeGroup.name;
      return {
        canonicalPath: `/san-pham/${matchedAttributeGroup.slug}`,
        title: resolvedTitle,
        description: `Khám phá sản phẩm theo ${resolvedTitle.toLowerCase()} tại Thiên Kim Wine.`,
        routeFilters,
        apiParams,
        filterOptions: allFilters,
      };
    }
    if (restSlugs.length !== 1) return null;
    const attributeTitleParts = applyAttributeRouteSegments(
      [matchedAttributeGroup],
      [matchedAttributeGroup.slug, restSlugs[0]],
      apiParams,
      routeFilters
    );
    if (!attributeTitleParts) return null;
    titleParts.push(matchedAttributeGroup.name, ...attributeTitleParts);
    const resolvedTitle = titleParts.join(" - ");
    return {
      canonicalPath: `/san-pham/${matchedAttributeGroup.slug}/${restSlugs[0]}`,
      title: resolvedTitle,
      description: `Khám phá ${resolvedTitle.toLowerCase()} chính hãng tại Thiên Kim Wine.`,
      routeFilters,
      apiParams,
      filterOptions: allFilters,
    };
  }

  if (matchedType) {
    apiParams["type[]"] = [matchedType.id];
    titleParts.push(matchedType.name);
  }

  const remainingSlugs = [...restSlugs];
  const firstRestSlug = remainingSlugs[0];
  if (firstRestSlug) {
    const category = findBySlug(filters.categories, firstRestSlug);
    if (category) {
      routeFilters.categorySlug = category.slug;
      apiParams["category[]"] = [category.id];
      titleParts.push(category.name);
      remainingSlugs.shift();
    }
  }

  if (matchedType && remainingSlugs.length > 0) {
    const presetMatch = findFilterPresetBySlug(allFilters, remainingSlugs[0]);

    if (presetMatch) {
      const { preset } = presetMatch;
      const presetPayload = preset.filter_payload ?? {};
      applyPresetPayload(apiParams, presetPayload);
      routeFilters.priceRange = resolvePresetPriceRange(presetPayload, allFilters.price);
      titleParts.push(preset.name);
      remainingSlugs.shift();
    }
  }

  const attributeTitleParts = applyAttributeRouteSegments(
    filters.attribute_filters,
    remainingSlugs,
    apiParams,
    routeFilters
  );
  if (!attributeTitleParts) {
    return null;
  }
  titleParts.push(...attributeTitleParts);

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

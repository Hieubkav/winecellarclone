import type { ProductDetail } from "@/lib/api/products";

export interface ProductBreadcrumbItem {
  label: string;
  href: string;
}

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) return null;
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

const toAbsoluteHref = (href: string, baseUrl?: string): string => {
  if (!baseUrl || href.startsWith("http")) {
    return href;
  }

  return `${normalizeBaseUrl(baseUrl)}${href.startsWith("/") ? href : `/${href}`}`;
};

export const buildProductBreadcrumbs = (
  product: ProductDetail,
  options?: { siteUrl?: string }
): ProductBreadcrumbItem[] => {
  const baseUrl = options?.siteUrl;
  const category = product.category ?? null;
  const type = product.type ?? null;

  const categoryLabel = category?.name || type?.name || null;
  const categorySlug = category?.slug || type?.slug || null;
  const typeSlug = type?.slug || null;

  const originGroup = product.attributes?.find((group) => group.group_code === "xuat_xu");
  const originTerm = originGroup?.terms?.find((term) => Boolean(term.slug)) ?? null;

  const items: ProductBreadcrumbItem[] = [
    { label: "Trang chủ", href: toAbsoluteHref("/", baseUrl) },
  ];

  items.push({ label: "Sản phẩm", href: toAbsoluteHref("/san-pham", baseUrl) });

  if (categoryLabel && categorySlug) {
    const categoryHref = typeSlug
      ? `/san-pham/${typeSlug}${category?.slug ? `/${category.slug}` : ""}`
      : `/san-pham`;
    items.push({ label: categoryLabel, href: toAbsoluteHref(categoryHref, baseUrl) });

    if (originTerm?.name && originTerm.slug) {
      const originHref = typeSlug
        ? `/san-pham/${typeSlug}/${originTerm.slug}`
        : `/san-pham?xuat_xu=${originTerm.slug}`;
      items.push({ label: originTerm.name, href: toAbsoluteHref(originHref, baseUrl) });
    }

    items.push({ label: product.name, href: toAbsoluteHref(`/san-pham/${product.slug}`, baseUrl) });
    return items;
  }

  return [
    { label: "Trang chủ", href: toAbsoluteHref("/", baseUrl) },
    { label: "Sản phẩm", href: toAbsoluteHref("/san-pham", baseUrl) },
    { label: product.name, href: toAbsoluteHref(`/san-pham/${product.slug}`, baseUrl) },
  ];
};

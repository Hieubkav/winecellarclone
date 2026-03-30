export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailPage from "@/components/products/productDetailPage";
import { fetchProductDetailSafe } from "@/lib/api/products";
import { ProductSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";
import { buildProductBreadcrumbs } from "@/lib/products/product-breadcrumbs";
import { fetchSettingsSafe, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { getScopedFontStyle } from "@/lib/fonts/resolve-font";

type ProductDetailRouteParams = {
  slug: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductDetailRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    fetchProductDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Sản phẩm này không tồn tại hoặc đã bị xóa.",
    };
  }

  const siteName = settings.site_name || "Thiên Kim Wine";
  const normalizeTitle = (value?: string | null) => value?.trim().toLowerCase() ?? "";
  const metaTitle = product.meta?.title?.trim() || "";
  const isMetaTitleDefault = !metaTitle || normalizeTitle(metaTitle) === normalizeTitle(product.name);
  const title = isMetaTitleDefault
    ? `${product.name} | Giá tốt chính hãng | ${siteName}`
    : metaTitle;
  const description = product.meta?.description
    || product.description?.substring(0, 160)
    || `Mua ${product.name} chính hãng tại ${siteName}. Giá tốt, tư vấn nhanh và giao hàng tận nơi.`;
  const url = `${SITE_URL}/san-pham/${product.slug}`;
  const coverImageSource = product.cover_image_canonical_url || product.cover_image_url;
  const ogImageUrl = coverImageSource
    || settings.og_image_url
    || settings.logo_url
    || FALLBACK_SETTINGS.logo_url;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "vi_VN",
      type: "website",
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: coverImageSource ? 800 : 1200,
          height: coverImageSource ? 800 : 630,
          alt: product.name,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    other: {
      "product:price:amount": product.price?.toString() || "",
      "product:price:currency": "VND",
      "product:availability": "in stock",
    },
  };
}

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<ProductDetailRouteParams>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    fetchProductDetailSafe(slug),
    fetchSettingsSafe(),
  ]);

  if (!product) {
    notFound();
  }
  const productDetailFontStyle = getScopedFontStyle(settings, "product_detail");
  const sellerName = settings.site_name || "Thiên Kim Wine";
  const coverImageSource = product.cover_image_canonical_url || product.cover_image_url;

  const productUrl = `${SITE_URL}/san-pham/${product.slug}`;
  const breadcrumbItems = buildProductBreadcrumbs(product, { siteUrl: SITE_URL });
  
  return (
    <>
      {/* SEO: Product Structured Data */}
      <ProductSchema
        name={product.name}
        description={product.description || undefined}
        image={coverImageSource || undefined}
        brand={product.brand_term?.name || undefined}
        price={product.price || undefined}
        availability='in stock'
        sellerName={sellerName}
        url={productUrl}
      />
      
      {/* SEO: Breadcrumb */}
      <BreadcrumbSchema
        items={breadcrumbItems.map((item) => ({
          name: item.label,
          url: item.href,
        }))}
      />

      <ProductDetailPage
        product={product}
        fontFamily={productDetailFontStyle.fontFamily}
        productContactCtaConfig={settings.product_contact_cta_config}
        shopeeLinkEnabled={Boolean(settings.product_shopee_link_enabled)}
        mobileMainImageHeight={settings.product_mobile_main_image_height}
        productDetailRules={settings.product_detail_rules}
        productDetailFaq={{
          enabled: settings.product_detail_faq_enabled,
          title: settings.product_detail_faq_title,
          eyebrow: settings.product_detail_faq_eyebrow,
          items: settings.product_detail_faq_items,
          position: settings.product_detail_faq_position,
        }}
      />
    </>
  );
}

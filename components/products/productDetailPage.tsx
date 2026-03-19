"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  X,
} from "lucide-react";
import { useTracking } from "@/hooks/use-tracking";
import { ProductImage } from "@/components/ui/product-image";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import DynamicIcon from "@/components/shared/DynamicIcon";

import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/api/products";
import { buildProductBreadcrumbs } from "@/lib/products/product-breadcrumbs";
import { processProductContent, getImageUrl } from "@/lib/utils/article-content";
import { PRODUCT_IMAGE_ASPECT_RATIO } from "@/lib/constants/product-image";
import RelatedProductsSection from "./RelatedProducts";
import type { ProductContactCtaConfig } from "@/lib/types/product-contact-cta";

interface AttributeDisplayItem {
  iconName?: string | null;
  iconUrl?: string | null;
  groupCode?: string;
  label: string;
  value: string;
  filterUrl?: string;
}

interface ProductDetailPageProps {
  product: ProductDetail;
  fontFamily?: string;
  productContactCtaConfig?: ProductContactCtaConfig | null;
  shopeeLinkEnabled?: boolean;
}

interface ProductGalleryItem {
  src: string;
  width?: number | null;
  height?: number | null;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatPrice = (product: ProductDetail): string => {
  if (product.show_contact_cta || !product.price || product.price <= 0) {
    return "Liên hệ";
  }

  return currencyFormatter.format(product.price);
};

const formatOriginalPrice = (product: ProductDetail): string | null => {
  if (
    product.show_contact_cta ||
    !product.original_price ||
    !product.price ||
    product.original_price <= product.price
  ) {
    return null;
  }

  return currencyFormatter.format(product.original_price);
};

const resolvePhoneHref = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("tel:") || trimmed.startsWith("http")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `tel:${digits}` : null;
};

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V12H8v3h2v7h3v-7h2.3l.7-3H13V9.5c0-.3.2-.5.5-.5z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.31-2.84 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 1 0 12 21a6.34 6.34 0 0 0 6.86-6.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

function AttributeIcon({ iconName, iconUrl }: { iconName?: string | null; iconUrl?: string | null }) {
  return (
    <DynamicIcon
      iconUrl={iconUrl}
      iconName={iconName}
      size={16}
      className="w-4 h-4"
      imageClassName="w-4 h-4"
    />
  );
}
export default function ProductDetailPage({
  product,
  fontFamily,
  productContactCtaConfig,
  shopeeLinkEnabled,
}: ProductDetailPageProps) {
  const { trackProductView, trackCTAContact } = useTracking();
  const contactCtaMode = productContactCtaConfig?.mode || "contact_page";
  const contactCtaItems = productContactCtaConfig?.items || {};
  const shopeeUrl = product.shopee_url?.trim();
  const showShopeeButton = Boolean(shopeeLinkEnabled && shopeeUrl);
  const contactActions = useMemo(() => {
    const actions = [
      {
        id: "facebook",
        label: "Facebook",
        href: contactCtaItems.facebook?.trim(),
        bg: "#1877F2",
        Icon: FacebookIcon,
        targetBlank: true,
      },
      {
        id: "zalo",
        label: "Zalo",
        href: contactCtaItems.zalo?.trim(),
        bg: "#00B5F1",
        iconType: "image" as const,
        targetBlank: true,
      },
      {
        id: "phone",
        label: "SĐT",
        href: resolvePhoneHref(contactCtaItems.phone),
        bg: "#9B2C3B",
        Icon: Phone,
        targetBlank: false,
      },
      {
        id: "tiktok",
        label: "TikTok",
        href: contactCtaItems.tiktok?.trim(),
        bg: "#000000",
        Icon: TikTokIcon,
        targetBlank: true,
      },
    ];

    return actions.filter((action) => Boolean(action.href));
  }, [contactCtaItems.facebook, contactCtaItems.phone, contactCtaItems.tiktok, contactCtaItems.zalo]);

  useEffect(() => {
    if (product?.id) {
      trackProductView(product.id, {
        product_name: product.name,
        category: product.category?.name || product.type?.name,
        price: product.price,
      });
    }
  }, [product?.id, product.name, product.category, product.type, product.price, trackProductView]);

  const imageItems = useMemo(() => {
    const items: ProductGalleryItem[] = [];
    const coverSrc = getImageUrl(product.cover_image_url);

    if (coverSrc) {
      items.push({ src: coverSrc });
    }

    (product.gallery ?? []).forEach((image) => {
      const src = getImageUrl(image.url);

      if (!src || src === coverSrc) {
        return;
      }

      items.push({
        src,
        width: image.width,
        height: image.height,
      });
    });

    if (items.length === 0) {
      items.push({ src: "/placeholder/wine-bottle.svg" });
    }

    return items;
  }, [product]);

  const discountPercentage = useMemo(() => {
    if (product.discount_percent) {
      return product.discount_percent;
    }
    if (product.original_price && product.price && product.original_price > product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return 0;
  }, [product]);

  const attributeItems: AttributeDisplayItem[] = useMemo(() => {
    const attrs: AttributeDisplayItem[] = [];
    const addedCodes = new Set<string>();
    
    // Base filter URL với type (nếu có)
    const typeSlug = product.type?.slug;
    const baseFilterUrl = typeSlug ? `/filter?type=${typeSlug}` : '/filter';
    const buildFilterUrl = (paramKey: string, paramValue: string) => {
      return typeSlug 
        ? `${baseFilterUrl}&${paramKey}=${paramValue}`
        : `/filter?${paramKey}=${paramValue}`;
    };

    // Brand và Origin - tìm từ attributes để lấy đúng group_code động
    // Nếu không tìm thấy trong attributes, không tạo filterUrl (vì không biết group_code)
    if (product.brand_term) {
      // Tìm group_code cho brand từ attributes
      const brandAttr = product.attributes?.find(a => 
        a.terms.some(t => t.id === product.brand_term?.id)
      );
      
      attrs.push({
        iconName: brandAttr?.icon_name,
        iconUrl: brandAttr?.icon_url ? getImageUrl(brandAttr.icon_url) : null,
        groupCode: brandAttr?.group_code || 'brand',
        label: brandAttr?.group_name || "Thương hiệu",
        value: product.brand_term.name,
        filterUrl: brandAttr ? buildFilterUrl(brandAttr.group_code, product.brand_term.slug) : undefined,
      });
      if (brandAttr) addedCodes.add(brandAttr.group_code);
    }

    if (product.country_term) {
      // Tìm group_code cho country từ attributes
      const countryAttr = product.attributes?.find(a => 
        a.terms.some(t => t.id === product.country_term?.id)
      );
      
      attrs.push({
        iconName: countryAttr?.icon_name,
        iconUrl: countryAttr?.icon_url ? getImageUrl(countryAttr.icon_url) : null,
        groupCode: countryAttr?.group_code || 'origin',
        label: countryAttr?.group_name || "Xuất xứ",
        value: product.country_term.name,
        filterUrl: countryAttr ? buildFilterUrl(countryAttr.group_code, product.country_term.slug) : undefined,
      });
      if (countryAttr) addedCodes.add(countryAttr.group_code);
    }

    if (product.extra_attrs && Object.keys(product.extra_attrs).length > 0) {
      Object.entries(product.extra_attrs).forEach(([code, attr]) => {
        if (!addedCodes.has(code)) {
          attrs.push({
            iconName: attr.icon_name,
            iconUrl: attr.icon_url ? getImageUrl(attr.icon_url) : null,
            groupCode: code,
            label: attr.label,
            value: String(attr.value),
          });
          addedCodes.add(code);
        }
      });
    }

    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attrGroup) => {
        if (addedCodes.has(attrGroup.group_code)) {
          return;
        }
        
        if (attrGroup.terms.length > 0) {
          const termNames = attrGroup.terms.map(t => t.name).join(', ');
          const firstTerm = attrGroup.terms[0];
          
          attrs.push({
            iconName: attrGroup.icon_name,
            iconUrl: attrGroup.icon_url ? getImageUrl(attrGroup.icon_url) : null,
            groupCode: attrGroup.group_code,
            label: attrGroup.group_name || attrGroup.group_code,
            value: termNames,
            filterUrl: buildFilterUrl(attrGroup.group_code, firstTerm.slug),
          });
          addedCodes.add(attrGroup.group_code);
        }
      });
    }

    return attrs;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const selectedImageItem = imageItems[selectedImage] ?? imageItems[0];
  const selectedImageSrc = selectedImageItem?.src ?? "/placeholder/wine-bottle.svg";
  const selectedImageAspectRatio =
    selectedImageItem?.width && selectedImageItem?.height
      ? `${selectedImageItem.width} / ${selectedImageItem.height}`
      : PRODUCT_IMAGE_ASPECT_RATIO;
  const desktopThumbnailCount = 3;
  const maxThumbnailStart = Math.max(0, imageItems.length - desktopThumbnailCount);
  const needsDesktopThumbnailPager = imageItems.length > desktopThumbnailCount;
  const visibleThumbnails = imageItems.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + desktopThumbnailCount
  );
  const canScrollUp = thumbnailStartIndex > 0;
  const canScrollDown = thumbnailStartIndex < maxThumbnailStart;

  const processedDescription = useMemo(
    () => processProductContent(product.description),
    [product.description]
  );

  useEffect(() => {
    if (descriptionRef.current) {
      const scrollHeight = descriptionRef.current.scrollHeight;
      setShowExpandButton(scrollHeight > 200);
    }
  }, [processedDescription]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const handleSelect = () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (selectedImage < thumbnailStartIndex) {
      setThumbnailStartIndex(selectedImage);
      return;
    }

    const endIndex = thumbnailStartIndex + desktopThumbnailCount - 1;
    if (selectedImage > endIndex) {
      setThumbnailStartIndex(Math.min(selectedImage - desktopThumbnailCount + 1, maxThumbnailStart));
    }
  }, [selectedImage, thumbnailStartIndex, maxThumbnailStart]);

  const priceLabel = formatPrice(product);
  const originalPriceLabel = formatOriginalPrice(product);
  const breadcrumbs = useMemo(() => buildProductBreadcrumbs(product), [product]);

  return (
    <div className="min-h-screen bg-[#fcfbf9]" style={fontFamily ? { fontFamily } : undefined}>
      {/* Breadcrumb */}
      <div className="bg-[#f5f0e8] py-2 md:py-3 border-b border-[#e5ddd0]">
        <div className="container mx-auto px-3 md:px-4 text-[11px] md:text-sm text-slate-600 flex gap-1.5 md:gap-2">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={`${item.label}-${index}`} className="flex items-center gap-1.5 md:gap-2 min-w-0">
                {isLast ? (
                  <span className="text-slate-900 font-medium truncate">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-[#9B2C3B] cursor-pointer transition-colors truncate">
                    {item.label}
                  </Link>
                )}
                {!isLast && <span>/</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 lg:gap-16 lg:items-start">
          {/* Left Column: Image Gallery (7/12 columns on large screens) */}
          <div className="lg:col-span-7 space-y-3 md:space-y-4 lg:sticky lg:top-4">
            <div className="flex flex-col gap-3 lg:hidden">
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", loop: false }}
                className="relative"
              >
                <CarouselContent className="ml-0">
                  {imageItems.map((img, idx) => (
                    <CarouselItem key={img.src} className="pl-0">
                      <div className="relative w-full max-w-[480px] mx-auto overflow-hidden rounded-xl border border-[#e5ddd0]/40 bg-white shadow-sm">
                        {discountPercentage > 0 && (
                          <span className="absolute top-3 left-3 z-10 bg-[hsl(0,84.2%,60.2%)] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                            -{discountPercentage}%
                          </span>
                        )}
                        {/* Blur background layer */}
                        <div
                          className="absolute inset-0 scale-150 blur-3xl opacity-40"
                          style={{
                            backgroundImage: `url(${img.src})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        {/* Main image container */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(idx);
                            setIsImagePreviewOpen(true);
                          }}
                          className="relative w-full p-1 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B2C3B] focus-visible:ring-offset-2 cursor-zoom-in"
                          style={{ aspectRatio: PRODUCT_IMAGE_ASPECT_RATIO }}
                          aria-label="Xem ảnh sản phẩm lớn hơn"
                        >
                          <ProductImage
                            src={img.src}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-contain"
                            priority={idx === 0}
                          />
                        </button>
                        {imageItems.length > 1 && (
                          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {idx + 1}/{imageItems.length}
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="hidden lg:flex lg:items-start lg:gap-6">
              {imageItems.length > 1 && (
                <div className="flex w-24 shrink-0 flex-col items-stretch gap-2">
                  {needsDesktopThumbnailPager && (
                    <button
                      type="button"
                      onClick={() => setThumbnailStartIndex((prev) => Math.max(0, prev - 1))}
                      disabled={!canScrollUp}
                      className={`flex h-7 w-full items-center justify-center rounded-md border border-[#e5ddd0]/60 bg-white text-[#9B2C3B] transition ${
                        canScrollUp ? "hover:bg-[#9B2C3B]/10" : "opacity-40 cursor-not-allowed"
                      }`}
                      aria-label="Xem ảnh phía trên"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  )}

                  <div
                    className="relative w-24 overflow-hidden"
                    style={{ height: "calc(3 * 6rem + 2 * 1rem)" }}
                  >
                    {needsDesktopThumbnailPager && canScrollUp && (
                      <div className="pointer-events-none absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-white to-transparent" />
                    )}
                    {needsDesktopThumbnailPager && canScrollDown && (
                      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-white to-transparent" />
                    )}

                    <div className="flex h-full flex-col items-stretch gap-4">
                      {(needsDesktopThumbnailPager ? visibleThumbnails : imageItems).map((img, idx) => {
                        const actualIndex = needsDesktopThumbnailPager
                          ? thumbnailStartIndex + idx
                          : idx;
                        return (
                          <button
                            key={img.src}
                            type="button"
                            onClick={() => setSelectedImage(actualIndex)}
                            className={`relative block w-24 flex-none overflow-hidden rounded-lg border bg-white transition-all ${
                              selectedImage === actualIndex
                                ? 'ring-2 ring-[#9B2C3B] border-[#9B2C3B]'
                                : 'border-[#e5ddd0]/40 opacity-70'
                            }`}
                            style={{ aspectRatio: PRODUCT_IMAGE_ASPECT_RATIO }}
                          >
                            <ProductImage 
                              src={img.src} 
                              alt={`Thumbnail ${actualIndex + 1}`} 
                              fill 
                              className="object-contain p-0.5" 
                              sizes="96px"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {needsDesktopThumbnailPager && (
                    <button
                      type="button"
                      onClick={() => setThumbnailStartIndex((prev) => Math.min(maxThumbnailStart, prev + 1))}
                      disabled={!canScrollDown}
                      className={`flex h-7 w-full items-center justify-center rounded-md border border-[#e5ddd0]/60 bg-white text-[#9B2C3B] transition ${
                        canScrollDown ? "hover:bg-[#9B2C3B]/10" : "opacity-40 cursor-not-allowed"
                      }`}
                      aria-label="Xem ảnh phía dưới"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="relative w-full max-w-[480px] overflow-hidden rounded-xl border border-[#e5ddd0]/40 bg-white shadow-sm">
                {discountPercentage > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-[hsl(0,84.2%,60.2%)] text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
                    -{discountPercentage}%
                  </span>
                )}
                {/* Blur background layer */}
                <div 
                  className="absolute inset-0 scale-150 blur-3xl opacity-40"
                  style={{
                    backgroundImage: `url(${selectedImageSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Main image container */}
                <button
                  type="button"
                  onClick={() => setIsImagePreviewOpen(true)}
                  className="relative w-full p-1 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B2C3B] focus-visible:ring-offset-2 cursor-zoom-in"
                  style={{ aspectRatio: PRODUCT_IMAGE_ASPECT_RATIO }}
                  aria-label="Xem ảnh sản phẩm lớn hơn"
                >
                  <ProductImage
                    src={selectedImageSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                    priority
                  />
                </button>
              </div>
            </div>

            <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
              <DialogContent className="w-[92vw] max-w-[960px] border-0 bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">Xem ảnh sản phẩm</DialogTitle>
                <div className="relative mx-auto max-h-[90vh] w-full overflow-hidden rounded-2xl bg-[#1C1C1C]" style={{ aspectRatio: selectedImageAspectRatio }}>
                  <ProductImage
                    src={selectedImageSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 92vw, 960px"
                    className="object-contain"
                    priority
                  />
                  <DialogClose className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1C1C1C] transition hover:bg-white">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Column: Product Info (5/12 columns) */}
          <div className="lg:col-span-5 flex flex-col animate-in slide-in-from-right-4 duration-500">
            {/* Category Badge */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-sm text-[#9B2C3B] font-medium tracking-wide uppercase mb-1.5 md:mb-2">
              {product.type?.name && (
                <span className="inline-flex items-center rounded-full border border-transparent bg-[#ECAA4D] text-[hsl(20,14.3%,4.1%)] px-2 py-0.5 text-[10px] md:text-xs font-semibold">
                  {product.type.name}
                </span>
              )}
              {product.category?.name && (
                <span className="text-[10px] md:text-xs">{product.category.name}</span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight mb-3 md:mb-6">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-end gap-2.5 p-3 md:p-4 bg-[#ECAA4D]/10 rounded-lg border border-[#ECAA4D]/30 mb-4 md:mb-6">
              <div className="text-2xl md:text-4xl font-bold text-[#9B2C3B]">
                {priceLabel}
              </div>
              {originalPriceLabel && (
                <span className="text-sm md:text-lg text-slate-400 line-through mb-1">
                  {originalPriceLabel}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="mb-1 ml-auto inline-flex items-center rounded-full border border-transparent bg-[hsl(0,84.2%,60.2%)] text-white px-2 py-0.5 text-[10px] md:text-xs font-semibold">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* Specifications Grid - Compact */}
            {attributeItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2 md:gap-4 py-3 md:py-4 border-y border-[#e5ddd0] mb-4 md:mb-6">
                {attributeItems.map((attr, idx) => (
                  <div key={idx} className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5 p-1 md:p-1.5 bg-[#ECAA4D]/20 rounded-md text-[#9B2C3B]">
                      <AttributeIcon iconName={attr.iconName} iconUrl={attr.iconUrl} />
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        {attr.label}
                      </p>
                      {attr.filterUrl ? (
                        <Link 
                          href={attr.filterUrl} 
                          className="text-[11px] md:text-sm font-medium text-slate-900 truncate block hover:text-[#9B2C3B] transition-colors"
                        >
                          {attr.value}
                        </Link>
                      ) : (
                        <p className="text-[11px] md:text-sm font-medium text-slate-900 truncate">{attr.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            {contactCtaMode === "social_4_buttons" && contactActions.length > 0 ? (
              <div className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {contactActions.map((action) => (
                    <Link
                      key={action.id}
                      href={action.href as string}
                      target={action.targetBlank ? "_blank" : undefined}
                      rel={action.targetBlank ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-center gap-2 h-12 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: action.bg }}
                      onClick={() => trackCTAContact({
                        button: action.id,
                        placement: "product_detail",
                        product_id: product.id,
                        product_name: product.name,
                      })}
                    >
                      {action.iconType === "image" ? (
                        <img src="/icons/zalo.png" alt="Zalo" className="h-5 w-5" />
                      ) : (
                        action.Icon ? <action.Icon className="h-5 w-5" /> : null
                      )}
                      <span>{action.label}</span>
                    </Link>
                  ))}
                </div>
                {showShopeeButton && (
                  <Button
                    asChild
                    size="lg"
                    className="mt-3 w-full h-12 bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white text-sm sm:text-base"
                  >
                    <a href={shopeeUrl} target="_blank" rel="noopener noreferrer">
                      Xem sản phẩm ở Shopee
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="flex-1 text-base h-12 bg-[#9B2C3B] hover:bg-[#9B2C3B]/90 text-white shadow-sm"
                  onClick={() => trackCTAContact({
                    button: "contact_order",
                    placement: "product_detail",
                    product_id: product.id,
                    product_name: product.name,
                  })}
                >
                  <Link href="/contact" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5 mr-2" /> Liên hệ đặt hàng
                  </Link>
                </Button>
                {showShopeeButton && (
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 h-12 bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white text-sm sm:text-base"
                  >
                    <a href={shopeeUrl} target="_blank" rel="noopener noreferrer">
                      Xem sản phẩm ở Shopee
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Description Section - Full Width */}
      <section className="bg-white py-12 border-y border-[#e5ddd0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Thông tin chi tiết
            </h2>
            <div className="w-16 h-1 bg-[#9B2C3B] rounded-full"></div>
            
            <div className="relative w-full">
              {processedDescription ? (
                <>
                  <div 
                       ref={descriptionRef}
                    className={`text-slate-600 leading-relaxed text-left md:text-center space-y-4 overflow-hidden transition-all duration-500 ease-in-out text-base
                      ${!isDescExpanded ? 'max-h-[200px]' : 'max-h-[2000px]'}
                    `}
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                  />
                  
                     {!isDescExpanded && showExpandButton && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                  )}

                     {showExpandButton && (
                    <Button 
                      variant="ghost"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="relative z-10 mt-6 gap-2 text-[#9B2C3B] hover:text-[#9B2C3B] hover:bg-[#9B2C3B]/10 font-semibold text-base px-8 py-3 border-2 border-[#9B2C3B] hover:border-[#9B2C3B]/70 transition-all bg-white"
                    >
                      {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
                      {isDescExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Nội dung sản phẩm đang cập nhật.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Sections */}
      <div className="bg-white py-12 border-t border-[#e5ddd0]">
        <div className="container mx-auto px-4">
          {product.same_type_products && product.same_type_products.products.length > 0 && (
            <div className="mb-12">
              <RelatedProductsSection
                title={`Cùng loại ${product.type?.name || 'sản phẩm'}`}
                products={product.same_type_products.products}
                viewAllHref={product.same_type_products.view_all_url || undefined}
                viewAllLabel="Xem tất cả"
              />
            </div>
          )}

          {product.related_by_attributes && product.related_by_attributes.products.length > 0 && (
            <div>
              <RelatedProductsSection
                title="Sản phẩm liên quan"
                products={product.related_by_attributes.products}
                viewAllHref={product.related_by_attributes.view_all_url || undefined}
                viewAllLabel="Xem tất cả"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Grape,
  Wine as WineIcon,
  Globe,
  Percent,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductDetail } from "@/lib/api/products";
import { processProductContent } from "@/lib/utils/article-content";
import RelatedProductsSection from "./RelatedProducts";

interface MetaItem {
  icon: React.ElementType;
  label: string;
  filterUrl?: string;
}

interface ProductDetailPageProps {
  product: ProductDetail;
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

interface MetaRowProps extends MetaItem {
  filterUrl?: string;
}

function MetaRow({ icon: Icon, label, filterUrl }: MetaRowProps) {
  if (!label) return null;

  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0 text-[#9B2C3B]" strokeWidth={1.5} />
      <span className="text-sm sm:text-base leading-relaxed">{label}</span>
    </>
  );

  if (filterUrl) {
    return (
      <a 
        href={filterUrl}
        className="flex items-center gap-3 text-[#1C1C1C] hover:text-[#9B2C3B] transition-colors group"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[#1C1C1C]">
      {content}
    </div>
  );
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const imageSources = useMemo(() => {
    const galleryUrls = (product.gallery ?? [])
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url));

    const urls = [...galleryUrls];

    if (product.cover_image_url && !urls.includes(product.cover_image_url)) {
      urls.unshift(product.cover_image_url);
    }

    if (urls.length === 0) {
      urls.push("/placeholder/wine-bottle.svg");
    }

    return urls;
  }, [product]);

  const badgeText = useMemo(() => {
    if (product.discount_percent) {
      return `Giảm ${product.discount_percent}%`;
    }

    if (product.badges && product.badges.length > 0) {
      return product.badges[0];
    }

    return null;
  }, [product]);

  const grapeLabel = useMemo(() => {
    if (!product.grape_terms || product.grape_terms.length === 0) {
      return "";
    }

    return product.grape_terms.map((term) => term.name).join(", ");
  }, [product]);

  const countryLabel = product.country_term?.name
    ? `Vang ${product.country_term.name}`
    : "";

  const alcoholLabel = typeof product.alcohol_percent === "number"
    ? `${product.alcohol_percent}% ABV`
    : "";

  // Build filter URLs
  const grapeFilterUrl = useMemo(() => {
    if (!product.grape_terms || product.grape_terms.length === 0) return undefined;
    const grapeIds = product.grape_terms.map(t => t.id).join(',');
    return `/filter?grape=${grapeIds}`;
  }, [product.grape_terms]);

  const typeFilterUrl = product.type?.id 
    ? `/filter?type=${product.type.id}` 
    : product.category?.id 
    ? `/filter?category=${product.category.id}` 
    : undefined;

  const brandFilterUrl = product.brand_term?.id 
    ? `/filter?brand=${product.brand_term.id}` 
    : undefined;

  const countryFilterUrl = product.country_term?.id 
    ? `/filter?origin=${product.country_term.id}` 
    : undefined;

  const alcoholFilterUrl = useMemo(() => {
    if (typeof product.alcohol_percent !== "number") return undefined;
    const abv = product.alcohol_percent;
    if (abv < 10) return '/filter?alcohol=under10';
    if (abv < 12) return '/filter?alcohol=10-12';
    if (abv < 14) return '/filter?alcohol=12-14';
    if (abv < 16) return '/filter?alcohol=14-16';
    return '/filter?alcohol=over16';
  }, [product.alcohol_percent]);

  const metaItems: MetaItem[] = [
    { icon: Grape, label: grapeLabel, filterUrl: grapeFilterUrl },
    { icon: WineIcon, label: product.type?.name ?? product.category?.name ?? "", filterUrl: typeFilterUrl },
    { icon: Building2, label: product.brand_term?.name ?? "", filterUrl: brandFilterUrl },
    { icon: Globe, label: countryLabel, filterUrl: countryFilterUrl },
    { icon: Percent, label: alcoholLabel, filterUrl: alcoholFilterUrl },
  ];

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const goToPreviousImage = () => {
    setMainImageIndex((prevIndex) =>
      prevIndex === 0 ? imageSources.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setMainImageIndex((prevIndex) =>
      prevIndex === imageSources.length - 1 ? 0 : prevIndex + 1
    );
  };

  const selectImage = (index: number) => {
    setMainImageIndex(index);
  };

  const categoryLabel = product.category?.name ?? product.type?.name ?? "Sản phẩm";
  const processedDescription = useMemo(
    () => processProductContent(product.description),
    [product.description]
  );
  const priceLabel = formatPrice(product);
  const originalPriceLabel = formatOriginalPrice(product);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="text-xs sm:text-sm text-gray-600 mb-2 uppercase tracking-wider font-medium">
          {categoryLabel}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#1C1C1C]">
          {product.name}
        </h1>
      </div>

      <Separator className="mb-6 sm:mb-8 bg-gray-200" />

      {/* Main Content: Mobile-first, Desktop 40/60 split */}
      <div className="grid gap-8 lg:grid-cols-[40%_1fr] lg:gap-12 xl:gap-16">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          {/* Main Product Image - Portrait 3:4 for wine bottles */}
          <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={imageSources[mainImageIndex]}
              alt={product.name}
              fill
              className="object-contain object-center p-4"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
            {badgeText && (
              <div className="absolute top-3 left-3 rounded-full bg-[#9B2C3B] px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                {badgeText}
              </div>
            )}
            {imageSources.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={goToPreviousImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={goToNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Images - Elegant minimal design */}
          {imageSources.length > 1 && (
            <div className="flex flex-row gap-2 justify-center sm:justify-start">
              {imageSources.map((thumbnail, index) => (
                <button
                  key={thumbnail + index}
                  className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-md transition-all border-2 ${
                    index === mainImageIndex
                      ? "border-[#ECAA4D] shadow-sm"
                      : "border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => selectImage(index)}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <Image
                    src={thumbnail}
                    alt={`Ảnh sản phẩm ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-[#1C1C1C]">
              {priceLabel}
            </span>
            {originalPriceLabel && (
              <span className="text-xl text-gray-400 line-through">
                {originalPriceLabel}
              </span>
            )}
          </div>

          {/* Wine Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Thông tin sản phẩm
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {metaItems.map((item, index) => (
                <MetaRow key={`${item.label}-${index}`} {...item} />
              ))}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Description Section with Read More */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Mô tả sản phẩm
            </h3>
            {processedDescription ? (
              <div className="relative">
                <div
                  className={`prose prose-sm max-w-none overflow-hidden transition-all duration-300
                    prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed 
                    prose-p:text-gray-700 prose-p:mb-3
                    prose-headings:text-[#1C1C1C] prose-headings:font-semibold prose-headings:mb-2
                    prose-strong:text-[#1C1C1C] prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-3
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-3
                    prose-li:text-gray-700 prose-li:mb-1.5
                    ${!isDescriptionExpanded ? 'max-h-32' : 'max-h-none'}
                  `}
                  dangerouslySetInnerHTML={{ __html: processedDescription }}
                />
                {!isDescriptionExpanded && processedDescription.length > 300 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
                {processedDescription.length > 300 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="relative z-10 mt-2 flex items-center gap-1 text-sm font-medium text-[#9B2C3B] hover:text-[#7a2330] transition-colors cursor-pointer"
                    type="button"
                  >
                    {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm sm:text-base text-gray-500 italic">
                Nội dung sản phẩm đang cập nhật.
              </p>
            )}
          </div>

          {/* CTA Button - Sticky on Mobile */}
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-4 lg:static lg:pt-6 lg:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 border-t lg:border-t-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-none">
            <Button 
              asChild
              className="h-12 sm:h-14 w-full text-base sm:text-lg font-semibold bg-[#ECAA4D] text-white hover:bg-[#d9973a] transition-colors shadow-lg hover:shadow-xl"
            >
              <Link href="/contact" target="_blank" rel="noopener noreferrer">
                Liên hệ đặt hàng
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Sections */}
      {product.same_type_products && product.same_type_products.products.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <Separator className="mb-8 lg:mb-12 bg-gray-200" />
          <RelatedProductsSection
            title={`Cùng loại ${product.type?.name || 'sản phẩm'}`}
            products={product.same_type_products.products}
            viewAllHref={product.same_type_products.view_all_url || undefined}
            viewAllLabel="Xem thêm"
          />
        </div>
      )}

      {product.related_by_attributes && product.related_by_attributes.products.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <Separator className="mb-8 lg:mb-12 bg-gray-200" />
          <RelatedProductsSection
            title="Sản phẩm liên quan"
            products={product.related_by_attributes.products}
            viewAllHref={product.related_by_attributes.view_all_url || undefined}
            viewAllLabel="Xem thêm"
          />
        </div>
      )}
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  MapPin,
  Sparkles,
  Hourglass,
  Droplets,
  Percent,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useTracking } from "@/hooks/use-tracking";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductDetail } from "@/lib/api/products";
import { processProductContent } from "@/lib/utils/article-content";
import RelatedProductsSection from "./RelatedProducts";

interface AttributeDisplayItem {
  iconUrl?: string | null;
  fallbackIcon: React.ReactNode;
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

// Fallback icons based on group code (same as FilterProductCard)
const getFallbackIcon = (code?: string): React.ReactNode => {
  if (!code) return <Sparkles size={20} />;
  
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('huong') || lowerCode.includes('flavor') || lowerCode.includes('grape')) {
    return <Sparkles size={20} />;
  } else if (lowerCode.includes('chat_lieu') || lowerCode.includes('material')) {
    return <Layers size={20} />;
  } else if (lowerCode.includes('xuat_xu') || lowerCode.includes('origin') || lowerCode.includes('country')) {
    return <MapPin size={20} />;
  } else if (lowerCode.includes('tuoi') || lowerCode.includes('age')) {
    return <Hourglass size={20} />;
  } else if (lowerCode.includes('dung_tich') || lowerCode.includes('volume') || lowerCode.includes('the_tich') || lowerCode.includes('ml')) {
    return <Droplets size={20} />;
  } else if (
    lowerCode.includes('nong_do') ||
    lowerCode.includes('alcohol') ||
    lowerCode.includes('abv') ||
    lowerCode.includes('phan_tram') ||
    lowerCode.includes('percent')
  ) {
    return <Percent size={20} />;
  } else if (lowerCode.includes('brand')) {
    return <Tag size={20} />;
  }
  
  return <Tag size={20} />;
};

// Icon renderer component
function AttributeIcon({ url, fallbackIcon }: { url?: string | null; fallbackIcon: React.ReactNode }) {
  if (url) {
    return (
      <Image 
        src={url} 
        alt="attribute" 
        width={20} 
        height={20}
        className="w-5 h-5 object-contain"
      />
    );
  }
  return <span className="w-5 h-5 flex items-center justify-center text-[#9B2C3B]">{fallbackIcon}</span>;
}

function AttributeRow({ iconUrl, fallbackIcon, label, filterUrl }: AttributeDisplayItem) {
  if (!label) return null;

  const content = (
    <>
      <AttributeIcon url={iconUrl} fallbackIcon={fallbackIcon} />
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
  const { trackProductView, trackCTAContact } = useTracking();

  // Track product view when component mounts
  useEffect(() => {
    if (product?.id) {
      trackProductView(product.id, {
        product_name: product.name,
        category: product.category?.name || product.type?.name,
        price: product.price,
      });
    }
  }, [product?.id, product.name, product.category, product.type, product.price, trackProductView]);

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

  // Build dynamic attributes list from API (similar to FilterProductCard)
  const attributeItems: AttributeDisplayItem[] = useMemo(() => {
    const attrs: AttributeDisplayItem[] = [];

    // Brand
    if (product.brand_term) {
      attrs.push({
        fallbackIcon: getFallbackIcon('brand'),
        label: product.brand_term.name,
        filterUrl: `/filter?brand=${product.brand_term.id}`,
      });
    }

    // Origin/Country
    if (product.country_term) {
      attrs.push({
        fallbackIcon: getFallbackIcon('origin'),
        label: product.country_term.name,
        filterUrl: `/filter?origin=${product.country_term.id}`,
      });
    }

    // Attributes from API terms (catalog groups) - Use icon_url from API
    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attrGroup) => {
        // Skip brand and origin since we handle them separately above
        if (attrGroup.group_code === 'brand' || attrGroup.group_code === 'origin') {
          return;
        }
        
        attrGroup.terms.forEach((term) => {
          attrs.push({
            fallbackIcon: getFallbackIcon(attrGroup.group_code),
            iconUrl: attrGroup.icon_url,
            label: term.name,
            filterUrl: `/filter?${attrGroup.group_code}=${term.id}`,
          });
        });
      });
    }

    // Extra attrs (nhập tay) - sử dụng icon_url từ API
    if (product.extra_attrs) {
      Object.entries(product.extra_attrs).forEach(([key, attr]) => {
        attrs.push({
          fallbackIcon: getFallbackIcon(key),
          iconUrl: attr.icon_url,
          label: `${attr.value}`,
        });
      });
    }

    // Volume
    if (product.volume_ml && product.volume_ml > 0) {
      attrs.push({
        fallbackIcon: getFallbackIcon('volume'),
        label: `${product.volume_ml}ml`,
      });
    }

    return attrs;
  }, [product]);

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
              {attributeItems.map((item, index) => (
                <AttributeRow key={`${item.label}-${index}`} {...item} />
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
              onClick={() => trackCTAContact({
                button: 'contact_order',
                placement: 'product_detail',
                product_id: product.id,
                product_name: product.name,
              })}
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
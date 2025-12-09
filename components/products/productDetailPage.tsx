"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  Tag,
  MapPin,
  Sparkles,
  Hourglass,
  Droplets,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
  Phone,
  Globe,
  FlaskConical,
  Award,
} from "lucide-react";
import { useTracking } from "@/hooks/use-tracking";

import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/api/products";
import { processProductContent } from "@/lib/utils/article-content";
import RelatedProductsSection from "./RelatedProducts";

interface AttributeDisplayItem {
  iconUrl?: string | null;
  fallbackIcon: React.ReactNode;
  label: string;
  value: string;
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

const getFallbackIcon = (code?: string): React.ReactNode => {
  if (!code) return <Sparkles className="w-4 h-4" />;
  
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('huong') || lowerCode.includes('flavor') || lowerCode.includes('grape')) {
    return <Sparkles className="w-4 h-4" />;
  } else if (lowerCode.includes('chat_lieu') || lowerCode.includes('material')) {
    return <Layers className="w-4 h-4" />;
  } else if (lowerCode.includes('xuat_xu') || lowerCode.includes('origin') || lowerCode.includes('country')) {
    return <Globe className="w-4 h-4" />;
  } else if (lowerCode.includes('tuoi') || lowerCode.includes('age')) {
    return <Hourglass className="w-4 h-4" />;
  } else if (lowerCode.includes('dung_tich') || lowerCode.includes('volume') || lowerCode.includes('the_tich') || lowerCode.includes('ml')) {
    return <FlaskConical className="w-4 h-4" />;
  } else if (
    lowerCode.includes('nong_do') ||
    lowerCode.includes('alcohol') ||
    lowerCode.includes('abv') ||
    lowerCode.includes('phan_tram') ||
    lowerCode.includes('percent')
  ) {
    return <Droplets className="w-4 h-4" />;
  } else if (lowerCode.includes('brand')) {
    return <Award className="w-4 h-4" />;
  }
  
  return <Tag className="w-4 h-4" />;
};

function AttributeIcon({ url, fallbackIcon }: { url?: string | null; fallbackIcon: React.ReactNode }) {
  if (url) {
    return (
      <Image 
        src={url} 
        alt="attribute" 
        width={16} 
        height={16}
        className="w-4 h-4 object-contain"
      />
    );
  }
  return <span className="text-red-600">{fallbackIcon}</span>;
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const { trackProductView, trackCTAContact } = useTracking();

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

    if (product.brand_term) {
      attrs.push({
        fallbackIcon: getFallbackIcon('brand'),
        label: "Thương hiệu",
        value: product.brand_term.name,
        filterUrl: `/filter?brand=${product.brand_term.slug}`,
      });
    }

    if (product.country_term) {
      attrs.push({
        fallbackIcon: getFallbackIcon('origin'),
        label: "Xuất xứ",
        value: product.country_term.name,
        filterUrl: `/filter?origin=${product.country_term.slug}`,
      });
    }

    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attrGroup) => {
        if (attrGroup.group_code === 'brand' || attrGroup.group_code === 'origin') {
          return;
        }
        
        attrGroup.terms.forEach((term) => {
          attrs.push({
            fallbackIcon: getFallbackIcon(attrGroup.group_code),
            iconUrl: attrGroup.icon_url,
            label: attrGroup.group_name || attrGroup.group_code,
            value: term.name,
            filterUrl: `/filter?${attrGroup.group_code}=${term.slug}`,
          });
        });
      });
    }

    if (product.extra_attrs) {
      Object.entries(product.extra_attrs).forEach(([key, attr]) => {
        attrs.push({
          fallbackIcon: getFallbackIcon(key),
          iconUrl: attr.icon_url,
          label: attr.label || key,
          value: `${attr.value}`,
        });
      });
    }

    if (product.volume_ml && product.volume_ml > 0) {
      attrs.push({
        fallbackIcon: getFallbackIcon('volume'),
        label: "Dung tích",
        value: `${product.volume_ml}ml`,
      });
    }

    if (product.alcohol_percent && product.alcohol_percent > 0) {
      attrs.push({
        fallbackIcon: getFallbackIcon('alcohol'),
        label: "Nồng độ",
        value: `${product.alcohol_percent}%`,
      });
    }

    return attrs;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const processedDescription = useMemo(
    () => processProductContent(product.description),
    [product.description]
  );
  const priceLabel = formatPrice(product);
  const originalPriceLabel = formatOriginalPrice(product);

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (7/12 columns on large screens) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-white p-4 md:p-8 shadow-sm group">
            {discountPercentage > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
            <div className="relative w-full h-full">
              <Image
                src={imageSources[selectedImage]}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            </div>
          </div>
          
          {imageSources.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {imageSources.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white p-2 transition-all ${
                    selectedImage === idx 
                      ? 'border-[#ECAA4D] ring-2 ring-[#ECAA4D]/20' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <Image 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    fill 
                    className="object-contain p-1" 
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info (5/12 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price Section */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-bold text-red-700">{priceLabel}</span>
              {originalPriceLabel && (
                <span className="text-lg text-slate-400 line-through mb-1">
                  {originalPriceLabel}
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-6">
            <Button 
              asChild
              className="w-full h-12 gap-2 bg-[#e6a347] hover:bg-[#d58f35] text-white shadow-lg shadow-orange-200/50 uppercase font-bold tracking-wide"
              onClick={() => trackCTAContact({
                button: 'contact_order',
                placement: 'product_detail',
                product_id: product.id,
                product_name: product.name,
              })}
            >
              <Link href="/contact" target="_blank" rel="noopener noreferrer">
                <Phone className="w-5 h-5" /> Liên hệ đặt hàng
              </Link>
            </Button>
          </div>

          {/* Specifications Grid - Compact */}
          {attributeItems.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {attributeItems.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <AttributeIcon url={attr.iconUrl} fallbackIcon={attr.fallbackIcon} />
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{attr.label}</p>
                    {attr.filterUrl ? (
                      <Link 
                        href={attr.filterUrl} 
                        className="text-sm font-semibold text-slate-900 truncate block hover:text-red-700 transition-colors"
                      >
                        {attr.value}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 truncate">{attr.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="mt-2">
            <h3 className="text-slate-900 font-serif font-bold text-lg mb-3">Thông tin chi tiết</h3>
            {processedDescription ? (
              <div className="relative">
                <div 
                  className={`prose prose-sm prose-slate text-slate-600 transition-all duration-500 ease-in-out
                    prose-p:mb-3 prose-p:leading-relaxed
                    prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:mb-2
                    prose-strong:text-slate-900 prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-3
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-3
                    prose-li:text-slate-600 prose-li:mb-1.5
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-4
                    ${!isDescExpanded ? 'max-h-[250px] overflow-hidden' : ''}
                  `}
                  dangerouslySetInnerHTML={{ __html: processedDescription }}
                />

                {!isDescExpanded && processedDescription.length > 300 && (
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}

                {processedDescription.length > 300 && (
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-2 flex items-center gap-1 text-[#9B2C3B] font-medium hover:text-[#7a2330] hover:underline text-sm"
                  >
                    {isDescExpanded ? (
                      <>Thu gọn <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Xem thêm <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nội dung sản phẩm đang cập nhật.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Sections */}
      {product.same_type_products && product.same_type_products.products.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <RelatedProductsSection
            title={`Cùng loại ${product.type?.name || 'sản phẩm'}`}
            products={product.same_type_products.products}
            viewAllHref={product.same_type_products.view_all_url || undefined}
            viewAllLabel="Xem tất cả"
          />
        </div>
      )}

      {product.related_by_attributes && product.related_by_attributes.products.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <RelatedProductsSection
            title="Sản phẩm liên quan"
            products={product.related_by_attributes.products}
            viewAllHref={product.related_by_attributes.view_all_url || undefined}
            viewAllLabel="Xem tất cả"
          />
        </div>
      )}
    </div>
  );
}

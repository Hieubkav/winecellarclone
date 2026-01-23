"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  Tag,
  Sparkles,
  Hourglass,
  Droplets,
  Layers,
  ChevronDown,
  ChevronUp,
  Phone,
  Globe,
  FlaskConical,
  Award,
  Grape,
  MapPin,
} from "lucide-react";
import { useTracking } from "@/hooks/use-tracking";
import { ProductImage } from "@/components/ui/product-image";

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
    <div className="min-h-screen bg-[#fcfbf9]">
      {/* Breadcrumb */}
      <div className="bg-[#f5f0e8] py-3 border-b border-[#e5ddd0]">
        <div className="container mx-auto px-4 text-xs md:text-sm text-slate-600 flex gap-2">
          <Link href="/" className="hover:text-[#9B2C3B] cursor-pointer transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-[#9B2C3B] cursor-pointer transition-colors">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column: Image Gallery (7/12 columns on large screens) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#e5ddd0] bg-white shadow-sm group">
              {discountPercentage > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-[hsl(0,84.2%,60.2%)] text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
              <div className="relative w-full h-full p-8">
                <ProductImage
                  src={imageSources[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              </div>
            </div>
            
            {imageSources.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {imageSources.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white transition-all ${
                      selectedImage === idx 
                        ? 'ring-2 ring-[#9B2C3B] border-[#9B2C3B]' 
                        : 'border-[#e5ddd0] hover:border-[#9B2C3B]/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ProductImage 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info (5/12 columns) */}
          <div className="lg:col-span-5 flex flex-col animate-in slide-in-from-right-4 duration-500">
            {/* Category Badge */}
            <div className="flex items-center gap-2 text-sm text-[#9B2C3B] font-medium tracking-wide uppercase mb-2">
              {product.type?.name && (
                <span className="inline-flex items-center rounded-full border border-transparent bg-[#ECAA4D] text-[hsl(20,14.3%,4.1%)] px-2.5 py-0.5 text-xs font-semibold">
                  {product.type.name}
                </span>
              )}
              {product.category?.name && (
                <span className="text-xs">{product.category.name}</span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-6">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-end gap-3 p-4 bg-[#ECAA4D]/10 rounded-lg border border-[#ECAA4D]/30 mb-6">
              <div className="text-3xl md:text-4xl font-bold text-[#9B2C3B]">
                {priceLabel}
              </div>
              {originalPriceLabel && (
                <span className="text-lg text-slate-400 line-through mb-1.5">
                  {originalPriceLabel}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="mb-2 ml-auto inline-flex items-center rounded-full border border-transparent bg-[hsl(0,84.2%,60.2%)] text-white px-2.5 py-0.5 text-xs font-semibold">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* Specifications Grid - Compact */}
            {attributeItems.length > 0 && (
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#e5ddd0] mb-6">
                {attributeItems.map((attr, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-[#ECAA4D]/20 rounded-md text-[#9B2C3B]">
                      <AttributeIcon url={attr.iconUrl} fallbackIcon={attr.fallbackIcon} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{attr.label}</p>
                      {attr.filterUrl ? (
                        <Link 
                          href={attr.filterUrl} 
                          className="text-sm font-medium text-slate-900 truncate block hover:text-[#9B2C3B] transition-colors"
                        >
                          {attr.value}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-slate-900 truncate">{attr.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                asChild
                size="lg"
                className="flex-1 text-base h-12 bg-[#9B2C3B] hover:bg-[#9B2C3B]/90 text-white shadow-sm"
                onClick={() => trackCTAContact({
                  button: 'contact_order',
                  placement: 'product_detail',
                  product_id: product.id,
                  product_name: product.name,
                })}
              >
                <Link href="/contact" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-5 h-5 mr-2" /> Liên hệ đặt hàng
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Description Section - Full Width */}
      <section className="bg-white py-12 border-y border-[#e5ddd0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Thông tin chi tiết</h2>
            <div className="w-16 h-1 bg-[#9B2C3B] rounded-full"></div>
            
            <div className="relative w-full">
              {processedDescription ? (
                <>
                  <div 
                    className={`text-slate-600 leading-relaxed text-left md:text-center space-y-4 overflow-hidden transition-all duration-500 ease-in-out
                      ${!isDescExpanded ? 'max-h-[200px] opacity-90' : 'max-h-[2000px] opacity-100'}
                    `}
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                  />
                  
                  {!isDescExpanded && processedDescription.length > 300 && (
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                  )}

                  {processedDescription.length > 300 && (
                    <Button 
                      variant="ghost"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="mt-2 gap-2 text-[#9B2C3B] hover:text-[#9B2C3B]/80 hover:bg-[#9B2C3B]/5 font-medium"
                    >
                      {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
                      {isDescExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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

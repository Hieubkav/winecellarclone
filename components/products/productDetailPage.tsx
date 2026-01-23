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
  Wine,
  Beer,
  Coffee,
  Milk,
  Apple,
  Cherry,
  Grape,
  MapPin,
  Map,
  Navigation,
  Compass,
  Mountain,
  Flag,
  Landmark,
  Building,
  Home,
  Store,
  Star,
  Crown,
  Trophy,
  Medal,
  Shield,
  BadgeCheck,
  Gem,
  Diamond,
  Zap,
  Target,
  TrendingUp,
  Tags,
  Bookmark,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Package,
  Box,
  Archive,
  ShoppingBag,
  ShoppingCart,
  Gift,
  Flame,
  Leaf,
  Flower,
  TreePine,
  Sprout,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Waves,
  Calendar,
  Clock,
  Timer,
  CalendarDays,
  Filter,
  Settings,
  Wrench,
  Hammer,
  Scissors,
  Ruler,
  Heart,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Feather,
  Anchor,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Palette,
  Brush,
  Pen,
  Pencil,
  Image as ImageIcon,
  Camera,
  Video,
  Music,
  Mic,
  Volume2,
  Bell,
  Lightbulb,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { useTracking } from "@/hooks/use-tracking";
import { ProductImage } from "@/components/ui/product-image";

import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/api/products";
import { processProductContent } from "@/lib/utils/article-content";
import RelatedProductsSection from "./RelatedProducts";

interface AttributeDisplayItem {
  iconName?: string | null;
  groupCode?: string;
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

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Wine, Beer, Coffee, Milk, Apple, Cherry, Grape,
  MapPin, Globe, Map, Navigation, Compass, Mountain, Flag, Landmark, Building, Home, Store,
  Award, Star, Crown, Trophy, Medal, Shield, BadgeCheck, Gem, Diamond, Sparkles, Zap, Target, TrendingUp,
  Tag, Tags, Bookmark, Hash, AtSign, Percent, DollarSign,
  Package, Box, Archive, ShoppingBag, ShoppingCart, Gift,
  Droplets, Flame, Leaf, Flower, TreePine, Sprout, Wind, Sun, Moon, Cloud, CloudRain, Snowflake, Waves,
  Calendar, Clock, Timer, Hourglass, CalendarDays,
  Filter, Settings, Wrench, Hammer, Scissors, Ruler,
  Heart, Circle, Square, Triangle, Hexagon, Feather, Anchor, Key, Lock, Unlock, Eye, EyeOff,
  Palette, Brush, Pen, Pencil, Image: ImageIcon, Camera, Video, Music, Mic, Volume2, Bell, Lightbulb, Thermometer,
  FlaskConical, Layers,
};

const getFallbackIconByCode = (code?: string): LucideIcon => {
  if (!code) return Sparkles;
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('huong') || lowerCode.includes('flavor') || lowerCode.includes('grape')) return Grape;
  if (lowerCode.includes('chat_lieu') || lowerCode.includes('material')) return Layers;
  if (lowerCode.includes('xuat_xu') || lowerCode.includes('origin') || lowerCode.includes('country')) return Globe;
  if (lowerCode.includes('tuoi') || lowerCode.includes('age')) return Hourglass;
  if (lowerCode.includes('dung_tich') || lowerCode.includes('volume') || lowerCode.includes('the_tich') || lowerCode.includes('ml')) return FlaskConical;
  if (lowerCode.includes('nong_do') || lowerCode.includes('alcohol') || lowerCode.includes('abv') || lowerCode.includes('phan_tram') || lowerCode.includes('percent')) return Droplets;
  if (lowerCode.includes('brand') || lowerCode.includes('thuong_hieu')) return Award;
  return Tag;
};

function AttributeIcon({ iconName, groupCode }: { iconName?: string | null; groupCode?: string }) {
  const IconComponent = iconName ? LUCIDE_ICON_MAP[iconName] : null;
  if (IconComponent) {
    return <IconComponent className="w-4 h-4" />;
  }
  const FallbackIcon = getFallbackIconByCode(groupCode);
  return <FallbackIcon className="w-4 h-4" />;
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
    const urls: string[] = [];

    if (product.cover_image_url) {
      urls.push(product.cover_image_url);
    }

    const galleryUrls = (product.gallery ?? [])
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url) && url !== product.cover_image_url);

    urls.push(...galleryUrls);

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
    const addedCodes = new Set<string>();

    if (product.brand_term) {
      attrs.push({
        iconName: 'Award',
        groupCode: 'brand',
        label: "Thương hiệu",
        value: product.brand_term.name,
        filterUrl: `/filter?brand=${product.brand_term.slug}`,
      });
      addedCodes.add('brand');
    }

    if (product.country_term) {
      attrs.push({
        iconName: 'Flag',
        groupCode: 'origin',
        label: "Xuất xứ",
        value: product.country_term.name,
        filterUrl: `/filter?origin=${product.country_term.slug}`,
      });
      addedCodes.add('origin');
    }

    if (product.extra_attrs && Object.keys(product.extra_attrs).length > 0) {
      Object.entries(product.extra_attrs).forEach(([code, attr]) => {
        if (!addedCodes.has(code)) {
          attrs.push({
            iconName: attr.icon_name,
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
            groupCode: attrGroup.group_code,
            label: attrGroup.group_name || attrGroup.group_code,
            value: termNames,
            filterUrl: `/filter?${attrGroup.group_code}=${firstTerm.slug}`,
          });
          addedCodes.add(attrGroup.group_code);
        }
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 lg:items-start">
          {/* Left Column: Image Gallery (7/12 columns on large screens) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
            <div className="relative w-full overflow-hidden rounded-xl border border-[#e5ddd0] shadow-sm group">
              {discountPercentage > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-[hsl(0,84.2%,60.2%)] text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
              {/* Blur background layer */}
              <div 
                className="absolute inset-0 scale-110 blur-2xl opacity-30"
                style={{
                  backgroundImage: `url(${imageSources[selectedImage]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Main image container */}
              <div className="relative w-full min-h-[400px] lg:min-h-[500px] p-8 bg-white/80">
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
                      <AttributeIcon iconName={attr.iconName} groupCode={attr.groupCode} />
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Thông tin chi tiết
            </h2>
            <div className="w-16 h-1 bg-[#9B2C3B] rounded-full"></div>
            
            <div className="relative w-full">
              {processedDescription ? (
                <>
                  <div 
                    className={`text-slate-600 leading-relaxed text-left md:text-center space-y-4 overflow-hidden transition-all duration-500 ease-in-out text-base
                      ${!isDescExpanded ? 'max-h-[200px]' : 'max-h-[2000px]'}
                    `}
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                  />
                  
                  {!isDescExpanded && processedDescription.length > 300 && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                  )}

                  {processedDescription.length > 300 && (
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

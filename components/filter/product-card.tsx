"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag, MapPin, Sparkles, Hourglass, Droplets, Percent, Layers } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { Wine } from "@/data/filter/store";

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => numberFormatter.format(value);

const getDisplayPrice = (wine: Wine): string => {
  if (wine.showContactCta || typeof wine.price !== "number" || wine.price <= 0) {
    return "Liên hệ";
  }
  return formatCurrency(wine.price);
};

interface ProductCardProps {
  wine: Wine;
  viewMode: "grid" | "list";
  priority?: boolean;
}

interface AttributeItem {
  icon: React.ReactNode;
  iconUrl?: string | null;
  label: string;
  show: boolean;
  filterCode?: string | null;
  filterSlug?: string | null;
  typeSlug?: string | null;
}

// Fallback icons based on group code
const getFallbackIcon = (code?: string): React.ReactNode => {
  if (!code) return <Sparkles size={14} />;
  
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('huong') || lowerCode.includes('flavor')) {
    return <Sparkles size={14} />;
  } else if (lowerCode.includes('chat_lieu') || lowerCode.includes('material')) {
    return <Layers size={14} />;
  } else if (lowerCode.includes('xuat_xu') || lowerCode.includes('origin') || lowerCode.includes('country')) {
    return <MapPin size={14} />;
  } else if (lowerCode.includes('tuoi') || lowerCode.includes('age')) {
    return <Hourglass size={14} />;
  } else if (lowerCode.includes('dung_tich') || lowerCode.includes('volume') || lowerCode.includes('the_tich') || lowerCode.includes('ml')) {
    return <Droplets size={14} />;
  } else if (
    lowerCode.includes('nong_do') ||
    lowerCode.includes('alcohol') ||
    lowerCode.includes('abv') ||
    lowerCode.includes('phan_tram') ||
    lowerCode.includes('percent')
  ) {
    return <Percent size={14} />;
  }
  
  return <Tag size={14} />;
};

// Icon renderer component
const AttributeIcon = ({ url, fallbackIcon }: { url?: string | null; fallbackIcon: React.ReactNode }) => {
  if (url) {
    return (
      <Image 
        src={url} 
        alt="attribute" 
        width={14} 
        height={14}
        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
      />
    );
  }
  return <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">{fallbackIcon}</span>;
};

// Build filter URL for attribute
const buildFilterUrl = (attr: AttributeItem): string | null => {
  if (!attr.filterCode || !attr.filterSlug) return null;
  
  const params = new URLSearchParams();
  if (attr.typeSlug) {
    params.set("type", attr.typeSlug);
  }
  params.set(attr.filterCode, attr.filterSlug);
  
  return `/filter?${params.toString()}`;
};

// Clickable attribute label
const AttributeLabel = ({ attr }: { attr: AttributeItem }) => {
  const filterUrl = buildFilterUrl(attr);
  
  if (filterUrl) {
    return (
      <Link 
        href={filterUrl}
        className="truncate hover:text-[#9B2C3B] hover:underline transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {attr.label}
      </Link>
    );
  }
  
  return <span className="truncate">{attr.label}</span>;
};

export const FilterProductCard = React.memo(function FilterProductCard({ 
  wine, 
  viewMode, 
  priority = false 
}: ProductCardProps) {
  
  const discountPercentage = wine.originalPrice && wine.originalPrice > (wine.price ?? 0)
    ? Math.round(((wine.originalPrice - (wine.price ?? 0)) / wine.originalPrice) * 100)
    : 0;

  // Build attributes list with icons - combine API attributes + extra attrs
  const buildAttributes = (): AttributeItem[] => {
    const attrs: AttributeItem[] = [];

    // Brand only (hide product type on card per request)
    if (wine.brand) {
      attrs.push({ 
        icon: <Tag size={14} />, 
        label: wine.brand, 
        show: true,
        filterCode: "thuong_hieu",
        filterSlug: wine.brandSlug,
        typeSlug: wine.wineTypeSlug,
      });
    }

    // Origin/Country
    if (wine.country) {
      attrs.push({ 
        icon: <MapPin size={14} />, 
        label: wine.country, 
        show: true,
        filterCode: "xuat_xu",
        filterSlug: wine.countrySlug,
        typeSlug: wine.wineTypeSlug,
      });
    }

    // Attributes from API terms (catalog groups) - Use icon_url from API
    if (wine.attributes && wine.attributes.length > 0) {
      wine.attributes.forEach((attrGroup) => {
        attrGroup.terms.forEach((term) => {
          attrs.push({
            icon: getFallbackIcon(attrGroup.group_code),
            iconUrl: attrGroup.icon_url,
            label: term.name,
            show: true,
            filterCode: attrGroup.group_code,
            filterSlug: term.slug,
            typeSlug: wine.wineTypeSlug,
          });
        });
      });
    }

    // Extra attrs (nhập tay) - sử dụng icon_url từ API
    Object.entries(wine.extraAttrs ?? {}).forEach(([key, attr]) => {
      const fallbackIcon = getFallbackIcon(key);

      attrs.push({
        icon: fallbackIcon,
        iconUrl: attr.icon_url ?? wine.extraAttrIcons?.[key],
        label: `${attr.value}`,
        show: true,
      });
    });

    // Volume
    if (wine.volume && wine.volume > 0) {
      attrs.push({ 
        icon: <Droplets size={14} />, 
        label: `${wine.volume}ml`, 
        show: true 
      });
    }

    // Alcohol
    if (wine.alcoholContent && wine.alcoholContent > 0) {
      attrs.push({ 
        icon: <Percent size={14} />, 
        label: `${wine.alcoholContent}%`, 
        show: true 
      });
    }

    return attrs.filter(a => a.show);
  };

  const attributes = buildAttributes();

  // List View
  if (viewMode === "list") {
    return (
      <div className="group relative flex w-full overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-[#ECAA4D]/50">
        <Link 
          href={`/san-pham/${wine.slug}`}
          className="relative w-32 sm:w-48 shrink-0 overflow-hidden bg-stone-50"
        >
          {discountPercentage > 0 && (
            <span className="absolute top-2 left-0 z-10 bg-[#9e1e2d] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm rounded-r-sm">
              -{discountPercentage}%
            </span>
          )}
          <ProductImage
            src={wine.image || "/placeholder/wine-bottle.svg"}
            alt={wine.name}
            fill
            sizes="(max-width: 640px) 128px, 192px"
            className="h-full w-full object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-110"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-6">
          <div>
            <Link href={`/san-pham/${wine.slug}`}>
              <h3 className="font-serif text-base sm:text-xl font-bold text-[#9B2C3B] group-hover:text-[#9B2C3B] transition-colors line-clamp-2">
                {wine.name}
              </h3>
            </Link>
            
            <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-x-8 sm:gap-y-3">
              {attributes.slice(0, 6).map((attr, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-stone-600">
                  <span className="text-[#9B2C3B] shrink-0 flex items-center justify-center">
                    <AttributeIcon url={attr.iconUrl} fallbackIcon={attr.icon} />
                  </span>
                  <AttributeLabel attr={attr} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-3 sm:mt-6 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-serif text-lg sm:text-2xl font-bold text-[#9B2C3B]">
              {getDisplayPrice(wine)}
            </span>
            {wine.originalPrice && wine.originalPrice > (wine.price ?? 0) && (
              <span className="text-xs sm:text-sm font-medium text-stone-400 line-through decoration-stone-400 decoration-1">
                {formatCurrency(wine.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Vertical layout like the design
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50">
      
      {/* Image Area with Zoom Effect */}
      <Link 
        href={`/san-pham/${wine.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-white border-b border-stone-50"
      >
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-0 sm:top-4 z-10 bg-[#9e1e2d] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm rounded-r-md">
            -{discountPercentage}%
          </span>
        )}
        
        <ProductImage
          src={wine.image || "/placeholder/wine-bottle.svg"}
          alt={wine.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="h-full w-full object-contain p-4 sm:p-8 transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        
        {/* Title */}
        <Link href={`/san-pham/${wine.slug}`}>
          <h3 className="mb-2 sm:mb-3 font-serif text-sm sm:text-lg font-bold leading-tight text-[#9B2C3B] group-hover:text-[#9B2C3B] transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3.25rem]">
            {wine.name}
          </h3>
        </Link>

        {/* Dynamic Attributes List */}
        <div className="mb-2 sm:mb-4 flex flex-col gap-1 sm:gap-2">
          {attributes.slice(0, 4).map((attr, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-600">
              <span className="text-[#9B2C3B] shrink-0 w-4 sm:w-5 flex items-center justify-center">
                <AttributeIcon url={attr.iconUrl} fallbackIcon={attr.icon} />
              </span>
              <AttributeLabel attr={attr} />
            </div>
          ))}
        </div>

        {/* Price Section */}
        <div className="mt-auto flex flex-col pt-2 sm:pt-3 border-t border-stone-100">
          {wine.originalPrice && wine.originalPrice > (wine.price ?? 0) && (
            <span className="text-[10px] sm:text-xs font-medium text-stone-400 line-through decoration-stone-400 decoration-1 mb-0.5 sm:mb-1">
              {formatCurrency(wine.originalPrice)}
            </span>
          )}
          <span className="font-serif text-base sm:text-xl font-bold text-[#9B2C3B]">
            {getDisplayPrice(wine)}
          </span>
        </div>
      </div>
    </div>
  );
});

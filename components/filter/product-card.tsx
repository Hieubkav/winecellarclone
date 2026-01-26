"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag, MapPin, Sparkles, Hourglass, Droplets, Percent, Layers, Grape, Award, Thermometer, Coffee, Square, Package, Flag } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { Wine } from "@/data/filter/store";
import { getImageUrl } from "@/lib/utils/article-content";

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
  priority?: boolean;
}

interface AttributeItem {
  icon: React.ReactNode;
  iconUrl?: string | null;
  iconName?: string | null; // Lucide icon name
  label: string;
  show: boolean;
  filterCode?: string | null;
  filterSlug?: string | null;
  typeSlug?: string | null;
  groupName?: string; // Tên nhóm thuộc tính (VD: "Giống nho", "Hương vị")
}

// Map Lucide icon names to components
const LUCIDE_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Grape,
  Award,
  Thermometer,
  Percent,
  Coffee,
  Hourglass,
  Square,
  Package,
  Flag,
  MapPin,
  Tag,
  Sparkles,
  Layers,
  Droplets,
};

// Fallback icons based on group code
const getFallbackIcon = (code?: string): React.ReactNode => {
  if (!code) return <Sparkles size={12} />;

  const lowerCode = code.toLowerCase();

  if (lowerCode.includes('huong') || lowerCode.includes('flavor')) {
    return <Sparkles size={12} />;
  } else if (lowerCode.includes('chat_lieu') || lowerCode.includes('material')) {
    return <Layers size={12} />;
  } else if (lowerCode.includes('xuat_xu') || lowerCode.includes('origin') || lowerCode.includes('country')) {
    return <MapPin size={12} />;
  } else if (lowerCode.includes('tuoi') || lowerCode.includes('age')) {
    return <Hourglass size={12} />;
  } else if (lowerCode.includes('dung_tich') || lowerCode.includes('volume') || lowerCode.includes('the_tich') || lowerCode.includes('ml')) {
    return <Droplets size={12} />;
  } else if (
    lowerCode.includes('nong_do') ||
    lowerCode.includes('alcohol') ||
    lowerCode.includes('abv') ||
    lowerCode.includes('phan_tram') ||
    lowerCode.includes('percent')
  ) {
    return <Percent size={12} />;
  }

  return <Tag size={12} />;
};

// Icon renderer component
const AttributeIcon = ({ url, iconName, fallbackIcon }: { url?: string | null; iconName?: string | null; fallbackIcon: React.ReactNode }) => {
  // Ưu tiên: iconUrl (file image) > iconName (Lucide) > fallbackIcon
  if (url) {
    return (
      <Image
        src={getImageUrl(url)}
        alt="attribute"
        width={12}
        height={12}
        className="w-3.5 sm:w-4 h-3.5 sm:h-4 object-contain"
      />
    );
  }

  if (iconName && LUCIDE_ICONS[iconName]) {
    const IconComponent = LUCIDE_ICONS[iconName];
    return <IconComponent className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#9B2C3B]" size={12} />;
  }

  return <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex items-center justify-center text-[10px] sm:text-xs">{fallbackIcon}</span>;
};

// Attribute label - simplified without filter links for grouped items
const AttributeLabel = ({ attr }: { attr: AttributeItem }) => {
  return <span className="truncate">{attr.label}</span>;
};

export const FilterProductCard = React.memo(function FilterProductCard({
  wine,
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
        icon: <Tag size={12} />,
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
        icon: <MapPin size={12} />,
        label: wine.country,
        show: true,
        filterCode: "xuat_xu",
        filterSlug: wine.countrySlug,
        typeSlug: wine.wineTypeSlug,
      });
    }

    // Attributes from API terms (catalog groups) - GROUP BY group_code
    if (wine.attributes && wine.attributes.length > 0) {
      wine.attributes.forEach((attrGroup) => {
        // Nhóm tất cả terms lại thành 1 dòng
        const termNames = attrGroup.terms.map(t => t.name).join(", ");

        attrs.push({
          icon: getFallbackIcon(attrGroup.group_code),
          iconUrl: attrGroup.icon_url,
          iconName: attrGroup.icon_name,
          label: termNames,
          show: true,
          groupName: attrGroup.group_name || attrGroup.group_code,
        });
      });
    }

    // Extra attrs (nhập tay) - sử dụng icon_url từ API
    Object.entries(wine.extraAttrs ?? {}).forEach(([key, attr]) => {
      const fallbackIcon = getFallbackIcon(key);

      attrs.push({
        icon: fallbackIcon,
        iconUrl: attr.icon_name ?? wine.extraAttrIcons?.[key],
        label: `${attr.value}`,
        show: true,
      });
    });

    // Volume
    if (wine.volume && wine.volume > 0) {
      attrs.push({
        icon: <Droplets size={12} />,
        label: `${wine.volume}ml`,
        show: true
      });
    }

    // Alcohol
    if (wine.alcoholContent && wine.alcoholContent > 0) {
      attrs.push({
        icon: <Percent size={12} />,
        label: `${wine.alcoholContent}%`,
        show: true
      });
    }

    return attrs.filter(a => a.show);
  };

  const attributes = buildAttributes();

  // Grid View - Vertical layout like the design
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50">

      {/* Image Area */}
      <Link
        href={`/san-pham/${wine.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-white border-b border-stone-50"
      >
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-0 sm:top-3 z-10 bg-[#9e1e2d] px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-sm rounded-r-md">
            -{discountPercentage}%
          </span>
        )}

        <ProductImage
          src={wine.image || "/placeholder/wine-bottle.svg"}
          alt={wine.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="h-full w-full object-contain p-1"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-2 sm:p-3">

        {/* Title */}
        <Link href={`/san-pham/${wine.slug}`}>
          <h3 className="mb-1.5 sm:mb-2 font-serif text-sm sm:text-base font-bold leading-tight text-[#9B2C3B] group-hover:text-[#9B2C3B] transition-colors">
            {wine.name}
          </h3>
        </Link>

        {/* Dynamic Attributes List - Show ALL attributes with compact spacing */}
        <div className="mb-1.5 sm:mb-2 flex flex-col gap-0.5 sm:gap-1">
          {attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-600">
              <span className="text-[#9B2C3B] shrink-0 w-3.5 sm:w-4 flex items-center justify-center">
                <AttributeIcon url={attr.iconUrl} iconName={attr.iconName} fallbackIcon={attr.icon} />
              </span>
              <AttributeLabel attr={attr} />
            </div>
          ))}
        </div>

        {/* Price Section + CTA */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5 sm:pt-2 border-t border-stone-100">
          <div className="flex flex-col">
            {wine.originalPrice && wine.originalPrice > (wine.price ?? 0) && (
              <span className="text-[10px] sm:text-xs font-medium text-stone-400 line-through decoration-stone-400 decoration-1">
                {formatCurrency(wine.originalPrice)}
              </span>
            )}
            <span className="font-serif text-base sm:text-lg font-bold text-[#9B2C3B]">
              {getDisplayPrice(wine)}
            </span>
          </div>
          <Link
            href={`/san-pham/${wine.slug}`}
            className="shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white bg-[#9B2C3B] rounded hover:bg-[#7a232f] transition-colors"
          >
            Xem
          </Link>
        </div>
      </div>
    </div>
  );
});

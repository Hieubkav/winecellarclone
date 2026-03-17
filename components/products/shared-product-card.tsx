"use client";

import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ProductCardItem } from "@/lib/types/product-card";
import { ProductImage } from "@/components/ui/product-image";
import { ProductPortraitFrame } from "@/components/ui/product-portrait-frame";
import DynamicIcon from "@/components/shared/DynamicIcon";
import { getImageUrl } from "@/lib/utils/article-content";

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => numberFormatter.format(value);

const getDisplayPrice = (item: ProductCardItem): string => {
  if (item.showContactCta || typeof item.price !== "number" || item.price <= 0) {
    return "Liên hệ";
  }
  return formatCurrency(item.price);
};

interface ProductCardProps {
  item: ProductCardItem;
  priority?: boolean;
  className?: string;
}

interface AttributeItem {
  iconUrl?: string | null;
  iconName?: string | null;
  label: string;
  show: boolean;
  groupName?: string;
}

const AttributeIcon = ({ url, iconName }: { url?: string | null; iconName?: string | null }) => {
  return (
    <DynamicIcon
      iconUrl={url ? getImageUrl(url) : null}
      iconName={iconName}
      size={12}
      className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#9B2C3B]"
      imageClassName="w-3.5 sm:w-4 h-3.5 sm:h-4 object-contain"
    />
  );
};

const AttributeLabel = ({ attr }: { attr: AttributeItem }) => {
  return <span className="truncate">{attr.label}</span>;
};

export const SharedProductCard = React.memo(function SharedProductCard({
  item,
  priority = false,
  className,
}: ProductCardProps) {
  const discountPercentage = typeof item.discountPercent === "number"
    ? item.discountPercent
    : item.originalPrice && item.originalPrice > (item.price ?? 0)
      ? Math.round(((item.originalPrice - (item.price ?? 0)) / item.originalPrice) * 100)
      : 0;

  const buildAttributes = (): AttributeItem[] => {
    const attrs: AttributeItem[] = [];

    if (item.brand) {
      attrs.push({
        iconName: "Tag",
        label: item.brand,
        show: true,
      });
    }

    if (item.country) {
      attrs.push({
        iconName: "MapPin",
        label: item.country,
        show: true,
      });
    }

    if (item.attributes && item.attributes.length > 0) {
      item.attributes.forEach((attrGroup) => {
        const termNames = attrGroup.terms.map((term) => term.name).join(", ");

        attrs.push({
          iconUrl: attrGroup.icon_url,
          iconName: attrGroup.icon_name,
          label: termNames,
          show: true,
          groupName: attrGroup.group_name || attrGroup.group_code,
        });
      });
    }

    Object.entries(item.extraAttrs ?? {}).forEach(([, attr]) => {
      attrs.push({
        iconUrl: attr.icon_url,
        iconName: attr.icon_name,
        label: `${attr.value}`,
        show: true,
      });
    });

    if (item.volume && item.volume > 0) {
      attrs.push({
        iconName: "Droplets",
        label: `${item.volume}ml`,
        show: true,
      });
    }

    if (item.alcoholContent && item.alcoholContent > 0) {
      attrs.push({
        iconName: "Percent",
        label: `${item.alcoholContent}%`,
        show: true,
      });
    }

    return attrs.filter((attr) => attr.show);
  };

  const attributes = buildAttributes();
  const href = item.href ?? (item.slug ? `/san-pham/${item.slug}` : "#");

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50",
        className,
      )}
    >
      <Link href={href} className="block">
        <ProductPortraitFrame className="border-b border-stone-50">
          {discountPercentage > 0 && (
            <span className="absolute top-2 left-0 sm:top-3 z-10 bg-[#9e1e2d] px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-sm rounded-r-md">
              -{discountPercentage}%
            </span>
          )}

          <ProductImage
            src={item.image || "/placeholder/wine-bottle.svg"}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="h-full w-full object-contain p-1"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </ProductPortraitFrame>
      </Link>

      <div className="flex flex-1 flex-col p-2 sm:p-3">
        <Link href={href}>
          <h3 className="mb-1.5 sm:mb-2 font-serif text-sm sm:text-base font-bold leading-tight text-[#9B2C3B] group-hover:text-[#9B2C3B] transition-colors">
            {item.name}
          </h3>
        </Link>

        <div className="mb-1.5 sm:mb-2 flex flex-col gap-0.5 sm:gap-1">
          {attributes.map((attr, index) => (
            <div key={`${attr.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-600">
              <span className="text-[#9B2C3B] shrink-0 w-3.5 sm:w-4 flex items-center justify-center">
                <AttributeIcon url={attr.iconUrl} iconName={attr.iconName} />
              </span>
              <AttributeLabel attr={attr} />
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5 sm:pt-2 border-t border-stone-100">
          <div className="flex flex-col">
            {item.originalPrice && item.originalPrice > (item.price ?? 0) && (
              <span className="text-[10px] sm:text-xs font-medium text-stone-400 line-through decoration-stone-400 decoration-1">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
            <span className="font-serif text-base sm:text-lg font-bold text-[#9B2C3B]">
              {getDisplayPrice(item)}
            </span>
          </div>
          <Link
            href={href}
            className="shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white bg-[#9B2C3B] rounded hover:bg-[#7a232f] transition-colors"
          >
            Xem
          </Link>
        </div>
      </div>
    </div>
  );
});

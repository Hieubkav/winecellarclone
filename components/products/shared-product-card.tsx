"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/lib/utils";
import type { ProductCardItem } from "@/lib/types/product-card";
import { ProductImage } from "@/components/ui/product-image";
import { ProductPortraitFrame } from "@/components/ui/product-portrait-frame";
import DynamicIcon from "@/components/shared/DynamicIcon";
import { getImageUrl } from "@/lib/utils/image";
import { useWineStore } from "@/data/filter/store";

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
  filterUrl?: string;
  filterCode?: string;
  termSlugs?: string[];
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

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const buildTaxonomyUrl = (key: string, value: string) => {
  const params = new URLSearchParams();
  params.set(key, value);
  return `/filter?${params.toString()}`;
};

const isBrandGroup = (groupCode?: string, groupName?: string) => {
  const normalizedCode = normalizeText(groupCode);
  const normalizedName = normalizeText(groupName);
  return normalizedCode === "thuong_hieu" || normalizedCode === "brand" || normalizedName === "thuong hieu";
};

const isCountryGroup = (groupCode?: string, groupName?: string) => {
  const normalizedCode = normalizeText(groupCode);
  const normalizedName = normalizeText(groupName);
  return normalizedCode === "xuat_xu" || normalizedCode === "origin" || normalizedCode === "country" || normalizedName === "xuat xu";
};

const AttributeLabel = ({ attr }: { attr: AttributeItem }) => {
  return <span className="truncate">{attr.label}</span>;
};

export const SharedProductCard = React.memo(function SharedProductCard({
  item,
  priority = false,
  className,
}: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialized, applyAttributeFilterBySlug } = useWineStore(
    useShallow((state) => ({
      initialized: state.initialized,
      applyAttributeFilterBySlug: state.applyAttributeFilterBySlug,
    }))
  );

  const discountPercentage = typeof item.discountPercent === "number"
    ? item.discountPercent
    : item.originalPrice && item.originalPrice > (item.price ?? 0)
      ? Math.round(((item.originalPrice - (item.price ?? 0)) / item.originalPrice) * 100)
      : 0;

  const buildAttributes = (): AttributeItem[] => {
    const attrs: AttributeItem[] = [];
    const addedSemanticKeys = new Set<string>();

    if (item.brand) {
      attrs.push({
        iconName: "Tag",
        label: item.brand,
        show: true,
        groupName: "Thương hiệu",
        filterCode: "thuong_hieu",
        termSlugs: item.brandSlug ? [item.brandSlug] : [],
        filterUrl: item.brandSlug ? buildTaxonomyUrl("thuong_hieu", item.brandSlug) : undefined,
      });
      addedSemanticKeys.add("brand");
    }

    if (item.country) {
      attrs.push({
        iconName: "MapPin",
        label: item.country,
        show: true,
        groupName: "Xuất xứ",
        filterCode: "xuat_xu",
        termSlugs: item.countrySlug ? [item.countrySlug] : [],
        filterUrl: item.countrySlug ? buildTaxonomyUrl("xuat_xu", item.countrySlug) : undefined,
      });
      addedSemanticKeys.add("country");
    }

    if (item.attributes && item.attributes.length > 0) {
      item.attributes.forEach((attrGroup) => {
        if (attrGroup.terms.length === 0) {
          return;
        }

        const groupName = attrGroup.group_name || attrGroup.group_code;
        const isBrand = isBrandGroup(attrGroup.group_code, groupName);
        const isCountry = isCountryGroup(attrGroup.group_code, groupName);

        if ((isBrand && addedSemanticKeys.has("brand")) || (isCountry && addedSemanticKeys.has("country"))) {
          return;
        }

        const termNames = attrGroup.terms.map((term) => term.name).join(", ");
        const termSlugs = attrGroup.terms.map((term) => term.slug).filter(Boolean);
        const firstTermSlug = termSlugs[0];

        attrs.push({
          iconUrl: attrGroup.icon_url,
          iconName: attrGroup.icon_name,
          label: termNames,
          show: true,
          groupName,
          filterCode: attrGroup.group_code,
          termSlugs,
          filterUrl: firstTermSlug ? buildTaxonomyUrl(attrGroup.group_code, firstTermSlug) : undefined,
        });

        if (isBrand) {
          addedSemanticKeys.add("brand");
        }
        if (isCountry) {
          addedSemanticKeys.add("country");
        }
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

  const attributes = useMemo(() => buildAttributes(), [item]);
  const href = item.href ?? (item.slug ? `/san-pham/${item.slug}` : "#");

  const handleAttributeClick = useCallback(async (attr: AttributeItem) => {
    if (!attr.filterUrl) {
      return;
    }

    if (pathname === "/filter") {
      if (initialized && attr.filterCode && attr.termSlugs && attr.termSlugs.length > 0) {
        await applyAttributeFilterBySlug(attr.filterCode, attr.termSlugs);
      }
      return;
    }

    router.push(attr.filterUrl);
  }, [applyAttributeFilterBySlug, initialized, pathname, router]);

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
            unoptimized
          />
        </ProductPortraitFrame>
      </Link>

      <div className="flex flex-1 flex-col p-2 sm:p-3">
        <Link href={href}>
          <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold leading-tight text-[#9B2C3B] group-hover:text-[#9B2C3B] transition-colors">
            {item.name}
          </h3>
        </Link>

        <div className="mb-1.5 sm:mb-2 flex flex-col gap-0.5 sm:gap-1">
          {attributes.map((attr, index) => {
            const content = (
              <>
                <span className="text-[#9B2C3B] shrink-0 w-3.5 sm:w-4 flex items-center justify-center">
                  <AttributeIcon url={attr.iconUrl} iconName={attr.iconName} />
                </span>
                <AttributeLabel attr={attr} />
              </>
            );

            return attr.filterUrl ? (
              <button
                key={`${attr.label}-${index}`}
                type="button"
                onClick={() => {
                  void handleAttributeClick(attr);
                }}
                className="flex w-full items-center gap-1.5 sm:gap-2 text-left text-[11px] sm:text-xs text-stone-600 transition-colors hover:text-[#9B2C3B]"
              >
                {content}
              </button>
            ) : (
              <div key={`${attr.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-600">
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5 sm:pt-2 border-t border-stone-100">
          <div className="flex flex-col">
            {item.originalPrice && item.originalPrice > (item.price ?? 0) && (
              <span className="text-[10px] sm:text-xs font-medium text-stone-400 line-through decoration-stone-400 decoration-1">
                {formatCurrency(item.originalPrice)}
              </span>
            )}
            <span className="text-base sm:text-lg font-bold text-[#9B2C3B]">
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

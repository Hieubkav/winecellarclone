"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Grape,
  Wine as WineIcon,
  Globe,
  Percent,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductDetail } from "@/lib/api/products";

interface MetaItem {
  icon: React.ElementType;
  label: string;
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
    return "Li�n h?";
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

function MetaRow({ icon: Icon, label }: MetaItem) {
  if (!label) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-[#1C1C1C] font-medium">
      <Icon className="h-5 w-5 text-[#9B2C3B]" strokeWidth={2} />
      <span className="text-sm leading-snug">{label}</span>
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
      return `Gi?m ${product.discount_percent}%`;
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

  const metaItems: MetaItem[] = [
    { icon: Grape, label: grapeLabel },
    { icon: WineIcon, label: product.type?.name ?? product.category?.name ?? "" },
    { icon: Building2, label: product.brand_term?.name ?? "" },
    { icon: Globe, label: countryLabel },
    { icon: Percent, label: alcoholLabel },
  ];

  const [mainImageIndex, setMainImageIndex] = useState(0);

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

  const categoryLabel = product.category?.name ?? product.type?.name ?? "S?n ph?m";
  const description = product.description ?? "N?i dung s?n ph?m ?ang c?p nh?t.";
  const priceLabel = formatPrice(product);
  const originalPriceLabel = formatOriginalPrice(product);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8">
      <div className="flex items-start justify-between">
        <div className="grid gap-2">
          <div className="text-sm text-[#1C1C1C] font-medium">{categoryLabel}</div>
          <h1 className="text-[32px] md:text-[48px] font-bold leading-[1.2] tracking-[-0.5px] md:tracking-[-1px] text-[#1C1C1C] font-montserrat">
            {product.name}
          </h1>
        </div>
      </div>
      <Separator className="bg-gray-300" />
      <div className="grid items-start gap-6 md:gap-12 md:grid-cols-2">
        {/* Image Gallery Section */}
        <div className="grid gap-4 md:grid-cols-[120px_1fr]">
          {/* Thumbnail Images - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4">
            {imageSources.map((thumbnail, index) => (
              <button
                key={thumbnail + index}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                  index === mainImageIndex
                    ? "border-[#ECAA4D]"
                    : "border-gray-200 hover:border-[#1C1C1C]"
                } dark:hover:border-gray-50`}
                onClick={() => selectImage(index)}
              >
                <Image
                  src={thumbnail}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 160px, 240px"
                />
                <span className="sr-only">View Image {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Main Product Image and Mobile Thumbnails */}
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={imageSources[mainImageIndex]}
              alt={product.name}
              fill
              className="rounded-lg border object-contain object-center"
              sizes="(max-width: 768px) 100vw, 560px"
              priority
            />
            {badgeText && (
              <div className="absolute top-4 left-4 rounded-full bg-[#9B2C3B] px-3 py-1 text-xs font-medium text-white">
                {badgeText}
              </div>
            )}
            {imageSources.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-[#1C1C1C]"
                  onClick={goToPreviousImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-[#1C1C1C]"
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}

            {/* Mobile Thumbnail Images - Visible only on mobile */}
            {imageSources.length > 1 && (
              <div className="mt-4 flex flex-row gap-2 overflow-x-auto pb-2 md:hidden">
                {imageSources.map((thumbnail, index) => (
                  <button
                    key={thumbnail + index}
                    className={`relative flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                      index === mainImageIndex
                        ? "border-[#ECAA4D]"
                        : "border-gray-200 hover:border-[#1C1C1C]"
                    } dark:hover:border-gray-50`}
                    onClick={() => selectImage(index)}
                  >
                    <Image
                      src={thumbnail}
                      alt={`Product thumbnail ${index + 1}`}
                      fill
                      className="object-contain object-center"
                      sizes="64px"
                    />
                    <span className="sr-only">View Image {index + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1C] font-montserrat">{priceLabel}</span>
            {originalPriceLabel && (
              <span className="text-lg text-gray-500 line-through font-montserrat">
                {originalPriceLabel}
              </span>
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="pb-2">
                <h3 className="text-[13px] sm:text-[14px] font-light uppercase tracking-[2.8px] sm:tracking-[3.2px] text-[#1C1C1C]">
                  M� t?
                </h3>
              </div>
              <p className="text-[16px] sm:text-[18px] leading-[1.65] sm:leading-[1.70] text-[#1C1C1C] font-montserrat">
                {description}
              </p>
            </div>

            {/* Wine Information Section */}
            <div className="grid gap-3">
              <div className="pb-2">
                <h3 className="text-[13px] sm:text-[14px] font-light uppercase tracking-[2.8px] sm:tracking-[3.2px] text-[#1C1C1C]">
                  Th�ng tin ru?u
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metaItems.map((item, index) => (
                  <MetaRow key={`${item.label}-${index}`} {...item} />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button className="h-12 w-full text-lg bg-[#ECAA4D] text-white hover:bg-[#d9973a]">
                Li�n h?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

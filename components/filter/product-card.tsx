"use client";

import React from "react";
import { SharedProductCard } from "@/components/products/shared-product-card";
import type { ProductCardItem } from "@/lib/types/product-card";
import type { Wine } from "@/data/filter/store";

interface ProductCardProps {
  wine: Wine;
  priority?: boolean;
}

const mapWineToProductCardItem = (wine: Wine): ProductCardItem => {
  return {
    id: wine.id,
    name: wine.name,
    slug: wine.slug,
    image: wine.image,
    price: wine.price,
    originalPrice: wine.originalPrice,
    discountPercent: wine.discountPercent,
    showContactCta: wine.showContactCta,
    badges: wine.badges,
    brand: wine.brand,
    brandSlug: wine.brandSlug,
    country: wine.country,
    countrySlug: wine.countrySlug,
    wineTypeSlug: wine.wineTypeSlug,
    alcoholContent: wine.alcoholContent,
    volume: wine.volume,
    attributes: wine.attributes,
    extraAttrs: wine.extraAttrs,
  };
};

export const FilterProductCard = React.memo(function FilterProductCard({
  wine,
  priority = false
}: ProductCardProps) {
  return <SharedProductCard item={mapWineToProductCardItem(wine)} priority={priority} />;
});

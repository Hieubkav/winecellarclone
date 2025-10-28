"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Grape,
  LucideIcon,
  Percent,
  Globe,
  Wine as WineIcon
} from "lucide-react";
import type { Wine } from "@/data/filter/store";

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const getDisplayPrice = (wine: Wine): string => {
  if (wine.showContactCta || typeof wine.price !== "number" || wine.price <= 0) {
    return "Li�n h?";
  }

  return `${numberFormatter.format(wine.price)} VND`;
};

interface ProductCardProps {
  wine: Wine;
  viewMode: "grid" | "list";
}

interface MetaItem {
  icon: LucideIcon;
  label: string;
}

function MetaRow({ icon: Icon, label }: MetaItem) {
  if (!label) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-[#1C1C1C] font-medium">
      <Icon className="h-5 w-5 text-[#9B2C3B]" strokeWidth={2} />
      <span className="text-xs leading-snug">{label}</span>
    </div>
  );
}

export function FilterProductCard({ wine, viewMode }: ProductCardProps) {
  const metaItems: MetaItem[] = [
    { icon: Grape, label: wine.grapeVariety ?? "" },
    { icon: WineIcon, label: wine.wineType ?? "" },
    { icon: Building2, label: wine.producer || wine.brand || "" },
    { icon: Globe, label: wine.country ? `Vang ${wine.country}` : "" },
    {
      icon: Percent,
      label:
        typeof wine.alcoholContent === "number" ? `${wine.alcoholContent}% ABV` : "",
    },
  ];

  const layoutClass = 
    viewMode === "list" 
      ? "sm:flex-row sm:items-start" 
      : "sm:flex-row"; // Changed from sm:flex-col to sm:flex-row for desktop

  return (
    <Card className="border border-[#F1E5D5] bg-white text-[#1C1C1C] shadow-none transition hover:shadow-[0_12px_32px_rgba(28,28,28,0.08)] h-full flex flex-col rounded-lg">
      <CardContent className="flex flex-col gap-1 p-2 sm:p-3 flex-grow">
        <div className={`flex flex-col gap-1 ${layoutClass}`}>
          <div className="flex flex-col items-center gap-1 sm:min-w-[180px]">
            <div className="relative h-57 w-29 sm:h-68 sm:w-34">
              <Image
                src={wine.image || "/placeholder/wine-bottle.svg"}
                alt={wine.name}
                fill
                sizes="(max-width: 768px) 140px, 160px"
                className="object-contain"
                priority={false}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-0.5">
            {metaItems.map((item, idx) => (
              <MetaRow key={`${item.label}-${idx}`} {...item} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-0.5 pt-1 border-t border-[#F1E5D5] flex-grow">
          <h3 className="text-xs sm:text-sm font-bold tracking-tight font-[Montserrat] text-[#1C1C1C] text-center">
            {wine.name}
          </h3>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-center justify-between gap-0.5 w-full">
            <p className="text-sm sm:text-base font-semibold text-[#9B2C3B] text-center sm:text-left">
              {getDisplayPrice(wine)}
            </p>

            <Button className="w-full sm:w-auto rounded-none sm:rounded-full bg-[#ECAA4D] py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#d2923f] shadow-none border-0" asChild>
              <Link href={`/products/${wine.slug}`}>Xem ngay</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

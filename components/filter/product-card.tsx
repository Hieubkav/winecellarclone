"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
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
    priority?: boolean;
}

interface MetaItem {
    icon: LucideIcon;
    label: string;
}

function MetaRow({ icon: Icon, label }: MetaItem) {
    if (!label) return null;

    return (
        <div className="flex items-center gap-1 text-[13px] sm:text-[14px] text-[#1C1C1C] font-light uppercase tracking-[0.028em] sm:tracking-[0.032em]">
            <Icon className="h-4 w-4 text-[#9B2C3B]" strokeWidth={2} />
            <span className="leading-[150%]">{label}</span>
        </div>
    );
}

export const FilterProductCard = React.memo(function FilterProductCard({ wine, viewMode, priority = false }: ProductCardProps) {
    const metaItems: MetaItem[] = [
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
        <Card className="border border-[#F1E5D5] bg-white text-[#1C1C1C] shadow-none transition hover:shadow-[0_8px_24px_rgba(28,28,28,0.12)] h-full flex flex-col rounded-lg">
            <CardContent className="flex flex-col gap-2 p-2 sm:p-3 flex-grow">
                <div className={`flex flex-col gap-1 ${layoutClass}`}>
                    <div className="flex flex-col items-center gap-1 sm:min-w-[180px]">
                        <div className="relative h-57 w-29 sm:h-72 sm:w-36" style={{ aspectRatio: '29 / 57' }}>
                            <Image
                                src={wine.image || "/placeholder/wine-bottle.svg"}
                                alt={wine.name}
                                fill
                                sizes="(max-width: 768px) 100px, 120px"
                                className="object-contain"
                                priority={priority}
                                loading={priority ? "eager" : "lazy"}
                                quality={60}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                        {metaItems.map((item, idx) => (
                            <MetaRow key={`${item.label}-${idx}`} {...item} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 pt-1 border-t border-[#F1E5D5] flex-grow">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight font-[Montserrat] text-[#1C1C1C] text-center">
                        {wine.name}
                    </h3>

                    <div className="flex flex-col items-center sm:flex-row sm:items-center justify-between gap-1 w-full">
                        <p className="text-base sm:text-lg font-medium text-[#9B2C3B] text-center sm:text-left">
                            {getDisplayPrice(wine)}
                        </p>

                        <Button className="w-full sm:w-auto rounded-none sm:rounded-full bg-[#ECAA4D] py-0.5 text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#d2923f] shadow-none border-0" asChild>
                            <Link href={`/san-pham/${wine.slug}`}>Xem</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

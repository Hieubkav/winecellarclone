"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Wine } from "@/data/filter/store";

const numberFormatter = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

const getDisplayPrice = (wine: Wine): string => {
    if (wine.showContactCta || typeof wine.price !== "number" || wine.price <= 0) {
        return "Liên hệ";
    }

    return `${numberFormatter.format(wine.price)} VND`;
};

interface ProductCardProps {
    wine: Wine;
    viewMode: "grid" | "list";
    priority?: boolean;
}

interface MetaItem {
    label: string;
    value: string;
    iconUrl?: string | null;
}

function MetaRow({ label, value, iconUrl }: MetaItem) {
    if (!value) return null;

    return (
        <p className="text-xs sm:text-sm leading-relaxed text-[#1C1C1C]/85 whitespace-normal break-words flex items-center gap-1">
            {iconUrl ? (
                <Image src={iconUrl} alt={label} width={16} height={16} className="inline-block flex-shrink-0" />
            ) : (
                <span className="font-semibold text-[#1C1C1C]">{label}:</span>
            )}
            {' '}{value}
        </p>
    );
}

export const FilterProductCard = React.memo(function FilterProductCard({ wine, viewMode, priority = false }: ProductCardProps) {
    // Combine attributes (terms) + extra_attrs
    const metaItems: MetaItem[] = [];

    // Add attributes from terms (catalog groups)
    if (wine.attributes && wine.attributes.length > 0) {
        wine.attributes.forEach((attrGroup) => {
            attrGroup.terms.forEach((term) => {
                metaItems.push({
                    label: attrGroup.group_name,
                    value: term.name,
                    iconUrl: attrGroup.icon_url,
                });
            });
        });
    }

    // Add extra_attrs (nhập tay)
    Object.entries(wine.extraAttrs ?? {}).forEach(([, attr]) => {
        metaItems.push({
            label: attr.label,
            value: `${attr.value}`,
        });
    });

    // Filter empty values
    const filteredMetaItems = metaItems.filter(item => item.value);

    // Grid View Layout (Responsive: Dọc mobile với spacing rộng, Ngang desktop)
    if (viewMode === "grid") {
        return (
            <Card className="group border border-[#F1E5D5] bg-white text-[#1C1C1C] shadow-none transition-all hover:border-[#ECAA4D]/40 hover:shadow-[0_8px_24px_rgba(236,170,77,0.15)] h-full flex flex-col rounded-lg overflow-hidden">
                <CardContent className="flex flex-col sm:flex-row gap-5 p-5 sm:p-4 sm:gap-4 flex-grow">
                    {/* Image - Top on Mobile (Bigger), Left on Desktop */}
                    <Link 
                        href={`/san-pham/${wine.slug}`}
                        className="flex-shrink-0 mx-auto sm:mx-0"
                    >
                        <div className="relative h-56 w-28 sm:h-48 sm:w-24 transition-transform group-hover:scale-105">
                            <Image
                                src={wine.image || "/placeholder/wine-bottle.svg"}
                                alt={wine.name}
                                fill
                                sizes="(max-width: 640px) 112px, 96px"
                                className="object-contain"
                                priority={priority}
                                loading={priority ? "eager" : "lazy"}
                                quality={75}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                            />
                        </div>
                    </Link>

                    {/* Content - Below on Mobile, Right on Desktop */}
                    <div className="flex-1 flex flex-col gap-4 sm:gap-3 min-w-0">
                        {/* Product Name */}
                        <Link href={`/san-pham/${wine.slug}`}>
                            <h3 className="text-base sm:text-base font-bold tracking-tight text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors line-clamp-2 leading-snug text-center sm:text-left">
                                {wine.name}
                            </h3>
                        </Link>

                        {/* Meta Items - Single Column on Mobile, Grid 2 Columns on Desktop */}
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2 flex-1">
                            {filteredMetaItems.map((item, idx) => (
                                <MetaRow key={`${item.label}-${idx}`} {...item} />
                            ))}
                        </div>

                        {/* Price & Button - Stack on Mobile, Horizontal on Desktop */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-3 border-t border-[#F1E5D5] mt-auto">
                            <p className="text-xl sm:text-lg font-bold text-[#9B2C3B] text-center sm:text-left">
                                {getDisplayPrice(wine)}
                            </p>

                            <Button 
                                className="w-full sm:w-auto rounded-full bg-[#ECAA4D] px-6 py-2.5 sm:px-5 sm:py-2 text-sm sm:text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#d2923f] transition-colors shadow-none border-0" 
                                asChild
                            >
                                <Link href={`/san-pham/${wine.slug}`}>Xem chi tiết</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // List View Layout (horizontal - Simple & Clean)
    return (
        <Card className="group border border-[#F1E5D5] bg-white text-[#1C1C1C] shadow-none transition-all hover:border-[#ECAA4D]/40 hover:shadow-[0_8px_24px_rgba(236,170,77,0.15)] rounded-lg overflow-hidden">
            <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
                    {/* Image Section - Left */}
                    <Link 
                        href={`/san-pham/${wine.slug}`}
                        className="flex-shrink-0 flex items-center justify-center"
                    >
                        <div className="relative h-40 w-20 sm:h-44 sm:w-22 transition-transform group-hover:scale-105">
                            <Image
                                src={wine.image || "/placeholder/wine-bottle.svg"}
                                alt={wine.name}
                                fill
                                sizes="(max-width: 768px) 100px, 120px"
                                className="object-contain"
                                priority={priority}
                                loading={priority ? "eager" : "lazy"}
                                quality={75}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                            />
                        </div>
                    </Link>

                    {/* Main Content - Flex 1 */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                        {/* Title */}
                        <Link href={`/san-pham/${wine.slug}`}>
                            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1C1C1C] hover:text-[#ECAA4D] transition-colors line-clamp-2">
                                {wine.name}
                            </h3>
                        </Link>

                        {/* Meta Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                            {filteredMetaItems.map((item, idx) => (
                                <MetaRow key={`${item.label}-${idx}`} {...item} />
                            ))}
                        </div>

                        {/* Price & Action - Mobile only (shows below content on mobile) */}
                        <div className="flex sm:hidden items-center justify-between gap-3 pt-3 border-t border-[#F1E5D5]">
                            <p className="text-xl font-bold text-[#9B2C3B]">
                                {getDisplayPrice(wine)}
                            </p>
                            <Button 
                                className="rounded-md bg-[#ECAA4D] px-6 py-2 text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#d2923f] transition-colors shadow-none border-0" 
                                asChild
                            >
                                <Link href={`/san-pham/${wine.slug}`}>Xem chi tiết</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Price & Action - Desktop only (shows on right side on desktop) */}
                    <div className="hidden sm:flex flex-shrink-0 flex-col items-end justify-between gap-3 min-w-[140px]">
                        <p className="text-2xl font-bold text-[#9B2C3B] whitespace-nowrap">
                            {getDisplayPrice(wine)}
                        </p>
                        <Button 
                            className="w-full rounded-md bg-[#ECAA4D] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#d2923f] transition-colors shadow-none border-0" 
                            asChild
                        >
                            <Link href={`/san-pham/${wine.slug}`}>Xem chi tiết</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

import type { HomeShowcaseProduct } from "@/data/homeCollections";
import { ProductImage } from "@/components/ui/product-image";
import { BRAND_COLORS } from "@/lib/constants/colors";

type FavouriteProductsProps = {
  title: string;
  subtitle?: string;
  products: HomeShowcaseProduct[];
};

export default function FavouriteProducts({ title, subtitle, products }: FavouriteProductsProps) {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8 bg-white" aria-label="Sản phẩm yêu thích">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Heading */}
        <header className="mb-4 md:mb-5">
          <h2 className="text-lg font-bold text-[#1C1C1C] tracking-tight md:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </header>

        {/* Scroll row */}
        <div ref={emblaRef} className="-mx-3 md:-mx-1.5 overflow-hidden">
          <div className="flex gap-3 md:gap-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-[0_0_auto] w-[140px] sm:w-[150px] md:w-[170px]"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type ProductCardProps = {
  product: HomeShowcaseProduct;
  index: number;
};

function ProductCard({ product, index }: ProductCardProps) {
  return (
    <Link
      href={product.href}
      aria-label={`Xem sản phẩm ${product.name}`}
      className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100"
    >
      {/* Hình ảnh */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          priority={index < 6}
          sizes="(max-width: 640px) 140px, (max-width: 768px) 150px, 170px"
          className="object-cover"
        />
        {product.badge && (
          <span 
            className="absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white z-20"
            style={{ backgroundColor: BRAND_COLORS.wine }}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 flex-col p-2 text-[#1C1C1C]">
        <p className="mb-1 text-xs font-bold leading-tight line-clamp-2 h-8">
          {product.name}
        </p>

        <div className="mt-auto space-y-0.5">
          {product.price && (
            <p 
              className="text-xs font-bold"
              style={{ color: BRAND_COLORS.spirit }}
            >
              {product.price}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

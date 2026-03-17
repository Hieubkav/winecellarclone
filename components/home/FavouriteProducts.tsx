"use client";

import useEmblaCarousel from "embla-carousel-react";

import type { ProductCardItem } from "@/lib/types/product-card";
import { SharedProductCard } from "@/components/products/shared-product-card";

type FavouriteProductsProps = {
  title: string;
  subtitle?: string;
  products: ProductCardItem[];
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
  product: ProductCardItem;
  index: number;
};

function ProductCard({ product, index }: ProductCardProps) {
  return <SharedProductCard item={product} priority={index < 6} className="h-full" />;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { favouriteProducts } from "@/data/winecellar";

export default function FavouriteProducts() {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });

  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Heading */}
        <header className="mb-4 flex items-center justify-between md:mb-5">
          <h2 className="font-brand text-lg font-bold text-[#1C1C1C] tracking-tight md:text-xl">
            Sản phẩm nổi bật
          </h2>

          <Link
            href="/san-pham-yeu-thich"
            className="flex items-center gap-1 text-xs font-medium text-[#ECAA4D] font-body"
          >
            <span>
              Xem tất cả
            </span>
            <ArrowRight
              className="size-3.5"
              strokeWidth={2}
            />
          </Link>
        </header>

        {/* Scroll row */}
        <div ref={emblaRef} className="-mx-3 md:-mx-1.5 overflow-hidden">
          <div className="flex gap-3 md:gap-4">
            {favouriteProducts.map((product) => (
              <div
                key={product.href}
                className="flex-[0_0_auto] w-[140px] sm:w-[150px] md:w-[170px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type ProductCardProps = {
  product: {
    href: string;
    image: string;
    name: string;
    price?: string;
    originalPrice?: string;
    badge?: string;
  };
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={product.href}
      className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100"
    >
      {/* Hình ảnh */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 140px, (max-width: 768px) 150px, 170px"
          className="object-cover"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-[#9B2C3B] px-1.5 py-0.5 text-[9px] font-bold text-white font-brand">
            {product.badge}
          </span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 flex-col p-2 text-[#1C1C1C]">
        <p className="mb-1 font-brand text-xs font-bold leading-tight text-ellipsis overflow-hidden h-8">
          {product.name}
        </p>

        <div className="mt-auto space-y-0.5">
          {product.originalPrice && (
            <p className="text-[0.65rem] text-[#1C1C1C] opacity-60 line-through">
              {product.originalPrice}
            </p>
          )}
          {product.price && (
            <p className="font-brand text-xs font-bold text-[#ECAA4D]">
              {product.price}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

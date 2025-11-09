"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import Autoplay from "embla-carousel-autoplay"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

type BrandShowcaseProps = {
  title: string;
  brands: Array<{
    image: string;
    alt: string;
    href?: string | null;
  }>;
};

export default function BrandShowcase({ title, brands = [] }: BrandShowcaseProps) {
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [],
  )

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-1">
      <div className="mx-auto flex max-w-6xl flex-col gap-1">
        <header className="mb-1 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-[#1C1C1C] md:text-3xl">
            {title}
          </h2>
        </header>
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
          plugins={[autoplay]}
        >
          <CarouselContent className="ml-0 px-4">
            {brands.map((brand, index) => (
              <CarouselItem
                key={`${brand.image}-${index}`}
                className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Link
                  href={brand.href || "#"}
                  className="flex h-full items-center justify-center rounded-xl border border-transparent p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ECAA4D]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Image
                    src={brand.image}
                    alt={brand.alt}
                    width={180}
                    height={80}
                    className="w-auto object-contain transition-transform duration-300 hover:scale-105"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

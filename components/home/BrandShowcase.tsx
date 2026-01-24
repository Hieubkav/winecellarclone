"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { BRAND_COLORS, ANIMATION_TIMINGS } from "@/lib/constants/colors"

type BrandShowcaseProps = {
  title: string;
  brands: Array<{
    image: string;
    alt: string;
    href?: string | null;
  }>;
};

export default function BrandShowcase({ title, brands = [] }: BrandShowcaseProps) {
  const autoplay = useRef<AutoplayType>(
    Autoplay({
      delay: ANIMATION_TIMINGS.autoplayDelay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  if (brands.length === 0) {
    return null;
  }

  const hasMultipleBrands = brands.length > 1

  return (
    <section className="bg-white py-4" aria-label="Thương hiệu đối tác">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <header className="mb-2 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-[#1C1C1C] md:text-3xl">
            {title}
          </h2>
        </header>
        <Carousel
          opts={{
            align: "center",
            loop: hasMultipleBrands,
          }}
          className="w-full"
          plugins={hasMultipleBrands ? [autoplay.current] : []}
        >
          <CarouselContent className="ml-0 px-4">
            {brands.map((brand, index) => {
              const hasLink = brand.href && brand.href !== "#"
              const Component = hasLink ? Link : "div"
              const linkProps = hasLink ? { href: brand.href as string } : {}

              return (
                <CarouselItem
                  key={`${brand.image}-${index}`}
                  className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <Component
                    {...linkProps}
                    aria-label={brand.alt || `Logo thương hiệu ${index + 1}`}
                    className="flex h-full items-center justify-center rounded-xl border border-transparent p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ECAA4D]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <Image
                      src={brand.image}
                      alt={brand.alt}
                      width={180}
                      height={80}
                      priority={index < 5}
                      className="w-auto h-auto max-h-[80px] object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </Component>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

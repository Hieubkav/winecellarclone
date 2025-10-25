"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay"

import { ArrowLeft, ArrowRight } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { heroSlides } from "@/data/winecellar"
import { cn } from "@/lib/utils"

const AUTOPLAY_DELAY = 3000

export default function HeroCarousel() {
  if (heroSlides.length === 0) {
    return null
  }
  const hasMultipleSlides = heroSlides.length > 1
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const autoplay = useRef<AutoplayType>(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    handleSelect()
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)

    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  const handleDotClick = (index: number) => {
    api?.scrollTo(index)
    autoplay.current.reset()
  }

  const handleManualNavigation = (direction: "prev" | "next") => {
    if (!api) return

    if (direction === "prev") {
      api.scrollPrev()
    } else {
      api.scrollNext()
    }

    autoplay.current.reset()
  }

  return (
    <section className="relative w-full overflow-hidden bg-white py-2 text-[#1C1C1C] sm:py-8 lg:py-4">
      <div className="relative mx-auto w-full max-w-8xl px-2 sm:px-2 lg:px-2">
        <div className="relative overflow-hidden rounded ">
          <Carousel
            className="group mx-auto w-full bg-transparent text-[#1C1C1C]"
            opts={{ align: "center", loop: hasMultipleSlides }}
            plugins={hasMultipleSlides ? [autoplay.current] : []}
            setApi={setApi}
          >
            <CarouselContent className="ml-0">
              {heroSlides.map((slide, index) => (
                <CarouselItem
                  key={slide.image}
                  className="border-none bg-transparent p-0 pl-0 shadow-none"
                >
                  <div className="relative block">
                    <div className="relative block aspect-[1920/610] w-full overflow-hidden rounded-xl bg-[#9B2C3B]">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                      />
                    </div>
                    <span className="sr-only">{slide.alt}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {hasMultipleSlides && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 sm:px-4 lg:flex">
                <Button
                  type="button"
                  variant="ghost"
                  className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#1C1C1C]/15 bg-white text-[#1C1C1C] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all hover:border-[#ECAA4D] hover:bg-[#ECAA4D] hover:text-[#1C1C1C] focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-0 lg:h-14 lg:w-14"
                  onClick={() => handleManualNavigation("prev")}
                  aria-label="Xem slide truoc"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#1C1C1C]/15 bg-white text-[#1C1C1C] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all hover:border-[#ECAA4D] hover:bg-[#ECAA4D] hover:text-[#1C1C1C] focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-0 lg:h-14 lg:w-14"
                  onClick={() => handleManualNavigation("next")}
                  aria-label="Xem slide tiep theo"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </Carousel>

          {hasMultipleSlides && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    "h-3 w-3 rounded-full border border-[#1C1C1C]/20 bg-[#1C1C1C]/10 transition-all hover:bg-[#1C1C1C]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ECAA4D]",
                    current === index &&
                      "h-3.5 w-8 rounded-full border-[#ECAA4D] bg-[#ECAA4D] shadow-[0_0_12px_rgba(236,170,77,0.4)]"
                  )}
                  aria-label={`Chuyen toi slide ${index + 1}`}
                  aria-current={current === index}
                >
                  <span className="sr-only">{`Slide ${index + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay"

import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AUTOPLAY_DELAY = 3000
const WINE_COLOR = "#9B2C3B"

type HeroCarouselProps = {
  slides: Array<{
    image: string;
    alt: string;
    href?: string | null;
  }>;
};

export default function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  const hasSlides = slides.length > 0
  const hasMultipleSlides = slides.length > 1
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
    if (!hasSlides || !api) return

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
  }, [api, hasSlides])

  if (!hasSlides) {
    return null
  }

  const handleDotClick = (index: number) => {
    api?.scrollTo(index)
    autoplay.current?.reset()
  }

  const handleManualNavigation = (direction: "prev" | "next") => {
    if (!api) return

    if (direction === "prev") {
      api.scrollPrev()
    } else {
      api.scrollNext()
    }

    autoplay.current?.reset()
  }

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 text-[#1C1C1C]">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden">
          <Carousel
            className="group mx-auto w-full bg-transparent"
            opts={{ align: "center", loop: hasMultipleSlides }}
            plugins={hasMultipleSlides ? [autoplay.current] : []}
            setApi={setApi}
          >
            <CarouselContent className="ml-0">
              {slides.map((slide, index) => (
                <CarouselItem
                  key={`${slide.image}-${index}`}
                  className="border-none bg-transparent p-0 pl-0 shadow-none"
                >
                  <div className="relative block">
                    {/* Responsive aspect ratio - giống preview */}
                    <div className="relative block w-full overflow-hidden bg-slate-900 aspect-[16/9] sm:aspect-[16/9] lg:aspect-[21/9]">
                      {/* Blurred background layer */}
                      <div
                        className="absolute inset-0 scale-110"
                        style={{
                          backgroundImage: `url(${slide.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(30px)',
                        }}
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/20" />
                      {/* Main image - object-contain để hiển thị full ảnh */}
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="relative object-contain z-10"
                        priority={index === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                      />
                    </div>
                    <span className="sr-only">{slide.alt}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {hasMultipleSlides && (
              <>
                {/* Navigation buttons - style giống preview */}
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 sm:flex">
                  <Button
                    type="button"
                    variant="ghost"
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#1C1C1C] shadow-lg transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-0 border-2 border-transparent"
                    style={{ borderColor: `${WINE_COLOR}40` }}
                    onClick={() => handleManualNavigation("prev")}
                    aria-label="Xem slide trước"
                  >
                    <ChevronLeft className="h-4 w-4" style={{ color: WINE_COLOR }} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#1C1C1C] shadow-lg transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-0 border-2 border-transparent"
                    style={{ borderColor: `${WINE_COLOR}40` }}
                    onClick={() => handleManualNavigation("next")}
                    aria-label="Xem slide tiếp theo"
                  >
                    <ChevronRight className="h-4 w-4" style={{ color: WINE_COLOR }} />
                  </Button>
                </div>

                {/* Dots - style giống preview */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 z-20">
                  {slides.map((slide, index) => (
                    <button
                      key={`dot-${slide.image}-${index}`}
                      type="button"
                      onClick={() => handleDotClick(index)}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        current === index ? "w-6" : "bg-white/50"
                      )}
                      style={current === index ? { backgroundColor: WINE_COLOR } : {}}
                      aria-label={`Chuyển tới slide ${index + 1}`}
                      aria-current={current === index}
                    >
                      <span className="sr-only">{`Slide ${index + 1}`}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

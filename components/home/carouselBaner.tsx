"use client"

import { useEffect, useRef, useState } from "react"
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay"

import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { BRAND_COLORS, ANIMATION_TIMINGS } from "@/lib/constants/colors"

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
      delay: ANIMATION_TIMINGS.autoplayDelay,
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
    <section 
      className="relative w-full overflow-hidden bg-[#9B2C3B]"
      aria-label="Hero Carousel - Banner chính"
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden">
          {/* Carousel */}
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
                    {/* Container với aspect ratio */}
                    <div className="relative block w-full bg-slate-900 aspect-[16/9] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
                      {/* Blurred background - FULL SCREEN không bị giới hạn */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${slide.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(40px)',
                          transform: 'scale(1.2)', // Scale ra để không thấy edge
                        }}
                        aria-hidden="true"
                      />
                      {/* Dark overlay để làm mờ background */}
                      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
                      {/* Main image - object-contain ở giữa */}
                      <img
                        src={slide.image}
                        alt={slide.alt || `Banner ${index + 1}`}
                        className="relative w-full h-full object-contain z-10"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "low"}
                      />
                    </div>
                    <span className="sr-only">{slide.alt}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation controls - NGOÀI carousel để không bị che */}
          {hasMultipleSlides && (
            <>
              {/* Prev/Next buttons */}
              <button
                type="button"
                onClick={() => handleManualNavigation("prev")}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20 border-2 border-transparent hover:scale-105"
                style={{ borderColor: `${BRAND_COLORS.wine}40` }}
                aria-label="Xem slide trước"
              >
                <ChevronLeft size={14} style={{ color: BRAND_COLORS.wine }} />
              </button>
              <button
                type="button"
                onClick={() => handleManualNavigation("next")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20 border-2 border-transparent hover:scale-105"
                style={{ borderColor: `${BRAND_COLORS.wine}40` }}
                aria-label="Xem slide tiếp theo"
              >
                <ChevronRight size={14} style={{ color: BRAND_COLORS.wine }} />
              </button>

              {/* Dots indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" role="tablist" aria-label="Carousel navigation">
                {slides.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => handleDotClick(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      current === index ? "w-6" : "bg-white/50"
                    )}
                    style={current === index ? { backgroundColor: BRAND_COLORS.wine } : {}}
                    aria-label={`Chuyển tới slide ${index + 1}`}
                    aria-current={current === index}
                    role="tab"
                  >
                    <span className="sr-only">{`Slide ${index + 1}`}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { Montserrat } from "next/font/google"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const BRAND_COLORS = {
  base: "#1C1C1C",
  accent: "#ECAA4D",
  highlight: "#9B2C3B",
} as const

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  slideCount: number
  isLoop: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const axis = orientation === "horizontal" ? "x" : "y"
  const mergedOptions = React.useMemo(() => {
    const baseOptions: CarouselOptions = { ...(opts ?? {}), axis }
    if (baseOptions.loop === undefined) {
      baseOptions.loop = true
    }
    return baseOptions
  }, [axis, opts])
  const loopOption = mergedOptions.loop

  const [carouselRef, api] = useEmblaCarousel(mergedOptions, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [slideCount, setSlideCount] = React.useState(0)
  const isLooping = React.useMemo(() => {
    if (typeof loopOption === "object") {
      return Object.values(loopOption).some(Boolean)
    }
    return Boolean(loopOption)
  }, [loopOption])

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setSlideCount(api.scrollSnapList().length)
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    setSlideCount(api.scrollSnapList().length)
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        slideCount,
        isLoop: isLooping,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn(
          montserrat.className,
          "relative isolate text-white",
          className,
        )}
        style={{ backgroundColor: BRAND_COLORS.base }}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex gap-6 pb-8",
          orientation === "horizontal" ? "-ml-6" : "-mt-6 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full rounded-xl border border-white/10 bg-black/20 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[#ECAA4D]/50",
        orientation === "horizontal" ? "pl-6" : "pt-6",
        className,
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev, slideCount, isLoop } = useCarousel()

  if (slideCount <= 1) {
    return null
  }

  const isDisabled = (!isLoop && !canScrollPrev) || slideCount <= 1

  return (
    <Button
      data-slot="carousel-previous"
      variant="ghost"
      size="icon"
      className={cn(
        "absolute z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[#ECAA4D] hover:text-[#ECAA4D] hover:bg-black/55 disabled:pointer-events-none disabled:opacity-30",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2 md:left-4"
          : "left-1/2 top-4 -translate-x-1/2 rotate-90",
        "hidden sm:flex",
        className,
      )}
      disabled={isDisabled}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext, slideCount, isLoop } = useCarousel()

  if (slideCount <= 1) {
    return null
  }

  const isDisabled = (!isLoop && !canScrollNext) || slideCount <= 1

  return (
    <Button
      data-slot="carousel-next"
      variant="ghost"
      size="icon"
      className={cn(
        "absolute z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[#ECAA4D] hover:text-[#ECAA4D] hover:bg-black/55 disabled:pointer-events-none disabled:opacity-30",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2 md:right-4"
          : "bottom-4 left-1/2 -translate-x-1/2 rotate-90",
        "hidden sm:flex",
        className,
      )}
      disabled={isDisabled}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}

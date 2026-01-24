import Image from "next/image"
import Link from "next/link"
import { BRAND_COLORS } from "@/lib/constants/colors"

type DualBannerProps = {
  banners: Array<{
    image: string;
    alt: string;
    href?: string | null;
  }>;
};

export default function DualBanner({ banners = [] }: DualBannerProps) {
  if (banners.length === 0) {
    return null
  }

  return (
    <section 
      className="relative bg-white pb-2 pt-0 sm:pb-2 lg:py-4"
      aria-label="Dual Banner - Khuyến mãi đặc biệt"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9B2C3B]/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-2">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          {banners.slice(0, 2).map((banner, index) => {
            const hasLink = banner.href && banner.href !== "#"
            const Component = hasLink ? Link : "div"
            const linkProps = hasLink ? { 
              href: banner.href as string,
              prefetch: false as const
            } : {}

            return (
              <Component
                key={`${banner.image}-${index}`}
                {...linkProps}
                aria-label={banner.alt || `Banner khuyến mãi ${index + 1}`}
                className="group relative block rounded-lg border border-[#ececec] bg-white/95 p-1 shadow-[0_24px_50px_rgba(28,28,28,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B2C3B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="relative overflow-hidden rounded-md">
                  <div className="relative aspect-[1000/407] w-full">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </Component>
            )
          })}
        </div>
      </div>
    </section>
  )
}

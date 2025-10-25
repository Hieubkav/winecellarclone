import Image from "next/image"
import Link from "next/link"

import { dualBanners } from "@/data/winecellar"

export default function DualBanner() {
  if (dualBanners.length === 0) {
    return null
  }

  return (
    <section className="relative bg-white pb-1 pt-0 sm:pb-1 lg:py-3">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9B2C3B]/40 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-2">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          {dualBanners.map((banner, index) => (
            <Link
              key={banner.image}
              href={banner.href}
              aria-label={banner.alt}
              prefetch={false}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

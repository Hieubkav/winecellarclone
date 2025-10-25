import Image from "next/image"
import Link from "next/link"

import { dualBanners } from "@/data/winecellar"

export default function DualBanner() {
  if (dualBanners.length === 0) {
    return null
  }

  return (
    <section className="relative -mt-12 bg-white py-2 sm:py-4 md:-mt-18 lg:py-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9B2C3B]/40 to-transparent" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5">
          {dualBanners.map((banner, index) => (
            <Link
              key={banner.image}
              href={banner.href}
              aria-label={banner.alt}
              prefetch={false}
              className="group relative isolate block overflow-hidden rounded-3xl border border-[#f1f1f1] bg-white shadow-[0_16px_36px_rgba(28,28,28,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B2C3B]/50"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                width={1000}
                height={407}
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 50vw"
                className="h-auto w-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

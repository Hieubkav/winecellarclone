import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { dualBanners } from "@/data/winecellar"

const CTA_LABEL = "Kham pha"

export default function DualBanner() {
  if (dualBanners.length === 0) {
    return null
  }

  return (
    <section className="relative -mt-14 bg-[#1C1C1C] py-12 sm:py-16 md:-mt-20 lg:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9B2C3B]/40 to-transparent" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {dualBanners.map((banner, index) => (
            <Link
              key={banner.image}
              href={banner.href}
              aria-label={banner.alt}
              prefetch={false}
              className="group relative isolate flex min-h-[220px] overflow-hidden rounded-3xl border border-white/5 bg-[#141414]/90 shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B2C3B]/60"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 540px, (min-width: 640px) 80vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/92 via-[#1C1C1C]/35 to-transparent" />
              <div className="relative flex w-full flex-col justify-end gap-4 p-6 sm:p-8">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#ECAA4D]">
                  Thien Kim Wine
                </span>
                <h3 className="text-xl font-bold text-white sm:text-2xl">{banner.alt}</h3>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="pointer-events-none w-fit rounded-full border border-[#ECAA4D]/50 bg-[#9B2C3B] px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-white shadow-[0_10px_30px_rgba(155,44,59,0.35)] transition group-hover:border-[#ECAA4D]"
                >
                  <span>{CTA_LABEL}</span>
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

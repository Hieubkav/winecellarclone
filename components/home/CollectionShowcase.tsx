"use client"

import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ArrowUpRight } from "lucide-react"

import type { HomeShowcaseProduct } from "@/data/homeCollections"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

type CollectionShowcaseProps = {
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref: string
  products: HomeShowcaseProduct[]
  tone?: "wine" | "spirit"
}

export default function CollectionShowcase({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  products,
  tone = "wine",
}: CollectionShowcaseProps) {
  const accent = tone === "spirit" ? "#ECAA4D" : "#9B2C3B"
  const contextLabel = subtitle ?? title
  const resolvedCtaLabel = ctaLabel ?? "Xem thêm"

  return (
    <section className="bg-white py-6" aria-label={contextLabel}>
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <Card className="border-[#f1f1f1] bg-white/95">
          <CardHeader className="flex flex-row items-end justify-between pb-6">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle
                className={cn(
                  montserrat.className,
                  "text-xl font-bold uppercase tracking-[0.18em] text-[#1C1C1C] sm:text-2xl",
                )}
              >
                {title}
              </CardTitle>
              {description && (
                <p className="max-w-2xl text-sm text-[#1C1C1C]/70 hidden sm:block">{description}</p>
              )}
            </div>
            <Button
              asChild
              aria-label={resolvedCtaLabel}
              className="group h-10 rounded-full border border-[#ECAA4D] bg-white px-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] transition-colors hover:bg-[#ECAA4D] hover:text-[#1C1C1C] ml-4"
            >
              <Link href={ctaHref}>
                <span className="flex items-center gap-1.5">
                  {resolvedCtaLabel}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductTile key={product.id} product={product} accent={accent} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type ProductTileProps = {
  product: HomeShowcaseProduct
  accent: string
}

function ProductTile({ product, accent }: ProductTileProps) {
  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col rounded-2xl border border-[#eeeeee] bg-white p-2.5 shadow-[0_14px_30px_rgba(28,28,28,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(28,28,28,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/70 bg-[#fafafa]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (min-width: 1024px) 20vw, 25vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent }}
          >
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1">
        <p
          className={cn(
            montserrat.className,
            "text-sm font-semibold text-[#1C1C1C] transition group-hover:text-[#9B2C3B]",
          )}
        >
          {product.name}
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#1C1C1C]/55">
          {product.country} - {product.style}
        </p>
        <p
          className={cn(
            montserrat.className,
            "mt-auto text-base font-bold text-[#ECAA4D]",
          )}
        >
          {product.price}
        </p>
      </div>
    </Link>
  )
}

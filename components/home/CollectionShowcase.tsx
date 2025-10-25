"use client"

import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ArrowUpRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import type { HomeShowcaseProduct } from "@/data/homeCollections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

type CollectionShowcaseProps = {
  title: string
  subtitle: string
  description: string
  ctaLabel: string
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

  return (
    <section className="bg-white py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <Card className="border-[#f1f1f1] shadow-[0_30px_60px_rgba(28,28,28,0.08)]">
          <CardHeader className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between md:pb-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f1f1f1] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#1C1C1C]/70">
                <Sparkles className="h-4 w-4 text-[#ECAA4D]" strokeWidth={1.75} />
                {subtitle}
              </div>
              <div>
                <CardTitle
                  className={cn(
                    montserrat.className,
                    "text-2xl font-bold uppercase tracking-wide text-[#1C1C1C]",
                  )}
                >
                  {title}
                </CardTitle>
                <p className="mt-1 text-sm text-[#1C1C1C]/70">{description}</p>
              </div>
            </div>
            <Button
              asChild
              className="group h-11 rounded-full border-2 border-[#ECAA4D] bg-transparent px-6 text-sm font-semibold uppercase tracking-wide text-[#1C1C1C] hover:bg-[#ECAA4D] hover:text-[#1C1C1C]"
            >
              <Link href={ctaHref}>
                <span className="flex items-center gap-2">
                  {ctaLabel}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      className="group flex h-full flex-col rounded-2xl border border-[#eeeeee] bg-white p-3 shadow-[0_16px_30px_rgba(28,28,28,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_45px_rgba(28,28,28,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/60 bg-[#fafafa]">
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
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p
          className={cn(
            montserrat.className,
            "text-sm font-semibold text-[#1C1C1C] transition group-hover:text-[#9B2C3B]",
          )}
        >
          {product.name}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-[#1C1C1C]/60">
          {product.country} · {product.style}
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

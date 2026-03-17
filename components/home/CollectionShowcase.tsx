"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductCardItem } from "@/lib/types/product-card"
import { SharedProductCard } from "@/components/products/shared-product-card"

type CollectionShowcaseProps = {
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref: string
  products: ProductCardItem[]
  tone?: "wine" | "spirit"
}

export default function CollectionShowcase({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  products,
}: CollectionShowcaseProps) {
  const contextLabel = subtitle ?? title
  const resolvedCtaLabel = ctaLabel ?? "Xem thêm"

  if (products.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-6" aria-label={`Bộ sưu tập - ${contextLabel}`}>
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <Card className="border-[#f1f1f1] bg-white/95">
          <CardHeader className="flex flex-row items-end justify-between pb-6">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle
                className="text-xl font-bold uppercase tracking-[0.18em] text-[#1C1C1C] sm:text-2xl"
              >
                {title}
              </CardTitle>
              {description && (
                <p className="max-w-2xl text-sm text-[#1C1C1C]/70 hidden sm:block">{description}</p>
              )}
            </div>
            <Button
              asChild
              aria-label={`${resolvedCtaLabel} - Xem tất cả sản phẩm`}
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
              {products.slice(0, 8).map((product, index) => (
                <ProductTile key={product.id} product={product} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type ProductTileProps = {
  product: ProductCardItem
  index: number
}

function ProductTile({ product, index }: ProductTileProps) {
  return <SharedProductCard item={product} priority={index < 4} className="h-full" />
}

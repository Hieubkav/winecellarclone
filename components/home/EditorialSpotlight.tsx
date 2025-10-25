"use client"

import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ArrowRight } from "lucide-react"

import type { HomeEditorial } from "@/data/homeCollections"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

type EditorialSpotlightProps = {
  label?: string
  title: string
  description?: string
  articles: HomeEditorial[]
}

export default function EditorialSpotlight({ title, articles }: EditorialSpotlightProps) {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
          <header className="mb-10 text-center">
            <h2
              className={cn(
                montserrat.className,
                "text-2xl font-bold uppercase tracking-[0.18em] text-[#1C1C1C] md:text-[32px]",
              )}
            >
              {title}
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#ECAA4D]" />
          </header>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

type ArticleCardProps = {
  article: HomeEditorial
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-[#efefef] bg-white/95 p-0 shadow-none transition hover:-translate-y-1 hover:border-[#ECAA4D]/60 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#ECAA4D]">
      <div className="relative aspect-video w-full overflow-hidden bg-[#FAFAFA]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={article.href}
          className="group/title block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <h3
            className={cn(
              montserrat.className,
              "text-lg font-semibold text-[#1C1C1C] transition-colors group-hover:text-[#9B2C3B]",
            )}
          >
            {article.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between border-t border-[#f5f5f5] pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2C3B]">Thien Kim Wine</span>
          <Link
            href={article.href}
            className="flex items-center gap-1 text-xs font-semibold text-[#ECAA4D] transition-colors hover:text-[#1C1C1C]"
          >
            <span>Kham pha</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

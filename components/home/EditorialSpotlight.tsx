"use client"

import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ArrowRight, PenTool } from "lucide-react"

import type { HomeEditorial } from "@/data/homeCollections"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

type EditorialSpotlightProps = {
  label: string
  title: string
  description: string
  articles: HomeEditorial[]
}

export default function EditorialSpotlight({ label, title, description, articles }: EditorialSpotlightProps) {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <div className="bg-white p-6 md:p-8">
          <header className="mb-10 space-y-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f9f9f9] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[#1C1C1C]/90">
              <PenTool className="h-3.5 w-3.5 text-[#9B2C3B]" strokeWidth={2.5} />
              {label}
            </div>
            <h2
              className={cn(
                montserrat.className,
                "text-2xl font-bold uppercase tracking-wide text-[#1C1C1C] md:text-3xl",
              )}
            >
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[#1C1C1C]/70">{description}</p>
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
    <Card className="group flex h-full flex-col overflow-hidden border border-[#f1f1f1] bg-white p-0 transition hover:-translate-y-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#ECAA4D]">
      <div className="relative aspect-video w-full overflow-hidden bg-[#FAFAFA]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#1C1C1C]/60">
          <span className="font-medium">{article.category}</span>
          <span className="flex items-center gap-1 font-medium">
            <span>{article.readingTime}</span>
          </span>
        </div>
        <Link
          href={article.href}
          className="group/title block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <h3
            className={cn(
              montserrat.className,
              "text-base font-semibold text-[#1C1C1C] transition-colors group-hover:text-[#9B2C3B]",
            )}
          >
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-[#1C1C1C]/80 line-clamp-2">{article.summary}</p>
        <div className="pt-3 flex items-center justify-between border-t border-[#f5f5f5]">
          <span className="text-xs uppercase tracking-[0.18em] font-medium text-[#1C1C1C]/60">{article.publishDate}</span>
          <Link 
            href={article.href}
            className="flex items-center gap-1 text-xs font-semibold text-[#1C1C1C] hover:text-[#ECAA4D]"
          >
            <span>Đọc tiếp</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

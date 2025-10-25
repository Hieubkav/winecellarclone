import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"

import { BRAND_COLORS } from "@/components/layouts/header.data"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { spotlightCategories } from "@/data/winecellar"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function CategoryGrid() {
  const { highlight } = BRAND_COLORS

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-2 py-1 sm:px-1 lg:px-2">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-6">
          {spotlightCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <Card className="rounded-lg overflow-hidden border-[#f3f3f3] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ECAA4D]/45 hover:shadow-[0_20px_40px_rgba(28,28,28,0.08)]">
                <CardHeader className="relative p-0">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 50vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent transition group-hover:from-black/45 group-hover:via-black/12" />
                    <CardTitle
                      className={`${montserrat.className} absolute inset-x-1 bottom-1 flex items-center justify-center rounded-md bg-black/35 px-1.5 py-0.5 text-center text-[0.44rem] font-extrabold uppercase tracking-[0.22em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:inset-x-1.5 sm:px-1.5 sm:py-0.5 sm:text-[0.54rem] lg:inset-x-2 lg:bottom-1.5 lg:px-2 lg:py-0.5 lg:text-[0.6rem]`}
                      style={{ border: `1px solid ${highlight}26` }}
                    >
                      {category.name}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

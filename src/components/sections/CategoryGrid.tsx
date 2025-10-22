import Image from "next/image";
import Link from "next/link";

import { spotlightCategories } from "@/data/winecellar";

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {spotlightCategories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-center py-5 text-lg font-semibold uppercase tracking-wide text-zinc-700">
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

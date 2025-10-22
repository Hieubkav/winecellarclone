import Image from "next/image";
import Link from "next/link";

import { featuredBrands } from "@/data/winecellar";

export default function BrandShowcase() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="text-center">
          <h2 className="text-3xl font-semibold uppercase tracking-wide text-[#990d23]">Thương hiệu nổi bật</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {featuredBrands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Image src={brand.image} alt={brand.name} width={140} height={80} className="h-20 w-auto object-contain" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

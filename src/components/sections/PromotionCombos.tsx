import Image from "next/image";
import Link from "next/link";

import { partyPromotions } from "@/data/winecellar";

export default function PromotionCombos() {
  return (
    <section className="bg-[#f9f5f0] py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-wider text-[#990d23]">
            Tận hưởng tiệc tùng sống động – tiết kiệm hơn
          </h2>
        </header>
        <div className="grid gap-6 lg:grid-cols-3">
          {partyPromotions.map((item) => (
            <Link
              key={item.image}
              href={item.href}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 360px, 100vw"
                />
              </div>
              <div className="flex flex-1 items-center justify-center px-6 py-6 text-center text-lg font-semibold text-zinc-700">
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

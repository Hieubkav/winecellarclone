import Image from "next/image";
import Link from "next/link";

import { dualBanners } from "@/data/winecellar";

export default function DualBanner() {
  return (
    <section className="-mt-14 md:-mt-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {dualBanners.map((banner) => (
            <Link
              key={banner.image}
              href={banner.href}
              className="group overflow-hidden rounded-3xl shadow-lg transition hover:shadow-xl"
            >
              <div className="relative aspect-[1000/407] w-full">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="(min-width: 768px) 480px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

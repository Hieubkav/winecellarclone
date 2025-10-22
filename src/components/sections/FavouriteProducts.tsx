import Image from "next/image";
import Link from "next/link";

import { favouriteProducts } from "@/data/winecellar";

export default function FavouriteProducts() {
  return (
    <section className="py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="text-center">
          <h2 className="text-3xl font-semibold uppercase tracking-wide text-zinc-800">
            Khách hàng chúng tôi yêu thích
          </h2>
        </header>
        <div className="overflow-x-auto">
          <div className="flex gap-6">
            {favouriteProducts.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                className="group flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <span className="absolute left-3 top-3 rounded-full bg-[#b4975a] px-3 py-1 text-xs font-semibold text-white">
                      {product.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-4 px-4 py-5 text-sm text-zinc-600">
                  <h3 className="text-base font-semibold text-zinc-800">{product.name}</h3>
                  <div className="mt-auto space-y-1">
                    {product.originalPrice ? (
                      <p className="text-xs text-zinc-400 line-through">{product.originalPrice}</p>
                    ) : null}
                    {product.price ? <p className="text-lg font-semibold text-[#990d23]">{product.price}</p> : null}
                  </div>
                </div>
                <div className="border-t border-zinc-100 px-4 py-3 text-center text-sm font-medium text-[#990d23] transition group-hover:bg-[#990d23] group-hover:text-white">
                  Xem chi tiết
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

import { storeSystem } from "@/data/winecellar";

export default function StoreSystem() {
  return (
    <section className="bg-[#f7f7f7] py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header className="text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-wide text-zinc-800">
            Hệ thống cửa hàng WINECELLAR.vn toàn quốc
          </h2>
        </header>
        <div className="grid gap-8 lg:grid-cols-3">
          {storeSystem.map((city) => (
            <div key={city.city} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#990d23]">{city.city}</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-600">
                {city.stores.map((store) => (
                  <li key={`${city.city}-${store.phone}`}>
                    <p>{store.address}</p>
                    <Link href={`tel:${store.phone.replace(/\s+/g, "")}`} className="font-semibold text-[#990d23]">
                      {store.phone}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

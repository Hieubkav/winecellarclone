import Image from "next/image";
import Link from "next/link";

import { upcomingEvents } from "@/data/winecellar";

export default function EventList() {
  return (
    <section className="bg-gradient-to-r from-[#990d23] via-[#7a0a1c] to-[#990d23] py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header className="text-center">
          <h2 className="text-3xl font-semibold uppercase tracking-wide">Sự kiện</h2>
        </header>
        <div className="grid gap-6 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Link
              key={event.href}
              href={event.href}
              className="group overflow-hidden rounded-3xl bg-white text-zinc-800 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[764/400] w-full">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-4 px-6 py-6">
                <h3 className="text-lg font-semibold text-zinc-900">{event.title}</h3>
                <div className="h-px bg-zinc-200" />
                <dl className="space-y-1 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-zinc-800">Ngày:</dt>
                    <dd>{event.date}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-zinc-800">Thời gian:</dt>
                    <dd>{event.time}</dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <dt className="font-medium text-zinc-800">Địa điểm:</dt>
                    <dd>{event.location}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="https://winecellar.vn/su-kien/"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#990d23] transition hover:bg-zinc-100"
          >
            Xem tất cả sự kiện
          </Link>
        </div>
      </div>
    </section>
  );
}

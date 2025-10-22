"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { heroSlides } from "@/data/winecellar";

const INTERVAL = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-black/5 shadow-lg">
        {heroSlides.map((slide, slideIndex) => (
          <Link
            key={slide.image}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 1120px, 100vw"
              priority={slideIndex === 0}
            />
            <span className="sr-only">{slide.alt}</span>
          </Link>
        ))}
        <div className="relative z-10 flex w-full justify-between px-4 pb-4 pt-40 lg:pt-72">
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-700 shadow hover:bg-white"
            aria-label="Slide trước"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % heroSlides.length)}
            className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-700 shadow hover:bg-white"
            aria-label="Slide tiếp theo"
          >
            →
          </button>
        </div>
        <div className="relative z-10 flex justify-center gap-2 pb-4">
          {heroSlides.map((slide, dotIndex) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Chuyển tới slide ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                dotIndex === index ? "bg-[#990d23]" : "bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

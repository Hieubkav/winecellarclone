import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/data/winecellar";

type ArticleGridProps = {
  title: string;
  subtitle?: string;
  articles: ArticleCard[];
  background?: "light" | "neutral";
};

export default function ArticleGrid({ title, subtitle, articles, background = "light" }: ArticleGridProps) {
  const bgClass = background === "neutral" ? "bg-[#f9f5f0]" : "bg-white";
  return (
    <section className={`${bgClass} py-16`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="text-center">
          <h2 className="text-3xl font-semibold uppercase tracking-wide text-zinc-800">{title}</h2>
          {subtitle ? <p className="mt-3 text-sm text-zinc-500">{subtitle}</p> : null}
        </header>
        <div className="grid gap-6 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-6 py-6 text-base font-semibold text-zinc-800 group-hover:text-[#990d23]">
                {article.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

type SeoHubLink = {
  label: string;
  href: string;
  description?: string;
};

type SeoHubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  links: SeoHubLink[];
};

export default function SeoHubPage({ eyebrow, title, description, links }: SeoHubPageProps) {
  return (
    <main className="bg-stone-50 text-stone-900">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9B2C3B]">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-[#1C1C1C] md:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-stone-600 md:text-lg">{description}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9B2C3B]/30 hover:shadow-md"
            >
              <span className="font-semibold text-[#9B2C3B]">{item.label}</span>
              {item.description ? (
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

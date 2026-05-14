import Link from "next/link";

type SeoSimplePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  parentHref: string;
  parentLabel: string;
};

export default function SeoSimplePage({
  eyebrow,
  title,
  description,
  parentHref,
  parentLabel,
}: SeoSimplePageProps) {
  return (
    <main className="bg-stone-50 text-stone-900">
      <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9B2C3B]">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#1C1C1C] md:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-stone-600 md:text-lg">{description}</p>
        <Link
          href={parentHref}
          className="mt-8 inline-flex rounded-full border border-[#9B2C3B] px-5 py-2 text-sm font-semibold text-[#9B2C3B] transition hover:bg-[#9B2C3B] hover:text-white"
        >
          Quay lại {parentLabel}
        </Link>
      </section>
    </main>
  );
}

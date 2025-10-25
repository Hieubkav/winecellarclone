"use client"

import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { Facebook, Instagram, Youtube } from "lucide-react"

import { BRAND_COLORS } from "./header.data"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const { base: NOIR_BASE, accent: AMBER_ACCENT, highlight: WINE_HIGHLIGHT } = BRAND_COLORS

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
]

export default function Footer() {
  return (
    <footer
      className={`${montserrat.className} text-sm`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label="Thiên Kim Wine - Footer"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr_1fr]">
          <BrandBlock />
          <InfoBlock />
          <SocialBlock />
        </div>
      </div>
    </footer>
  )
}

function BrandBlock() {
  return (
    <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border-2"
        style={{ borderColor: AMBER_ACCENT, backgroundColor: WINE_HIGHLIGHT }}
      >
        <Image src="/media/logo.webp" alt="Logo Thiên Kim Wine" width={64} height={64} className="h-14 w-14 object-contain" />
      </div>
      <div className="flex flex-col gap-2">
        <span
          className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.32em]"
          style={{ backgroundColor: AMBER_ACCENT, color: NOIR_BASE }}
        >
          Thiên Kim Wine
        </span>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: AMBER_ACCENT }}>
          Tinh hoa vang được tuyển chọn kỹ lưỡng, phục vụ trải nghiệm sang trọng nhưng tối giản.
        </p>
      </div>
    </div>
  )
}

function InfoBlock() {
  return (
    <address className="not-italic text-sm leading-relaxed">
      <p className="text-base font-bold" style={{ color: AMBER_ACCENT }}>
        Showroom Q1 · Hồ Chí Minh
      </p>
      <p>97 Pasteur, P. Bến Nghé, Quận 1</p>
      <p>Giờ mở cửa: 09:00 – 21:00 (T2 - CN)</p>
      <div className="mt-3 flex flex-col gap-1 text-sm">
        <Link href="tel:+84938110888" className="font-semibold transition-opacity hover:opacity-80" style={{ color: AMBER_ACCENT }}>
          Hotline: 0938 110 888
        </Link>
        <Link href="mailto:hello@thienkim.wine" className="transition-opacity hover:opacity-80" style={{ color: AMBER_ACCENT }}>
          hello@thienkim.wine
        </Link>
      </div>
    </address>
  )
}

function SocialBlock() {
  return (
    <div className="flex flex-col gap-4">
      <span
        className="inline-flex w-max items-center rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
        style={{ backgroundColor: WINE_HIGHLIGHT, color: AMBER_ACCENT }}
      >
        Kết nối
      </span>
      <div className="flex items-center gap-3" aria-label="Liên kết mạng xã hội">
        {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex h-12 w-12 items-center justify-center rounded-full border transition hover:opacity-80"
            style={{ backgroundColor: NOIR_BASE, borderColor: AMBER_ACCENT, color: AMBER_ACCENT }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </Link>
        ))}
      </div>
    </div>
  )
}

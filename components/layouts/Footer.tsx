"use client"

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

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer
      className={`${montserrat.className} pb-10 text-sm sm:pb-0`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label="Thiên Kim Wine - Footer"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Hotline
            </p>
            <Link
              href="tel:+84938110888"
              className="text-lg font-bold transition-opacity hover:opacity-80"
              style={{ color: WINE_HIGHLIGHT }}
            >
              0938 110 888
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Địa chỉ
            </p>
            <address className="not-italic text-sm text-white/90">
              97 Pasteur, P. Bến Nghé, Quận 1
            </address>
            <p className="mt-1 text-xs text-white/70">
              Giờ mở cửa: 09:00 - 21:00 (T2-CN)
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Mạng xã hội
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 hover:opacity-90"
                  style={{
                    backgroundColor: NOIR_BASE,
                    borderColor: WINE_HIGHLIGHT,
                    color: WINE_HIGHLIGHT,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <FooterNote />
      </div>
    </footer>
  )
}

function FooterNote() {
  return (
    <div className="mt-8 flex flex-col items-center gap-1 text-xs text-white/60 sm:flex-row sm:justify-between">
      <span>&copy; {CURRENT_YEAR} Thiên Kim Wine. All rights reserved.</span>
      <span>Crafted with đam mê &amp; tinh tế khẩu vị.</span>
    </div>
  )
}

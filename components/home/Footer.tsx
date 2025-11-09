"use client"

import Link from "next/link"
import { Montserrat } from "next/font/google"
import { Facebook, Instagram, Youtube } from "lucide-react"

import { BRAND_COLORS } from "@/components/layouts/header.data"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const { base: NOIR_BASE, accent: AMBER_ACCENT, highlight: WINE_HIGHLIGHT } = BRAND_COLORS

type FooterProps = {
  companyName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: Array<{
    platform: "facebook" | "instagram" | "youtube" | "tiktok" | "zalo";
    url: string;
  }>;
};

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const ZaloIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const ICON_MAP = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: TikTokIcon,
  zalo: ZaloIcon,
};

export default function HomeFooter({
  companyName = "Thiên Kim Wine",
  description,
  email,
  phone,
  address,
  socialLinks = [],
}: FooterProps) {
  return (
    <footer
      className={`${montserrat.className} pb-10 text-sm sm:pb-0`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label={`${companyName} - Footer`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold mb-2" style={{ color: AMBER_ACCENT }}>
              {companyName}
            </p>
            {description && <p className="text-sm text-white/80 mb-2">{description}</p>}
            {email && (
              <Link
                href={`mailto:${email}`}
                className="block text-sm text-white/80 hover:text-white transition"
              >
                {email}
              </Link>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold mb-2" style={{ color: AMBER_ACCENT }}>
              {phone ? "Hotline" : "Liên hệ"}
            </p>
            {phone && (
              <Link
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="text-lg font-bold transition-opacity hover:opacity-80 block"
                style={{ color: WINE_HIGHLIGHT }}
              >
                {phone}
              </Link>
            )}
            {address && (
              <address className="not-italic text-sm text-white/90 mt-2">
                {address}
              </address>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Mạng xã hội
            </p>
            <div className="flex gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const IconComponent = ICON_MAP[link.platform] || Facebook;
                  const isLucideIcon = ['facebook', 'instagram', 'youtube'].includes(link.platform);
                  return (
                    <Link
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 hover:opacity-90"
                      style={{
                        backgroundColor: NOIR_BASE,
                        borderColor: WINE_HIGHLIGHT,
                        color: WINE_HIGHLIGHT,
                      }}
                    >
                      {isLucideIcon ? (
                        <IconComponent className="h-4 w-4" strokeWidth={1.6} />
                      ) : (
                        <IconComponent className="h-4 w-4" />
                      )}
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 hover:opacity-90"
                    style={{
                      backgroundColor: NOIR_BASE,
                      borderColor: WINE_HIGHLIGHT,
                      color: WINE_HIGHLIGHT,
                    }}
                  >
                    <Facebook className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Montserrat } from "next/font/google"
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from "lucide-react"

import { BRAND_COLORS } from "./header.data"
import { useSettingsStore } from "@/lib/stores/settingsStore"
import type { SocialLink } from "@/lib/api/socialLinks"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const { base: NOIR_BASE, accent: AMBER_ACCENT, highlight: WINE_HIGHLIGHT } = BRAND_COLORS

const CURRENT_YEAR = new Date().getFullYear()

// Icon mapping fallback cho các social platforms
// Map platform names → Lucide React icons
const SOCIAL_ICON_FALLBACK: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  Twitter,
  TikTok: Youtube, // Lucide doesn't have TikTok, use Youtube as placeholder
  Zalo: Facebook, // Lucide doesn't have Zalo, use Facebook as placeholder  
  Telegram: Facebook,
  WhatsApp: Facebook,
  Pinterest: Facebook,
}

interface FooterProps {
  socialLinks?: SocialLink[];
}

export default function Footer({ socialLinks = [] }: FooterProps) {
  const settings = useSettingsStore((state) => state.settings);
  const hasHydrated = useSettingsStore((state) => state._hasHydrated);

  // Fallback values nếu chưa hydrate hoặc settings null
  const hotline = hasHydrated && settings?.hotline ? settings.hotline : "0938 110 888";
  const address = hasHydrated && settings?.address ? settings.address : "97 Pasteur, P. Bến Nghé, Quận 1";
  const hours = hasHydrated && settings?.hours ? settings.hours : "09:00 - 21:00 (T2-CN)";
  const siteName = hasHydrated && settings?.site_name ? settings.site_name : "Thiên Kim Wine";

  // Format phone number cho href (loại bỏ spaces, dấu ngoặc)
  const hotlineHref = `tel:+84${hotline.replace(/\D/g, '').slice(-9)}`;

  return (
    <footer
      className={`${montserrat.className} pb-10 text-sm sm:pb-0`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label={`${siteName} - Footer`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Hotline
            </p>
            <Link
              href={hotlineHref}
              className="text-lg font-bold transition-opacity hover:opacity-80"
              style={{ color: WINE_HIGHLIGHT }}
            >
              {hotline}
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Địa chỉ
            </p>
            <address className="not-italic text-sm text-white/90">
              {address}
            </address>
            <p className="mt-1 text-xs text-white/70">
              Giờ mở cửa: {hours}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-sm font-semibold" style={{ color: AMBER_ACCENT }}>
              Mạng xã hội
            </p>
            <div className="flex gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  // Check if có custom icon từ backend
                  const hasCustomIcon = link.icon_url && !link.icon_url.includes('placehold.co');
                  
                  // Get fallback Lucide icon nếu không có custom icon
                  const FallbackIcon = SOCIAL_ICON_FALLBACK[link.platform];

                  return (
                    <Link
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 hover:opacity-90"
                      style={{
                        backgroundColor: NOIR_BASE,
                        borderColor: WINE_HIGHLIGHT,
                        color: WINE_HIGHLIGHT,
                      }}
                    >
                      {hasCustomIcon ? (
                        // Custom icon từ backend
                        <Image
                          src={link.icon_url}
                          alt={`${link.platform} icon`}
                          width={16}
                          height={16}
                          className="transition-transform group-hover:scale-110"
                        />
                      ) : FallbackIcon ? (
                        // Fallback Lucide icon
                        <FallbackIcon className="h-4 w-4" strokeWidth={1.6} />
                      ) : (
                        // Text fallback
                        <span className="text-xs font-bold">{link.platform.slice(0, 2)}</span>
                      )}
                    </Link>
                  );
                })
              ) : (
                // Fallback: Hiển thị placeholder nếu chưa có social links
                <span className="text-xs text-white/50">Đang cập nhật</span>
              )}
            </div>
          </div>
        </div>

        <FooterNote siteName={siteName} />
      </div>
    </footer>
  )
}

function FooterNote({ siteName }: { siteName: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-1 text-xs text-white/60 sm:flex-row sm:justify-between">
      <span>&copy; {CURRENT_YEAR} {siteName}. All rights reserved.</span>
      <span>Crafted with đam mê &amp; tinh tế khẩu vị.</span>
    </div>
  )
}

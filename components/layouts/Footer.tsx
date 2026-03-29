"use client"

import Link from "next/link"
import Image from "next/image"
import { Be_Vietnam_Pro } from "next/font/google"
import { ArrowUp } from "lucide-react"

import { BRAND_COLORS } from "./header.data"
import { useSettingsStore } from "@/lib/stores/settingsStore"
import type { ContactSocialLinkItem } from "@/lib/types/contact"
import type { FooterConfig, FooterColumn, FooterItem } from "@/lib/types/footer"
import { getSocialIconSource } from "@/lib/constants/social-icons"
import { cn } from "@/lib/utils"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const { base: NOIR_BASE, accent: AMBER_ACCENT, highlight: WINE_HIGHLIGHT } = BRAND_COLORS

const CURRENT_YEAR = new Date().getFullYear()

interface FooterProps {
  socialLinks?: ContactSocialLinkItem[];
}

export default function Footer({ socialLinks = [] }: FooterProps) {
  const settings = useSettingsStore((state) => state.settings);
  const hasHydrated = useSettingsStore((state) => state._hasHydrated);

  const siteName = hasHydrated && settings?.site_name ? settings.site_name : "Thiên Kim Wine";
  const footerConfig = hasHydrated ? settings?.footer_config : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Nếu có footer_config từ admin, sử dụng nó
  if (footerConfig && footerConfig.columns && footerConfig.columns.length > 0) {
    return (
      <DynamicFooter
        config={footerConfig}
        siteName={siteName}
        socialLinks={socialLinks}
        onScrollToTop={scrollToTop}
      />
    );
  }

  // Fallback footer đơn giản
  return (
    <footer
      className={`${beVietnamPro.className} pb-10 text-sm sm:pb-0`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label={`${siteName} - Footer`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-white/60">
            &copy; {CURRENT_YEAR} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface DynamicFooterProps {
  config: FooterConfig;
  siteName: string;
  socialLinks: ContactSocialLinkItem[];
  onScrollToTop: () => void;
}

function DynamicFooter({ config, siteName, socialLinks, onScrollToTop }: DynamicFooterProps) {
  const activeColumns = config.columns.filter((c) => c.active);
  const parsedCopyright = (config.copyright ?? '© {year} {siteName}. All rights reserved.')
    .replace('{year}', String(CURRENT_YEAR))
    .replace('{siteName}', siteName);

  const gridCols = cn(
    'grid gap-6 grid-cols-1',
    activeColumns.length >= 3 && 'lg:grid-cols-[1fr_1.6fr_1fr]'
  );

  return (
    <footer
      className={`${beVietnamPro.className} pb-10 text-sm sm:pb-0`}
      style={{ backgroundColor: NOIR_BASE, color: AMBER_ACCENT }}
      aria-label={`${siteName} - Footer`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {activeColumns.length > 0 && (
          <div className={cn(gridCols, "gap-6 border-b border-white/10 pb-5")}>
            {activeColumns.map((column, idx) => (
              <FooterColumnComponent
                key={column.id}
                column={column}
                socialLinks={socialLinks}
                isFirst={idx === 0}
                isLast={idx === activeColumns.length - 1}
                totalColumns={activeColumns.length}
              />
            ))}
          </div>
        )}

        {/* Copyright & Tagline */}
        <div className="mt-4 flex flex-col items-center gap-1 text-xs text-white/60 sm:flex-row sm:justify-between">
          <span>{parsedCopyright}</span>
          {config.tagline && <span>{config.tagline}</span>}
        </div>

        {/* Back to Top Button */}
        {config.showBackToTop && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onScrollToTop}
              aria-label="Quay lại đầu trang"
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2"
              style={{
                backgroundColor: NOIR_BASE,
                borderColor: WINE_HIGHLIGHT,
                color: WINE_HIGHLIGHT,
              }}
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  column: FooterColumn;
  socialLinks: ContactSocialLinkItem[];
  isFirst: boolean;
  isLast: boolean;
  totalColumns: number;
}

function FooterColumnComponent({ column, socialLinks, isFirst, isLast, totalColumns }: FooterColumnProps) {
  const alignment = cn(
    'text-center',
    totalColumns >= 3 && isFirst && 'lg:text-left',
    totalColumns >= 3 && isLast && 'lg:text-right',
    totalColumns >= 3 && !isFirst && !isLast && 'lg:text-center'
  );

  const flexAlignment = cn(
    'flex gap-4 justify-center',
    totalColumns >= 3 && isFirst && 'lg:justify-start',
    totalColumns >= 3 && isLast && 'lg:justify-end'
  );

  return (
    <div className={alignment}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: AMBER_ACCENT }}>
        {column.title}
      </p>

      {column.type === 'social' ? (
        <div className={flexAlignment}>
          {socialLinks.length > 0 ? (
            socialLinks.map((link) => <SocialLinkIcon key={link.id} link={link} />)
          ) : column.items.length > 0 ? (
            column.items.map((item) => (
              <SocialLinkFromConfig key={item.id} item={item} />
            ))
          ) : (
            <span className="text-xs text-white/50">Đang cập nhật</span>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {column.items.map((item) => (
            <FooterItemComponent key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function FooterItemComponent({ item }: { item: FooterItem }) {
  const value = item.value || item.label;

  if (item.type === 'phone') {
    const phoneHref = `tel:+84${value.replace(/\D/g, '').slice(-9)}`;
    return (
      <Link
        href={phoneHref}
        className="block text-lg font-semibold transition-opacity hover:opacity-80"
        style={{ color: WINE_HIGHLIGHT }}
      >
        {value}
      </Link>
    );
  }

  if (item.type === 'email') {
    return (
      <Link
        href={`mailto:${value}`}
        className="block text-sm text-white/80 hover:text-white transition-colors"
      >
        {value}
      </Link>
    );
  }

  if (item.type === 'link' && item.href) {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm text-white/80 hover:text-white transition-colors"
      >
        {value}
      </Link>
    );
  }

  if (item.type === 'address') {
    return (
      <address className="not-italic text-sm text-white/80 leading-relaxed">
        {value}
      </address>
    );
  }

  return <p className="text-sm text-white/80 leading-relaxed">{value}</p>;
}

function SocialLinkIcon({ link }: { link: ContactSocialLinkItem }) {
  const isPlaceholder = !link.icon_url || 
    link.icon_url.includes('placehold') || 
    link.icon_url.includes('placeholder') ||
    link.icon_url.endsWith('term.svg');
  const hasCustomIcon = !isPlaceholder;
  const customIconUrl = hasCustomIcon && link.icon_url ? link.icon_url : null;
  const iconSource = getSocialIconSource(link.platform);

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.platform}
      className="flex items-center justify-center transition hover:-translate-y-0.5 hover:opacity-90"
    >
      {customIconUrl ? (
        <Image
          src={customIconUrl}
          alt={`${link.platform} icon`}
          width={24}
          height={24}
        />
      ) : iconSource ? (
        <Image src={iconSource.src} alt={`${iconSource.alt} icon`} width={24} height={24} />
      ) : (
        <span className="text-xs font-bold">{link.platform.slice(0, 2)}</span>
      )}
    </Link>
  );
}

function SocialLinkFromConfig({ item }: { item: FooterItem }) {
  const iconSource = getSocialIconSource(item.value || item.label);

  return (
    <Link
      href={item.href || '#'}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      className="flex items-center justify-center transition hover:-translate-y-0.5 hover:opacity-90"
    >
      {iconSource ? (
        <Image src={iconSource.src} alt={`${iconSource.alt} icon`} width={24} height={24} />
      ) : (
        <span className="text-xs font-bold">{item.label.slice(0, 2)}</span>
      )}
    </Link>
  );
}

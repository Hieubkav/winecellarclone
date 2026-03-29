"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import type { ContactSocialLinkItem } from "@/lib/types/contact";
import { getSocialIconSource } from "@/lib/constants/social-icons";
import { getImageUrl } from "@/lib/utils/image";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

interface ContactSocialProps {
  socialLinks: ContactSocialLinkItem[];
  title?: string;
  subtitle?: string;
  footerText?: string;
}

/**
 * ContactSocial - Social links section
 * 
 * Design:
 * - Large touch targets (60x60px)
 * - Flat design với hover effect
 * - Brand colors: #ECAA4D background, #1C1C1C icon
 * - Centered layout
 * 
 * Accessibility:
 * - aria-label cho từng link
 * - Visible focus states
 * - Keyboard navigable
 * 
 * Data Source:
 * - Fetch từ API /api/v1/social-links
 * - Hiển thị icon từ backend hoặc fallback Lucide icons
 */
export default function ContactSocial({ 
  socialLinks,
  title = "Kết nối với chúng tôi",
  subtitle = "Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất",
  footerText
}: ContactSocialProps) {
  // Nếu không có social links, không render gì
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="text-center">
      {/* Heading */}
      <h2 className={`${montserrat.className} mb-2 text-2xl font-bold text-[#1C1C1C] sm:text-3xl`}>
        {title}
      </h2>
      
      <p className={`${montserrat.className} mb-8 text-base text-[#1C1C1C]/70 sm:text-lg`}>
        {subtitle}
      </p>

      {/* Social Icons */}
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((link) => {
          const normalizedIconUrl = link.icon_url ? getImageUrl(link.icon_url) : null;
          // Check if có custom icon từ backend (không phải placeholder)
          const isPlaceholder = !normalizedIconUrl || 
            normalizedIconUrl.includes('placehold') || 
            normalizedIconUrl.includes('placeholder') ||
            normalizedIconUrl.endsWith('term.svg');
          const hasCustomIcon = !isPlaceholder;
          const customIconUrl = hasCustomIcon && normalizedIconUrl ? normalizedIconUrl : null;
          
          // Get fallback Lucide icon nếu không có custom icon
          const normalizedPlatform = link.platform?.trim().toLowerCase();
          const iconSource = getSocialIconSource(normalizedPlatform);

          return (
            <Link
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ECAA4D] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#9B2C3B] focus:ring-offset-2 sm:h-14 sm:w-14"
              aria-label={`Theo dõi chúng tôi trên ${link.platform}`}
            >
              {customIconUrl ? (
                // Custom icon từ backend
                <Image
                  src={customIconUrl}
                  alt={`${link.platform} icon`}
                  width={34}
                  height={34}
                  className="transition-transform group-hover:scale-110"
                />
              ) : iconSource ? (
                <Image
                  src={iconSource.src}
                  alt={`${iconSource.alt} icon`}
                  width={34}
                  height={34}
                  className="transition-transform group-hover:scale-110"
                />
              ) : (
                // Text fallback nếu không có icon
                <span className="text-xs font-bold uppercase">{link.platform.slice(0, 2)}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Decorative Text */}
      {footerText && (
        <p className={`${montserrat.className} mt-8 text-xs uppercase tracking-wider text-[#1C1C1C]/50`}>
          {footerText}
        </p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Linkedin, Twitter, MessageCircle, Send } from "lucide-react";
import { Montserrat } from "next/font/google";
import type { SocialLink } from "@/lib/api/socialLinks";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

interface ContactSocialProps {
  socialLinks: SocialLink[];
}

// Icon mapping fallback cho các platforms chưa có icon từ backend
// Map platform names → Lucide React icons hoặc text
const SOCIAL_ICON_FALLBACK: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }> | string
> = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  Twitter,
  TikTok: Youtube, // Lucide doesn't have TikTok, use Youtube as placeholder
  Zalo: "Z", // Simple text "Z" for Zalo
  Telegram: Send,
  WhatsApp: MessageCircle,
  Pinterest: Facebook,
};

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
export default function ContactSocial({ socialLinks }: ContactSocialProps) {
  // Nếu không có social links, không render gì
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="text-center">
      {/* Heading */}
      <h2 className={`${montserrat.className} mb-2 text-2xl font-bold text-[#1C1C1C] sm:text-3xl`}>
        Kết nối với chúng tôi
      </h2>
      
      <p className={`${montserrat.className} mb-8 text-base text-[#1C1C1C]/70 sm:text-lg`}>
        Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất
      </p>

      {/* Social Icons */}
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((link) => {
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
              className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ECAA4D] bg-white text-[#1C1C1C] transition-all duration-200 hover:bg-[#ECAA4D] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#9B2C3B] focus:ring-offset-2 sm:h-16 sm:w-16"
              aria-label={`Theo dõi chúng tôi trên ${link.platform}`}
            >
              {hasCustomIcon ? (
                // Custom icon từ backend
                <Image
                  src={link.icon_url}
                  alt={`${link.platform} icon`}
                  width={28}
                  height={28}
                  className="transition-transform group-hover:scale-110"
                />
              ) : typeof FallbackIcon === 'string' ? (
                // Text icon (e.g., "Z" for Zalo)
                <span className={`${montserrat.className} text-2xl font-bold transition-transform group-hover:scale-110`}>
                  {FallbackIcon}
                </span>
              ) : FallbackIcon ? (
                // Fallback Lucide icon
                <FallbackIcon className="h-6 w-6 transition-transform group-hover:scale-110 sm:h-7 sm:w-7" strokeWidth={2} />
              ) : (
                // Text fallback nếu không có icon
                <span className="text-xs font-bold uppercase">{link.platform.slice(0, 2)}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Decorative Text */}
      <p className={`${montserrat.className} mt-8 text-xs uppercase tracking-wider text-[#1C1C1C]/50`}>
        Chúng tôi luôn sẵn sàng lắng nghe
      </p>
    </div>
  );
}

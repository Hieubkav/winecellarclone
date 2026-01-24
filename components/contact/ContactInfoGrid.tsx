"use client";

import Link from "next/link";
import { Phone, MapPin, Clock, Mail, HelpCircle, type LucideIcon } from "lucide-react";
import { Montserrat } from "next/font/google";
import type { ContactCard } from "@/lib/types/contact";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface ContactInfoGridProps {
  hotline?: string | null;
  address?: string | null;
  hours?: string | null;
  email?: string | null;
  cards?: ContactCard[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Phone,
  MapPin,
  Clock,
  Mail,
  HelpCircle,
};

interface ContactCardComponentProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  href?: string;
  ariaLabel?: string;
}

/**
 * ContactCard - Card component cho từng contact info
 * 
 * Design:
 * - Flat design (border only, no shadow)
 * - Hover effect: background color change
 * - Accessible: 44x44px touch targets
 * - Responsive: stack on mobile, grid on desktop
 */
function ContactCardComponent({ icon, title, content, href, ariaLabel }: ContactCardComponentProps) {
  const cardContent = (
    <>
      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ECAA4D] text-[#1C1C1C]">
        {icon}
      </div>

      {/* Title */}
      <h3 className={`${montserrat.className} mb-2 text-sm font-semibold uppercase tracking-wider text-[#9B2C3B]`}>
        {title}
      </h3>

      {/* Content */}
      <p className={`${montserrat.className} text-base text-[#1C1C1C] sm:text-lg`}>
        {content}
      </p>
    </>
  );

  const baseClasses = "flex flex-col items-center rounded-lg border-2 border-[#ECAA4D]/30 bg-white p-6 text-center transition-all duration-200 hover:border-[#ECAA4D] hover:bg-[#ECAA4D]/5";

  if (href) {
    return (
      <Link
        href={href}
        className={baseClasses}
        aria-label={ariaLabel || `${title}: ${content}`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
}

/**
 * ContactInfoGrid - Grid layout cho contact cards
 * 
 * Responsive:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 4 columns
 * 
 * Supports both legacy props (hotline, address, hours, email) and new cards array
 */
export default function ContactInfoGrid({
  hotline,
  address,
  hours,
  email,
  cards,
}: ContactInfoGridProps) {
  // If cards are provided, use them; otherwise fall back to legacy props
  if (cards && cards.length > 0) {
    const activeCards = cards.filter(c => c.active);
    
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {activeCards.map(card => {
          const IconComponent = ICON_MAP[card.icon] || HelpCircle;
          return (
            <ContactCardComponent
              key={card.id}
              icon={<IconComponent className="h-6 w-6" strokeWidth={2} />}
              title={card.title}
              content={card.content}
              href={card.href}
              ariaLabel={card.href ? `${card.title}: ${card.content}` : undefined}
            />
          );
        })}
      </div>
    );
  }

  // Legacy mode: use individual props
  const hotlineHref = hotline
    ? `tel:+84${hotline.replace(/\D/g, '').slice(-9)}`
    : undefined;

  const emailHref = email ? `mailto:${email}` : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hotline Card */}
      {hotline && (
        <ContactCardComponent
          icon={<Phone className="h-6 w-6" strokeWidth={2} />}
          title="Hotline"
          content={hotline}
          href={hotlineHref}
          ariaLabel={`Gọi hotline: ${hotline}`}
        />
      )}

      {/* Address Card */}
      {address && (
        <ContactCardComponent
          icon={<MapPin className="h-6 w-6" strokeWidth={2} />}
          title="Địa chỉ"
          content={address}
        />
      )}

      {/* Hours Card */}
      {hours && (
        <ContactCardComponent
          icon={<Clock className="h-6 w-6" strokeWidth={2} />}
          title="Giờ mở cửa"
          content={hours}
        />
      )}

      {/* Email Card */}
      {email && (
        <ContactCardComponent
          icon={<Mail className="h-6 w-6" strokeWidth={2} />}
          title="Email"
          content={email}
          href={emailHref}
          ariaLabel={`Gửi email đến: ${email}`}
        />
      )}
    </div>
  );
}

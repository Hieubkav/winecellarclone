"use client";

import Link from "next/link";
import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface ContactInfoGridProps {
  hotline: string | null;
  address: string | null;
  hours: string | null;
  email: string | null;
}

interface ContactCardProps {
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
function ContactCard({ icon, title, content, href, ariaLabel }: ContactCardProps) {
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
 * ContactInfoGrid - Grid layout cho 4 contact cards
 * 
 * Responsive:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 4 columns
 */
export default function ContactInfoGrid({
  hotline,
  address,
  hours,
  email,
}: ContactInfoGridProps) {
  // Format phone number for tel: link
  const hotlineHref = hotline
    ? `tel:+84${hotline.replace(/\D/g, '').slice(-9)}`
    : undefined;

  const emailHref = email ? `mailto:${email}` : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hotline Card */}
      {hotline && (
        <ContactCard
          icon={<Phone className="h-6 w-6" strokeWidth={2} />}
          title="Hotline"
          content={hotline}
          href={hotlineHref}
          ariaLabel={`Gọi hotline: ${hotline}`}
        />
      )}

      {/* Address Card */}
      {address && (
        <ContactCard
          icon={<MapPin className="h-6 w-6" strokeWidth={2} />}
          title="Địa chỉ"
          content={address}
        />
      )}

      {/* Hours Card */}
      {hours && (
        <ContactCard
          icon={<Clock className="h-6 w-6" strokeWidth={2} />}
          title="Giờ mở cửa"
          content={hours}
        />
      )}

      {/* Email Card */}
      {email && (
        <ContactCard
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

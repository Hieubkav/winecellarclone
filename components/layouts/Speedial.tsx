import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import { Gift, Home, MessageCircle, MessageSquareText, Phone } from "lucide-react";

import { BRAND_COLORS } from "./header.data";

type SpeedDialAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isInternal?: boolean;
  newTab?: boolean;
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ACTION_LIBRARY: Record<string, SpeedDialAction> = {
  home: {
    id: "home",
    label: "Trang chủ",
    description: "Về Thiên Kim Wine",
    href: "/",
    icon: Home,
    isInternal: true,
  },
  hotline: {
    id: "hotline",
    label: "Hotline",
    description: "094 669 8008",
    href: "tel:0946698008",
    icon: Phone,
  },
  zalo: {
    id: "zalo",
    label: "Zalo",
    description: "Chat ngay",
    href: "https://zalo.me/306009538036482403",
    icon: MessageSquareText,
    newTab: true,
  },
  messenger: {
    id: "messenger",
    label: "Messenger",
    description: "m.me/winecellar.vn",
    href: "https://m.me/winecellar.vn",
    icon: MessageCircle,
    newTab: true,
  },
  promo: {
    id: "promo",
    label: "Khuyến mãi",
    description: "Ưu đãi mới nhất",
    href: "/chuong-trinh-khuyen-mai",
    icon: Gift,
    isInternal: true,
  },
};

const DESKTOP_ORDER = ["home", "hotline", "zalo", "messenger"] as const;
const MOBILE_ORDER = ["home", "hotline", "zalo", "messenger"] as const;

const BRAND_ICON_PATH: Partial<Record<SpeedDialAction["id"], string>> = {
  zalo: "/icons/zalo.png",
  messenger: "/icons/messenger.png",
};

export default function Speedial() {
  return (
    <>
      <DesktopSpeedDial />
      <MobileBottomNav />
    </>
  );
}

function DesktopSpeedDial() {
  return (
    <nav
      aria-label="Liên hệ nhanh Thiên Kim Wine"
      className={`${montserrat.className} pointer-events-none fixed right-2 top-1/2 z-30 hidden w-14 flex-col lg:flex transform -translate-y-1/2`}
    >
      <ul className="pointer-events-auto flex flex-col gap-0">
        {DESKTOP_ORDER.map((id, index) => {
          const action = ACTION_LIBRARY[id];
          const isFirstChild = index === 0;
          const isLastChild = index === DESKTOP_ORDER.length - 1;
          return <DesktopAction key={id} action={action} isFirstChild={isFirstChild} isLastChild={isLastChild} />;
        })}
      </ul>
    </nav>
  );
}

function DesktopAction({ action, isFirstChild, isLastChild }: { action: SpeedDialAction; isFirstChild?: boolean; isLastChild?: boolean }) {
  let borderRadiusClass = "";
  
  if (isFirstChild) {
    borderRadiusClass = "rounded-t-lg"; // Chỉ bo tròn trên
  } else if (isLastChild) {
    borderRadiusClass = "rounded-b-lg"; // Chỉ bo tròn dưới
  } else {
    borderRadiusClass = "rounded-none"; // Không bo tròn
  }

  return (
    <LinkWrapper
      action={action}
      className={`flex flex-col items-center ${borderRadiusClass} bg-[#9B2C3B] px-2 py-2 text-white transition hover:-translate-y-0.5 hover:bg-[#851e2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-lg relative`}
    >
      <ActionSymbol action={action} size={22} className="text-white" />
      <span className="text-[0.47rem] font-bold text-white mt-1">{action.label}</span>
      <div className="absolute bottom-0 left-1.5 right-1.5 h-px bg-[#ECAA4D]/50"></div>
    </LinkWrapper>
  );
}

function MobileBottomNav() {
  const { base } = BRAND_COLORS;

  return (
    <nav
      aria-label="Thanh điều hướng nhanh trên di động"
      className={`${montserrat.className} fixed inset-x-0 bottom-0 z-30 rounded-t-2xl bg-[#9B2C3B] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:hidden`}
      style={{ color: base }}
    >
      <ul className="grid grid-cols-4 divide-x divide-[#ECAA4D]/50 text-center text-xs font-medium">
        {MOBILE_ORDER.map((id) => {
          const action = ACTION_LIBRARY[id];
          return (
            <li key={id} className="flex">
              <LinkWrapper
                action={action}
                className="flex w-full flex-col items-center gap-1 px-3 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:text-[#ECAA4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECAA4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#9B2C3B]"
              >
                <ActionSymbol action={action} size={22} className="text-white" />
                <span className="text-[0.65rem] font-bold text-white">{action.label}</span>
              </LinkWrapper>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ActionSymbol({ action, size, className = "" }: { action: SpeedDialAction; size: number; className?: string }) {
  const asset = BRAND_ICON_PATH[action.id];

  if (asset) {
    return (
      <Image
        src={asset}
        alt=""
        width={size}
        height={size}
        className={`object-contain ${className}`}
        aria-hidden
      />
    );
  }

  const Icon = action.icon;
  return <Icon aria-hidden strokeWidth={2} style={{ width: size, height: size }} className={className} />;
}

function LinkWrapper({
  action,
  className,
  children,
}: {
  action: SpeedDialAction;
  className: string;
  children: React.ReactNode;
}) {
  const sharedProps = {
    className: `${className} group`,
    "aria-label": action.description ? `${action.label} - ${action.description}` : action.label,
  };

  if (action.isInternal) {
    return (
      <Link href={action.href} {...sharedProps}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={action.href}
      {...sharedProps}
      target={action.newTab ? "_blank" : undefined}
      rel={action.newTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

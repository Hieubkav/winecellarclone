import Image from "next/image";
import Link from "next/link";

import { footerMenus, hotline } from "@/data/winecellar";

const socialLinks = [
  { icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_call.png", label: "Hotline", href: "tel:0946698008" },
  { icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_zalo.png", label: "Zalo", href: "https://zalo.me/306009538036482403" },
  { icon: "https://winecellar.vn/wp-content/themes/winecellarvn/assets/icons/icon_messenger.png", label: "Messenger", href: "https://m.me/winecellar.vn" },
];

export default function Footer() {
  return (
    <footer className="bg-[#f7f7f7] text-sm text-zinc-600">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[2fr,1fr,1fr,1fr]">
        <div className="space-y-4">
          <Image
            src="https://winecellar.vn/wp-content/uploads/2022/09/W-Bronze-logo-New-1.png"
            alt="Winecellar"
            width={180}
            height={108}
            className="h-auto w-40"
          />
          <p>{hotline.company}</p>
          <p>
            Địa chỉ: <span className="font-medium text-zinc-800">{hotline.address}</span>
          </p>
          <p>
            Hotline:{" "}
            <Link href={`tel:${hotline.phone.replace(/\s+/g, "")}`} className="font-semibold text-[#990d23]">
              {hotline.phone}
            </Link>
          </p>
          <p>
            Email:{" "}
            <Link href={`mailto:${hotline.email}`} className="font-semibold text-[#990d23]">
              {hotline.email}
            </Link>
          </p>
        </div>
        {footerMenus.map((menu) => (
          <div key={menu.title} className="space-y-3">
            <h3 className="text-base font-semibold uppercase text-zinc-800">{menu.title}</h3>
            <ul className="space-y-2 text-sm">
              {menu.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#990d23]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 lg:flex-row lg:justify-between">
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} WINECELLAR.vn. All rights reserved.</p>
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-full bg-[#990d23] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7a0a1c]"
              >
                <Image src={link.icon} alt={link.label} width={18} height={18} className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search as SearchIcon, Menu, X } from "lucide-react";

// =====================================
// Types (FIXED: removed stray '#'-comment in NavLeaf)
// =====================================
export interface NavLeaf {
  label: string;
  href: string;
}
export interface NavNode {
  label: string;
  children: NavLeaf[];
}
export interface MenuItemBase {
  label: string;
  href: string;
}
export interface MenuItemWithChildren extends MenuItemBase {
  children?: NavNode[];
}

// =====================================
// Data
// =====================================
export const languageOptions = [
  { code: "en", label: "English", href: "/" },
  { code: "vi", label: "Tiếng Việt", href: "/" },
];

export const trendingKeywords: NavLeaf[] = [
  { label: "vang pháp", href: "/" },
  { label: "vang ý", href: "/" },
  { label: "rượu mạnh", href: "/" },
  { label: "bia", href: "/" },
  { label: "ly rượu vang", href: "/" },
  { label: "bánh quy", href: "/" },
  { label: "trà anh quốc", href: "/" },
  { label: "nước khoáng", href: "/" },
];

export const menuItems: MenuItemWithChildren[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Rượu vang",
    href: "/",
    children: [
      {
        label: "Vang đỏ",
        children: [
          { label: "Vang đỏ Pháp", href: "/" },
          { label: "Vang đỏ Ý", href: "/" },
          { label: "Vang đỏ Tây Ban Nha", href: "/" },
        ],
      },
      {
        label: "Vang trắng",
        children: [
          { label: "Vang trắng Pháp", href: "/" },
          { label: "Vang trắng Ý", href: "/" },
        ],
      },
    ],
  },
  {
    label: "Rượu mạnh",
    href: "/",
    children: [
      {
        label: "Whisky",
        children: [
          { label: "Single Malt", href: "/" },
          { label: "Blended Scotch", href: "/" },
        ],
      },
      { label: "Cognac", children: [{ label: "XO", href: "/" }] },
    ],
  },
  { label: "Vang Pháp", href: "/" },
  { label: "Liên hệ", href: "/" },
];

// =====================================
// Header (clean, modern, fully responsive)
// =====================================
export default function Header() {
  // Optional: run lightweight tests in dev once to help catch shape errors quickly
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const results = __runTests();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__HEADER_TEST_RESULTS__ = results;
      } catch {}
    }
  }, []);

  return (
    <header className="w-full text-sm text-zinc-700">
      <MainBar />
      <NavBar />
    </header>
  );
}

// =====================================
// MainBar (compact, balanced)
// =====================================
function MainBar() {
  return (
    <div className="bg-[#990d23]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-2 px-4 py-2 md:gap-4">
        {/* Logo */}
        <div className="col-span-6 flex items-center md:col-span-3 md:justify-start">
          <Link href="/" className="inline-flex items-center" aria-label="Trang chủ">
            <Image
              src="https://winecellar.vn/wp-content/uploads/2022/09/W-Bronze-logo-New-1.png"
              alt="Winecellar.vn logo"
              width={96}
              height={36}
              priority
              className="h-auto w-[96px] md:w-[110px]"
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="col-span-6 flex justify-end md:hidden">
          <MobileTrigger />
        </div>

        {/* Search */}
        <div className="col-span-12 mt-2 flex justify-center md:col-span-6 md:mt-0">
          <Search />
        </div>

        {/* Contact */}
        <div className="hidden md:col-span-3 md:flex md:items-center md:justify-end">
          <ContactButton />
        </div>
      </div>
    </div>
  );
}

// =====================================
// Search
// =====================================
function Search() {
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative z-20 mx-auto w-full max-w-[460px]">
      <SearchForm onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      {focus && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-md border bg-white p-3 text-sm text-zinc-700 shadow-lg">
          <span className="font-semibold">Trending:</span>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {trendingKeywords.map((item) => (
              <Link key={item.label} href={item.href} className="text-xs transition hover:text-[#990d23]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchForm({ onFocus, onBlur }: { onFocus?: () => void; onBlur?: () => void }) {
  return (
    <form action="/" method="get" className="relative w-full" role="search" aria-label="Tìm kiếm sản phẩm">
      <input
        type="search"
        name="s"
        placeholder="Tìm kiếm rượu vang, rượu mạnh..."
        className="w-full rounded-full border border-white/20 bg-white/10 py-1.5 pl-9 pr-9 text-sm text-white placeholder-white/70 transition focus:border-white/50 focus:bg-white/20 focus:outline-none"
        autoComplete="off"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span className="pointer-events-none absolute inset-y-0 left-0 grid w-9 place-items-center text-white/90">
        <SearchIcon size={17} />
      </span>
      <button
        type="submit"
        className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-full text-white transition hover:text-zinc-200"
        aria-label="Tìm kiếm"
      >
        <SearchIcon size={17} />
      </button>
    </form>
  );
}

function ContactButton() {
  return (
    <Link
      href="/contact"
      className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
    >
      Liên hệ
    </Link>
  );
}

// =====================================
// NavBar + MegaMenu + MobileNav
// =====================================
function NavBar() {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto hidden max-w-7xl items-center justify-center px-4 lg:flex">
        <nav className="flex items-center gap-6 text-[15px] font-medium text-zinc-800">
          {menuItems.map((item) => (
            <div key={item.label} className="group relative py-3">
              <Link href={item.href} className="flex items-center gap-1.5 transition-colors hover:text-[#990d23]">
                <span className="uppercase tracking-wide">{item.label}</span>
                {item.children && <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />}
              </Link>
              {item.children && <MegaMenu menu={item.children} />}
            </div>
          ))}
        </nav>
      </div>
      <MobileNav />
    </div>
  );
}

function MegaMenu({ menu }: { menu: NavNode[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-20 mt-0 min-w-[560px] translate-y-4 rounded-b-lg border-t-2 border-[#990d23] bg-white p-6 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {menu.map((section) => (
          <div key={section.label}>
            <h3 className="mb-3 text-base font-semibold uppercase tracking-wide text-[#990d23]">{section.label}</h3>
            <ul className="space-y-2">
              {section.children.map((child) => (
                <li key={child.label}>
                  <Link href={child.href} className="block text-sm text-zinc-600 transition-colors hover:text-black">
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile placeholder to keep API compatible with previous code
function MobileNav() {
  return <div className="lg:hidden" />;
}

// =====================================
// Mobile Drawer Nav
// =====================================
function MobileTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20"
        aria-label="Mở menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {open && <MobileDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-base font-semibold text-zinc-800">Menu</span>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="max-h-[calc(100vh-56px)] space-y-2 overflow-y-auto px-4 py-3 text-sm">
          {menuItems.map((item) => (
            <div key={item.label} className="border-b pb-2">
              <Link
                href={item.href}
                className="flex items-center justify-between py-1.5 font-semibold text-zinc-800"
              >
                {item.label}
                {item.children && <ChevronDown size={16} />}
              </Link>
              {item.children && (
                <div className="ml-2 space-y-2 py-1 text-zinc-600">
                  {item.children.map((child) => (
                    <div key={child.label}>
                      <h4 className="text-[13px] font-semibold text-zinc-700">{child.label}</h4>
                      <div className="ml-3 space-y-1 text-zinc-500">
                        {child.children.map((subChild) => (
                          <Link
                            key={subChild.label}
                            href={subChild.href}
                            className="block py-0.5 transition-colors hover:text-[#990d23]"
                            onClick={onClose}
                          >
                            {subChild.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

// =====================================
// Tests (runtime + shape) — do not remove; add more below if needed
// =====================================
export function __selfTest(): boolean {
  try {
    console.assert(Array.isArray(languageOptions) && languageOptions.length >= 2, "languageOptions missing");
    console.assert(Array.isArray(trendingKeywords), "trendingKeywords not array");
    console.assert(menuItems.every((m) => typeof m.label === "string" && typeof m.href === "string"), "menuItems shape");
    const firstMenu = menuItems.find((m) => m.children);
    if (firstMenu?.children) {
      console.assert(Array.isArray(firstMenu.children[0].children), "nested children shape");
    }
    // Type probe (will be tree-shaken in prod)
    const probeNavLeaf: NavLeaf = { label: "_", href: "/_" };
    console.assert(!!probeNavLeaf.href, "NavLeaf href missing");
    return true;
  } catch (_) {
    return false;
  }
}

export function __runTests() {
  const results = {
    selfTest: __selfTest(),
    hasLanguageDropdown: typeof languageOptions[0]?.label === "string",
    hasTrending: trendingKeywords.length > 0,
    hasMenuItems: menuItems.length >= 4,
  };
  return results;
}

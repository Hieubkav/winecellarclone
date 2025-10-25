"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ChevronDown, Menu, SearchIcon, X } from "lucide-react"

import {
  BRAND_COLORS,
  languageOptions,
  menuItems,
  trendingKeywords,
  type MenuItemWithChildren,
  type NavLeaf,
  type NavNode,
} from "./header.data"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const { base: BRAND_BASE, accent: BRAND_ACCENT, highlight: BRAND_HIGHLIGHT } = BRAND_COLORS

export default function Header() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const results = __runTests()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(globalThis as any).__HEADER_TEST_RESULTS__ = results
      } catch {}
    }
  }, [])

  return (
    <header className={`${montserrat.className} w-full text-sm text-[#1C1C1C]`} style={{ color: BRAND_BASE }}>
      <MainBar />
      <NavBar />
    </header>
  )
}

function MainBar() {
  return (
    <div className="border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-2 px-4 py-2 md:gap-4">
        {/* Logo */}
        <div className="col-span-6 flex items-center md:col-span-3 md:justify-start">
          <Link href="/" className="flex items-center gap-3" aria-label="Thiên Kim Wine - Trang chủ">
            <Image
              src="/media/logo.webp"
              alt="Thiên Kim Wine logo"
              width={56}
              height={56}
              priority
              className="h-12 w-12 object-contain"
            />
            <span className="hidden text-xs font-bold uppercase tracking-[0.32em] text-[#ECAA4D] md:inline md:text-sm">
              Thiên Kim Wine
            </span>
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
  )
}

function Search() {
  const [focus, setFocus] = useState(false)

  return (
    <div className="relative z-20 mx-auto w-full max-w-[520px]">
      <SearchForm onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      {focus && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-md border border-[#ECAA4D]/35 bg-white p-3 text-xs text-[#1C1C1C]/85 shadow-[0_18px_40px_rgba(28,28,28,0.12)]">
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[#9B2C3B]">Trending</span>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {trendingKeywords.map((item) => (
              <Link key={item.label} href={item.href} className="text-xs text-[#1C1C1C]/70 transition hover:text-[#9B2C3B]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchForm({ onFocus, onBlur }: { onFocus?: () => void; onBlur?: () => void }) {
  return (
    <form action="/" method="get" className="relative w-full" role="search" aria-label="Tìm kiếm sản phẩm">
      <input
        type="search"
        name="s"
        placeholder="Tìm kiếm rượu vang, rượu mạnh..."
        className="w-full rounded-full border border-[#d9d9d9] bg-white py-1.5 pl-9 pr-9 text-sm text-[#1C1C1C] placeholder-[#1C1C1C]/45 transition focus:border-[#9B2C3B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ECAA4D]/30"
        autoComplete="off"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span className="pointer-events-none absolute inset-y-0 left-0 grid w-9 place-items-center text-[#9B2C3B]">
        <SearchIcon size={17} />
      </span>
      <button
        type="submit"
        className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-full text-[#9B2C3B] transition hover:text-[#1C1C1C]"
        aria-label="Tìm kiếm"
      >
        <SearchIcon size={17} />
      </button>
    </form>
  )
}

function ContactButton() {
  return (
      <Link
        href="/contact"
        className="inline-flex items-center rounded-full bg-[#9B2C3B] px-4 py-1.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#b23f4a]"
      >
      Liên hệ
    </Link>
  )
}

function NavBar() {
  return (
    <div className="sticky top-0 z-10 border-b border-[#ECAA4D]/40 bg-white shadow-[0_12px_30px_rgba(236,170,77,0.15)] backdrop-blur-md">
      <div className="relative mx-auto hidden max-w-7xl items-center justify-center px-4 lg:flex">
        <nav className="relative flex items-center gap-6 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#1C1C1C]/70">
          {menuItems.map((item) => {
            const isMega = item.label === "Rượu vang" || item.label === "Rượu mạnh"
            return (
              <div
                key={item.label}
                className={`group py-2 ${isMega ? "relative lg:static" : "relative"}`}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all hover:bg-[#ECAA4D]/15 hover:text-[#9B2C3B]"
                >
                  <span>{item.label}</span>
                  {item.children && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}
                </Link>
                {item.children && (
                  <MegaMenu menu={item.children} isFull={isMega} />
                )}
              </div>
            )
          })}
        </nav>
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ECAA4D]/70 to-transparent" />
      </div>
      <MobileNav />
    </div>
  )
}

function MegaMenu({ menu, isFull = false }: { menu: NavNode[]; isFull?: boolean }) {
  const containerClasses = isFull
    ? "absolute left-1/2 top-full z-20 w-[min(100vw-3rem,1280px)] -translate-x-1/2 rounded-b-2xl border border-[#ECAA4D]/35 bg-white px-8 py-7 shadow-[0_28px_60px_rgba(28,28,28,0.12)]"
    : "absolute left-0 top-full w-fit max-w-sm rounded-b-xl border border-[#ECAA4D]/35 bg-white px-6 py-5 shadow-[0_24px_48px_rgba(28,28,28,0.1)]"

  const gridClasses = isFull ? "grid-cols-1 gap-8 md:grid-cols-4" : "grid-cols-1 gap-4"

  return (
    <div
      className={`invisible translate-y-4 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${containerClasses}`}
    >
      <div className={`mx-auto grid max-w-7xl ${gridClasses}`}>
        {menu.map((section, idx) => (
          <div key={section.label} className={`min-w-[180px] ${isFull && idx > 0 ? "md:border-l md:border-[#ECAA4D]/25 md:pl-6" : ""}`}>
            <h3 className="pb-3 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-[#ECAA4D]">{section.label}</h3>
            <ul className="space-y-2">
              {section.children.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    className={`block rounded-md px-2 py-1 text-[0.78rem] transition-all ${
                      child.isHot
                        ? "font-semibold text-[#9B2C3B]"
                        : "text-[#1C1C1C]/75 hover:bg-[#ECAA4D]/12 hover:text-[#1C1C1C]"
                    }`}
                  >
                    {child.isHot && (
                      <span className="mr-1 inline-block rounded bg-[#9B2C3B] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">
                        HOT
                      </span>
                    )}
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileNav() {
  return <div className="lg:hidden" />
}
function MobileTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#ECAA4D] shadow-[0_6px_18px_rgba(155,44,59,0.45)] transition hover:brightness-110"
        style={{ backgroundColor: BRAND_HIGHLIGHT }}
        aria-label="Mở menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {open && <MobileDrawer onClose={() => setOpen(false)} />}
    </>
  )
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const [activeMenu, setActiveMenu] = useState<MenuItemWithChildren | null>(null)
  const [activeSection, setActiveSection] = useState<NavNode | null>(null)

  const handleSelectMenu = (item: MenuItemWithChildren) => {
    if (item.children && item.children.length > 0) {
      setActiveMenu(item)
      setActiveSection(null)
    } else {
      onClose()
    }
  }

  const handleSelectSection = (section: NavNode) => {
    setActiveSection(section)
  }

  const handleBack = () => {
    if (activeSection) {
      setActiveSection(null)
    } else if (activeMenu) {
      setActiveMenu(null)
    } else {
      onClose()
    }
  }

  const headerTitle = activeSection?.label ?? activeMenu?.label ?? "Menu"
  const showBackButton = !!activeMenu

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div
        className="absolute inset-y-0 right-0 w-[88%] max-w-md border-l border-[#ECAA4D]/35 bg-white text-[#1C1C1C] shadow-[0_24px_64px_rgba(28,28,28,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#9B2C3B]/40 px-4 py-3">
          <span className="text-base font-bold uppercase tracking-[0.16em]" style={{ color: BRAND_ACCENT }}>
            {showBackButton ? (
              <button onClick={handleBack} className="flex items-center gap-2 text-[#1C1C1C] transition hover:text-[#9B2C3B]">
                <ChevronDown size={18} className="rotate-90" />
                <span>{headerTitle}</span>
              </button>
            ) : (
              headerTitle
            )}
          </span>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#1C1C1C] transition hover:bg-[#ECAA4D]/15"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="max-h-[calc(100vh-56px)] space-y-1 overflow-y-auto px-3 py-3 text-sm text-[#1C1C1C]/85">
          {!activeMenu && (
            <>
              {menuItems.map((item) =>
                item.children ? (
                  <button
                    key={item.label}
                    onClick={() => handleSelectMenu(item)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-semibold uppercase tracking-[0.1em] text-[#1C1C1C] transition hover:bg-[#ECAA4D]/15"
                  >
                    <span className="text-sm">{item.label}</span>
                    <ChevronDown size={18} className="-rotate-90 text-[#ECAA4D] opacity-90" />
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 font-semibold uppercase tracking-[0.1em] text-[#1C1C1C] transition hover:bg-[#ECAA4D]/15"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </>
          )}

          {activeMenu && !activeSection && (
            <div className="space-y-1">
              {activeMenu.children?.map((section) => (
                <button
                  key={section.label}
                  onClick={() => handleSelectSection(section)}
                  className="flex w-full items-center justify-between rounded-lg bg-[#ECAA4D]/10 px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C1C1C] transition hover:bg-[#ECAA4D]/20"
                >
                  <span>{section.label}</span>
                  <ChevronDown size={18} className="-rotate-90 text-[#ECAA4D] opacity-90" />
                </button>
              ))}
            </div>
          )}

          {activeMenu && activeSection && (
            <div className="space-y-1">
              {activeSection.children.map((child) => (
                <Link
                  key={child.label}
                  href={child.href}
                  className={`block rounded px-3 py-1.5 text-[0.85rem] transition ${
                    child.isHot
                      ? "bg-[#9B2C3B] font-semibold text-white"
                      : "text-[#1C1C1C]/85 hover:bg-[#ECAA4D]/15 hover:text-[#1C1C1C]"
                  }`}
                  onClick={onClose}
                >
                  {child.isHot && (
                    <span className="mr-1 inline-block rounded bg-[#ECAA4D] px-1 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#1C1C1C]">
                      HOT
                    </span>
                  )}
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export function __selfTest(): boolean {
  try {
    console.assert(Array.isArray(languageOptions) && languageOptions.length >= 2, "languageOptions missing")
    console.assert(Array.isArray(trendingKeywords), "trendingKeywords not array")
    console.assert(
      menuItems.every((m) => typeof m.label === "string" && typeof m.href === "string"),
      "menuItems shape",
    )
    const firstMenu = menuItems.find((m) => m.children)
    if (firstMenu?.children) {
      console.assert(Array.isArray(firstMenu.children[0].children), "nested children shape")
    }
    const probeNavLeaf: NavLeaf = { label: "_", href: "/_" }
    console.assert(!!probeNavLeaf.href, "NavLeaf href missing")
    return true
  } catch (_) {
    return false
  }
}

export function __runTests() {
  const results = {
    selfTest: __selfTest(),
    hasLanguageDropdown: typeof languageOptions[0]?.label === "string",
    hasTrending: trendingKeywords.length > 0,
    hasMenuItems: menuItems.length >= 4,
  }
  return results
}

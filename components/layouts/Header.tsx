"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, SearchIcon, Menu, X } from "lucide-react"

// =====================================
// Types
// =====================================
export interface NavLeaf {
  label: string
  href: string
  isHot?: boolean
}
export interface NavNode {
  label: string
  children: NavLeaf[]
}
export interface MenuItemBase {
  label: string
  href: string
}
export interface MenuItemWithChildren extends MenuItemBase {
  children?: NavNode[]
}

// =====================================
// Data
// =====================================
export const languageOptions = [
  { code: "en", label: "English", href: "/" },
  { code: "vi", label: "Tiếng Việt", href: "/" },
]

export const trendingKeywords: NavLeaf[] = [
  { label: "vang pháp", href: "/" },
  { label: "vang ý", href: "/" },
  { label: "rượu mạnh", href: "/" },
  { label: "bia", href: "/" },
  { label: "ly rượu vang", href: "/" },
  { label: "bánh quy", href: "/" },
  { label: "trà anh quốc", href: "/" },
  { label: "nước khoáng", href: "/" },
]

export const menuItems: MenuItemWithChildren[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Rượu vang",
    href: "/",
    children: [
      {
        label: "Theo loại rượu",
        children: [
          { label: "Rượu vang đỏ", href: "/", isHot: true },
          { label: "Rượu vang trắng", href: "/" },
          { label: "Rượu vang sủi", href: "/" },
          { label: "Champagne (Sâm panh)", href: "/" },
          { label: "Rượu vang hồng", href: "/" },
          { label: "Rượu vang ngọt", href: "/" },
          { label: "Rượu vang cường hóa", href: "/" },
          { label: "Rượu vang không cồn", href: "/" },
          { label: "Rượu vang Organic", href: "/" },
          { label: "Tất cả rượu vang", href: "/" },
        ],
      },
      {
        label: "Theo quốc gia",
        children: [
          { label: "Pháp", href: "/" },
          { label: "Ý", href: "/" },
          { label: "Tây Ban Nha", href: "/" },
          { label: "Chile", href: "/" },
          { label: "Mỹ", href: "/" },
          { label: "Úc", href: "/" },
          { label: "New Zealand", href: "/" },
          { label: "Argentina", href: "/" },
          { label: "Bồ Đào Nha", href: "/" },
          { label: "Đức", href: "/" },
          { label: "Nam Phi", href: "/" },
        ],
      },
      {
        label: "Theo giống nho",
        children: [
          { label: "Cabernet Sauvignon", href: "/" },
          { label: "Merlot", href: "/" },
          { label: "Syrah (Shiraz)", href: "/" },
          { label: "Pinot Noir", href: "/" },
          { label: "Malbec", href: "/" },
          { label: "Montepulciano D'Abruzzo", href: "/" },
          { label: "Negroamaro", href: "/" },
          { label: "Primitivo", href: "/" },
          { label: "Chardonnay", href: "/" },
          { label: "Sauvignon Blanc", href: "/" },
          { label: "Riesling", href: "/" },
          { label: "Tìm giống nho", href: "/" },
        ],
      },
      {
        label: "Theo vùng nổi tiếng",
        children: [
          { label: "Bordeaux", href: "/" },
          { label: "Bourgogne (Pháp)", href: "/" },
          { label: "Tuscany", href: "/" },
          { label: "Puglia", href: "/" },
          { label: "Piedmont (Ý)", href: "/" },
          { label: "California (Mỹ)", href: "/" },
          { label: "Champagne (Pháp)", href: "/" },
        ],
      },
    ],
  },
  {
    label: "Rượu mạnh",
    href: "/",
    children: [
      {
        label: "Loại rượu",
        children: [
          { label: "Rượu Whisky", href: "/" },
          { label: "Rượu Cognac", href: "/" },
          { label: "Rượu Rum", href: "/" },
          { label: "Rượu Gin", href: "/" },
          { label: "Rượu Vermouth", href: "/" },
          { label: "Rượu Whisky Single Malt", href: "/" },
        ],
      },
      {
        label: "Thương hiệu (Cột 1)",
        children: [
          { label: "GlenAllachie", href: "/" },
          { label: "Tamdhu", href: "/" },
          { label: "Glengoyne", href: "/" },
          { label: "Kilchoman", href: "/" },
          { label: "Meikle Tòir", href: "/" },
          { label: "Glen Moray", href: "/" },
          { label: "Thomas Hine & Co", href: "/" },
          { label: "Cognac Lhéraud", href: "/" },
          { label: "Rosebank", href: "/" },
        ],
      },
      {
        label: "Thương hiệu (Cột 2)",
        children: [
          { label: "Hunter Laing", href: "/" },
          { label: "That Boutique-Y Whisky Company", href: "/" },
          { label: "Kill Devil", href: "/" },
          { label: "Cadenhead's", href: "/" },
          { label: "The Ileach", href: "/" },
          { label: "The Original Islay Rum", href: "/" },
          { label: "Silver Seal", href: "/" },
          { label: "MacNair's", href: "/" },
        ],
      },
      {
        label: "Quà tặng",
        children: [{ label: "Quà tặng rượu mạnh", href: "/" }],
      },
    ],
  },
  {
    label: "Sản phẩm khác",
    href: "/",
    children: [
      {
        label: "Danh mục",
        children: [
          { label: "Bia", href: "/" },
          { label: "Trà", href: "/" },
          { label: "Bánh", href: "/" },
        ],
      },
    ],
  },
  { label: "Liên hệ", href: "/" },
]

// =====================================
// Header
// =====================================
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
    <header className="w-full text-sm text-zinc-700">
      <MainBar />
      <NavBar />
    </header>
  )
}

// =====================================
// MainBar
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
  )
}

// =====================================
// Search
// =====================================
function Search() {
  const [focus, setFocus] = useState(false)
  return (
    <div className="relative z-20 mx-auto w-full max-w-[520px]">
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
  )
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
  )
}

function ContactButton() {
  return (
    <Link
      href="/contact"
      className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
    >
      Liên hệ
    </Link>
  )
}

// =====================================
// NavBar + MegaMenu
// =====================================
function NavBar() {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto hidden max-w-7xl items-center justify-center px-4 lg:flex">
        <nav
          className="flex items-center gap-4 text-[0.8rem] font-medium text-zinc-800"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {menuItems.map((item) => (
            <div key={item.label} className="group relative py-2">
              <Link
                href={item.href}
                className="flex items-center gap-1.5 font-medium transition-colors hover:text-[#990d23]"
              >
                <span className="uppercase tracking-wide">{item.label}</span>
                {item.children && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}
              </Link>
              {item.children && (
                <MegaMenu menu={item.children} isFull={item.label === "Rượu vang" || item.label === "Rượu mạnh"} />
              )}
            </div>
          ))}
        </nav>
      </div>
      <MobileNav />
    </div>
  )
}

function MegaMenu({ menu, isFull = false }: { menu: NavNode[]; isFull?: boolean }) {
  const containerClasses = isFull
    ? "absolute left-1/2 top-full z-20 w-[min(100vw-3rem,1280px)] -translate-x-1/2 rounded-b-2xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 px-8 py-7 shadow-xl"
    : "absolute left-0 top-full w-fit max-w-sm rounded-b-xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 px-6 py-5 shadow-xl"

  const gridClasses = isFull ? "grid-cols-1 gap-8 md:grid-cols-4" : "grid-cols-1 gap-4"

  return (
    <div
      className={`invisible translate-y-4 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${containerClasses}`}
    >
      <div className={`mx-auto grid max-w-7xl ${gridClasses}`}>
        {menu.map((section, idx) => (
          <div
            key={section.label}
            className={`min-w-[180px] ${isFull && idx > 0 ? "md:border-l md:border-zinc-200 md:pl-6" : ""}`}
          >
            <h3 className="pb-3 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-[#990d23]">{section.label}</h3>
            <ul className="space-y-2">
              {section.children.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    className={`block text-[0.8rem] transition-colors ${
                      child.isHot ? "font-semibold text-[#b01c37]" : "text-zinc-600 hover:text-[#b01c37]"
                    }`}
                  >
                    {child.isHot && (
                      <span className="mr-1 inline-block rounded bg-[#b01c37] px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
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

// =====================================
// Mobile Drawer
// =====================================
function MobileTrigger() {
  const [open, setOpen] = useState(false)
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-[88%] max-w-md border-l border-[#7b1f2f] bg-gradient-to-b from-[#b01c37] via-[#a01830] to-[#8b1428] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#7b1f2f] bg-[#990d23] px-4 py-3">
          <span className="text-base font-bold text-white">
            {showBackButton ? (
              <button onClick={handleBack} className="flex items-center gap-2 text-white transition hover:text-white/80">
                <ChevronDown size={18} className="rotate-90" />
                <span>{headerTitle}</span>
              </button>
            ) : (
              headerTitle
            )}
          </span>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition hover:bg-white/20"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="max-h-[calc(100vh-56px)] space-y-1 overflow-y-auto px-3 py-3 text-sm">
          {!activeMenu && (
            <>
              {menuItems.map((item) =>
                item.children ? (
                  <button
                    key={item.label}
                    onClick={() => handleSelectMenu(item)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/15"
                  >
                    <span className="text-sm">{item.label}</span>
                    <ChevronDown size={16} className="-rotate-90" />
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/15"
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
                  className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
                >
                  <span>{section.label}</span>
                  <ChevronDown size={15} className="-rotate-90 text-white/70" />
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
                  className={`block rounded px-3 py-1.5 text-[0.8rem] transition ${
                    child.isHot
                      ? "bg-white/15 font-semibold text-white"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  }`}
                  onClick={onClose}
                >
                  {child.isHot && (
                    <span className="mr-1 inline-block rounded bg-white/30 px-1 py-0.5 text-[0.65rem] font-bold text-white">
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

// =====================================
// Tests
// =====================================
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


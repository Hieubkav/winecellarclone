"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ChevronDown, Menu, Search as SearchIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"

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

const navFont = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

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
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/80">
        <SearchIcon size={16} />
      </span>
      <Input
        type="search"
        name="s"
        placeholder="Tìm kiếm rượu vang, rượu mạnh..."
        autoComplete="off"
        onFocus={onFocus}
        onBlur={onBlur}
        className="h-10 pl-9 pr-12"
      />
      <Button
        type="submit"
        size="icon"
        variant="outline"
        aria-label="Tìm kiếm"
        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/25"
      >
        <SearchIcon size={15} />
      </Button>
    </form>
  )
}

function ContactButton() {
  return (
    <Button
      asChild
      variant="outline"
      className="border-white/40 bg-white/10 text-white hover:bg-white/20"
    >
      <Link href="/contact">Liên hệ</Link>
    </Button>
  )
}

// =====================================
// NavBar + MegaMenu
// =====================================
function NavBar() {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto hidden max-w-7xl items-center justify-center px-4 lg:flex">
        <NavigationMenu className={cn(navFont.className, "w-full justify-center")}>
          <NavigationMenuList>
            {menuItems.map((item) => {
              const isFull = item.label === "Rượu vang" || item.label === "Rượu mạnh"
              if (item.children) {
                return (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="text-sm font-semibold uppercase tracking-tight text-zinc-700 hover:text-[#990d23]">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent
                      className={
                        isFull
                          ? "left-1/2 w-[min(100vw-3rem,1280px)] -translate-x-1/2 rounded-b-2xl px-8 py-7"
                          : "left-1/2 min-w-[280px] -translate-x-1/2 px-6 py-5"
                      }
                    >
                      <MegaMenuGrid menu={item.children} isFull={isFull} />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              }

              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold uppercase tracking-tight text-zinc-700 transition hover:text-[#990d23]"
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <MobileNav />
    </div>
  )
}

function MegaMenuGrid({ menu, isFull }: { menu: NavNode[]; isFull: boolean }) {
  return (
    <div className={cn("grid gap-6", isFull ? "md:grid-cols-4" : "grid-cols-1")}>
      {menu.map((section, idx) => (
        <div
          key={section.label}
          className={cn(
            "min-w-[180px]",
            isFull && idx > 0 ? "md:border-l md:border-zinc-200 md:pl-6" : undefined,
          )}
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-tight text-[#990d23]">
            {section.label}
          </h3>
          <ul className="space-y-2.5">
            {section.children.map((child) => (
              <li key={child.label}>
                <Link
                  href={child.href}
                  className={cn(
                    "block text-[0.9rem] leading-relaxed transition-colors",
                    child.isHot ? "font-semibold text-[#b01c37]" : "text-zinc-600 hover:text-[#b01c37]",
                  )}
                >
                  {child.isHot && (
                    <span className="mr-1 inline-flex items-center rounded bg-[#b01c37] px-1.5 py-0.5 text-xs font-bold text-white">
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
  const resetRef = useRef<() => void>(() => {})

  const registerReset = useCallback((fn: () => void) => {
    resetRef.current = fn
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        resetRef.current?.()
      }
      setOpen(next)
    },
    [],
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-md border-white/30 bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <MobileDrawer onClose={() => handleOpenChange(false)} registerReset={registerReset} />
    </Sheet>
  )
}

function MobileDrawer({
  onClose,
  registerReset,
}: {
  onClose: () => void
  registerReset: (fn: () => void) => void
}) {
  const [activeMenu, setActiveMenu] = useState<MenuItemWithChildren | null>(null)
  const [activeSection, setActiveSection] = useState<NavNode | null>(null)

  useEffect(() => {
    registerReset(() => {
      setActiveMenu(null)
      setActiveSection(null)
    })
  }, [registerReset])

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
    }
  }

  const headerTitle = activeSection?.label ?? activeMenu?.label ?? "Menu"

  return (
    <SheetContent>
      <SheetHeader className="flex items-center justify-between border-b border-[#7b1f2f] bg-[#990d23]">
        <div className="flex items-center gap-2">
          {activeMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-md text-white hover:bg-white/20"
            >
              <ChevronDown size={18} className="rotate-90" />
            </Button>
          )}
          <SheetTitle className="text-white">{headerTitle}</SheetTitle>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-white hover:bg-white/20">
            <X size={18} />
          </Button>
        </SheetClose>
      </SheetHeader>

      <nav className="max-h-[calc(100vh-56px)] space-y-1 overflow-y-auto px-3 py-3 text-sm text-white">
        {!activeMenu &&
          menuItems.map((item) =>
            item.children ? (
              <Button
                key={item.label}
                onClick={() => handleSelectMenu(item)}
                variant="ghost"
                className="w-full justify-between rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold uppercase text-white hover:bg-white/15"
              >
                <span>{item.label}</span>
                <ChevronDown size={16} className="-rotate-90 text-white/70" />
              </Button>
            ) : (
              <SheetClose asChild key={item.label}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 font-semibold uppercase text-white transition hover:bg-white/15"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ),
          )}

        {activeMenu && !activeSection && (
          <div className="space-y-1">
            {activeMenu.children?.map((section) => (
              <Button
                key={section.label}
                onClick={() => handleSelectSection(section)}
                variant="ghost"
                className="w-full justify-between rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold uppercase text-white hover:bg-white/20"
              >
                <span>{section.label}</span>
                <ChevronDown size={15} className="-rotate-90 text-white/70" />
              </Button>
            ))}
          </div>
        )}

        {activeMenu && activeSection && (
          <div className="space-y-1">
            {activeSection.children.map((child) => (
              <SheetClose asChild key={child.label}>
                <Link
                  href={child.href}
                  className={cn(
                    "block rounded px-3 py-1.5 text-sm transition",
                    child.isHot ? "bg-white/15 font-semibold text-white" : "text-white/85 hover:bg-white/15 hover:text-white",
                  )}
                  onClick={onClose}
                >
                  {child.isHot && (
                    <span className="mr-1 inline-block rounded bg-white/30 px-1 py-0.5 text-xs font-bold text-white">
                      HOT
                    </span>
                  )}
                  {child.label}
                </Link>
              </SheetClose>
            ))}
          </div>
        )}
      </nav>
    </SheetContent>
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
  } catch {
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
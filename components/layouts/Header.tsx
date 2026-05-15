"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { ChevronDown, ChevronRight, Menu, SearchIcon, X } from "lucide-react"
import type React from "react"
import { useHydrated } from "@/hooks/use-hydrated"

import {
Dialog,
DialogContent,
DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  BRAND_COLORS,
  languageOptions,
  trendingKeywords,
  menuItems as defaultMenuItems,
} from "./header.data"
import type { MenuItem } from "@/lib/api/menus"
import { useSettingsStore } from "@/lib/stores/settingsStore"
import { getImageUrl } from "@/lib/utils/article-content"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const { base: BRAND_BASE, accent: BRAND_ACCENT, highlight: BRAND_HIGHLIGHT } = BRAND_COLORS

type ApiMenuNode = NonNullable<MenuItem["children"]>[number]

type HeaderMenuNode = {
  id: string
  label: string
  href: string
  isHot?: boolean
  isViewAll?: boolean
  children: HeaderMenuNode[]
}

function toHeaderNode(node: ApiMenuNode | MenuItem, fallbackId: string): HeaderMenuNode {
  return {
    id: `${fallbackId}-${node.label || node.href || "item"}`,
    label: node.label || '',
    href: node.href || '#',
    isHot: "isHot" in node ? node.isHot : undefined,
    isViewAll: "isViewAll" in node ? node.isViewAll : undefined,
    children: node.children?.map((child, index) => toHeaderNode(child, `${fallbackId}-${index}`)) ?? [],
  }
}

function defaultToHeaderNode(item: (typeof defaultMenuItems)[number], index: number): HeaderMenuNode {
  return {
    id: `fallback-${index}-${item.label}`,
    label: item.label,
    href: item.href,
    children: item.children?.map((section, sectionIndex) => ({
      id: `fallback-${index}-${sectionIndex}-${section.label}`,
      label: section.label,
      href: '#',
      isViewAll: section.isViewAll,
      children: section.children.map((leaf, leafIndex) => ({
        id: `fallback-${index}-${sectionIndex}-${leafIndex}-${leaf.label}`,
        label: leaf.label,
        href: leaf.href,
        isHot: leaf.isHot,
        isViewAll: leaf.isViewAll,
        children: leaf.children?.map((child, childIndex) => ({
          id: `fallback-${index}-${sectionIndex}-${leafIndex}-${childIndex}-${child.label}`,
          label: child.label,
          href: child.href,
          isHot: child.isHot,
          isViewAll: child.isViewAll,
          children: [],
        })) ?? [],
      })),
    })) ?? [],
  }
}

const fallbackHeaderItems: HeaderMenuNode[] = defaultMenuItems.map(defaultToHeaderNode)

function getMaxLevel(node: HeaderMenuNode, level = 1): number {
  if (node.children.length === 0) return level
  return node.children.reduce((max, child) => Math.max(max, getMaxLevel(child, level + 1)), level)
}

interface HeaderProps {
  menuItems?: MenuItem[];
}

export default function Header({ menuItems: apiMenuItems }: HeaderProps) {
  const convertedMenuItems: HeaderMenuNode[] = apiMenuItems?.length
    ? apiMenuItems
        .filter(item => item.label)
        .map((item, index) => toHeaderNode(item, `api-${item.id ?? index}`))
    : [];

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
    <header
      className={`${montserrat.className} sticky top-0 z-40 w-full bg-white text-sm text-[#1C1C1C] shadow-[0_12px_30px_rgba(28,28,28,0.08)]`}
      style={{ color: BRAND_BASE }}
    >
      <MainBar menuItems={convertedMenuItems.length > 0 ? convertedMenuItems : undefined} />
      <NavBar menuItems={convertedMenuItems.length > 0 ? convertedMenuItems : undefined} />
    </header>
  )
}

function MainBar({ menuItems }: { menuItems?: HeaderMenuNode[] }) {
  const settings = useSettingsStore((state) => state.settings);
  const hasHydrated = useSettingsStore((state) => state._hasHydrated);

  // Fallback values nếu chưa hydrate hoặc settings null
  const logoUrl = hasHydrated && settings?.logo_url ? getImageUrl(settings.logo_url) : "/media/logo.webp";
  const siteName = hasHydrated && settings?.site_name ? settings.site_name : "Thiên Kim Wine";

  return (
    <div className="border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-2 px-3 pb-1 md:gap-4 md:px-4 md:pb-2">
        {/* Logo */}
        <div className="col-span-6 flex items-center md:col-span-3 md:justify-start">
          <Link href="/" className="flex items-center gap-2 md:gap-3" aria-label={`${siteName} - Trang chủ`}>
            <Image
              src={logoUrl}
              alt={`${siteName} logo`}
              width={72}
              height={72}
              priority
              className="h-[55px] w-[55px] object-contain md:h-16 md:w-16"
            />
            <span className="hidden text-xs font-bold uppercase tracking-[0.32em] text-[#ECAA4D] md:inline md:text-sm">
              {siteName}
            </span>
          </Link>
        </div>

        {/* Mobile buttons */}
        <div className="col-span-6 flex justify-end gap-2 md:hidden">
          <SearchMobile />
          <MobileTrigger menuItems={menuItems} />
        </div>

        {/* Search */}
        <div className="col-span-12 mt-0 flex justify-center md:col-span-6 md:mt-0">
        <SearchDesktop />
        </div>

        {/* Contact */}
        <div className="hidden md:col-span-3 md:flex md:items-center md:justify-end">
          <ContactButton />
        </div>
      </div>
    </div>
  )
}
function SearchDesktop() {
return (
<div className="hidden md:block relative z-20 mx-auto w-full max-w-[520px]">
<SearchForm />
</div>
)
}
function SearchMobile() {
  const [open, setOpen] = useState(false)
  const hydrated = useHydrated()

  const triggerButton = (
    <button
      className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-[#ECAA4D] shadow-[0_6px_18px_rgba(155,44,59,0.45)] transition hover:brightness-110"
      style={{ backgroundColor: BRAND_HIGHLIGHT }}
      aria-label="Mở tìm kiếm"
    >
      <SearchIcon size={20} />
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={hydrated ? setOpen : () => undefined}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-6">
      <DialogTitle className="sr-only">Tìm kiếm sản phẩm</DialogTitle>
      <div className="relative z-20 mx-auto w-full max-w-[520px]">
      <SearchForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{id: number, name: string, slug: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleInputChange = async (value: string) => {
    setSearchQuery(value)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Don't fetch if query is too short
    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Faster debounce for better UX (150ms instead of 300ms)
    setIsLoading(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const { fetchProductSuggestions } = await import("@/lib/api/products")
        const response = await fetchProductSuggestions(value, { limit: 6 })
        setSuggestions(response.data.slice(0, 6))
        setShowSuggestions(true)
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 150)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    setShowSuggestions(false)
    if (query) {
      window.location.href = `/san-pham?q=${encodeURIComponent(query)}`
    } else {
      window.location.href = `/san-pham`
    }
  }

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false)
    window.location.href = `/san-pham/${slug}`
  }

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full" role="search" aria-label="Tìm kiếm sản phẩm">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Tìm kiếm rượu vang, rượu mạnh..."
          className="w-full rounded-full border border-[#d9d9d9] bg-white py-1.5 pl-9 pr-16 text-sm text-[#1C1C1C] placeholder-[#1C1C1C]/45 transition focus:border-[#9B2C3B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ECAA4D]/30"
          autoComplete="off"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 grid w-9 place-items-center text-[#9B2C3B]">
          <SearchIcon size={17} />
        </span>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-full bg-[#ECAA4D] px-4 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#1C1C1C] transition hover:brightness-110"
          aria-label="Tìm kiếm"
        >
          Tìm
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-md border border-[#ECAA4D]/35 bg-white shadow-[0_18px_40px_rgba(28,28,28,0.12)]">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-xs text-[#1C1C1C]/60">Đang tìm...</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full px-4 py-2 text-left text-sm text-[#1C1C1C]/80 transition hover:bg-[#ECAA4D]/10 hover:text-[#1C1C1C]"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-center text-xs text-[#1C1C1C]/60">Không tìm thấy kết quả</div>
          )}
        </div>
      )}
    </div>
  )
}
function ContactButton() {
  const [href, setHref] = useState("/lien-he")

  useEffect(() => {
    setHref("/lien-he")
  }, [])

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-[0.12em] transition hover:brightness-110"
      style={{ backgroundColor: BRAND_ACCENT, color: BRAND_BASE }}
    >
      Liên hệ
    </Link>
  )
}
function NavBar({ menuItems: propMenuItems }: { menuItems?: HeaderMenuNode[] }) {
  const items = propMenuItems?.length ? propMenuItems : fallbackHeaderItems

  return (
    <div className="border-b border-[#7A2330] bg-[#ECAA4D] shadow-[0_10px_28px_rgba(155,44,59,0.18)]">
      <div className="relative mx-auto hidden max-w-7xl items-center justify-center px-4 lg:flex">
        <nav className="relative flex items-center gap-1 text-[0.82rem] font-semibold text-[#1C1C1C]/85">
          {items.map((item) => {
            const isDeep = getMaxLevel(item) >= 4
            return <DesktopRootItem key={item.id} item={item} isDeep={isDeep} />
          })}
        </nav>
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1C1C1C]/25 to-transparent" />
      </div>
    </div>
  )
}

function DesktopRootItem({ item, isDeep }: { item: HeaderMenuNode; isDeep: boolean }) {
  const hasChildren = item.children.length > 0

  return (
    <div className={`group py-2 ${isDeep ? "relative lg:static" : "relative"}`}>
      <Link
        href={item.href || '#'}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#1C1C1C]/10 hover:text-[#1C1C1C]"
      >
        <span className="whitespace-nowrap">{item.label}</span>
        {hasChildren && (
          <ChevronDown size={14} className="text-[#1C1C1C]/70 transition-transform group-hover:rotate-180" />
        )}
      </Link>
      {hasChildren && (
        isDeep ? <DeepMegaMenu item={item} /> : <SimpleDropdown nodes={item.children} />
      )}
    </div>
  )
}

function DeepMegaMenu({ item }: { item: HeaderMenuNode }) {
  const columns = Math.min(Math.max(item.children.length, 1), 5)

  return (
    <div className="invisible absolute left-1/2 top-full z-40 w-[min(100vw-2rem,1180px)] -translate-x-1/2 translate-y-3 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-2xl border border-[#ECAA4D]/35 bg-white p-5 shadow-[0_28px_70px_rgba(28,28,28,0.14)]">
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {item.children.map((column) => (
            <div key={column.id} className="min-w-0 space-y-3">
              <Link
                href={column.href || '#'}
                className="block text-sm font-bold leading-snug text-[#9B2C3B] transition hover:text-[#751826]"
              >
                {column.label}
              </Link>
              <div className="space-y-1">
                <RecursiveDesktopNode nodes={column.children} deepMode />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SimpleDropdown({ nodes }: { nodes: HeaderMenuNode[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-40 min-w-[240px] translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-xl border border-[#ECAA4D]/35 bg-white py-2 shadow-[0_24px_54px_rgba(28,28,28,0.12)]">
        <RecursiveDesktopNode nodes={nodes} />
      </div>
    </div>
  )
}

function RecursiveDesktopNode({ nodes, deepMode = false }: { nodes: HeaderMenuNode[]; deepMode?: boolean }) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0
        return (
          <div key={node.id} className="relative group/menu-node px-2">
            <Link
              href={node.href || '#'}
              className={`flex min-w-0 items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm leading-snug transition-colors ${
                node.isHot
                  ? "font-semibold text-[#9B2C3B] hover:bg-[#9B2C3B]/8"
                  : "text-[#1C1C1C]/78 hover:bg-[#ECAA4D]/14 hover:text-[#1C1C1C]"
              }`}
            >
              <span className="min-w-0 whitespace-normal break-words">
                {node.isHot && (
                  <span className="mr-1 inline-block rounded bg-[#9B2C3B] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white">
                    HOT
                  </span>
                )}
                {node.label}
              </span>
              {hasChildren && <ChevronRight size={14} className="mt-0.5 shrink-0 text-[#9B2C3B]/75" />}
            </Link>
            {hasChildren && (
              <div className={`${deepMode ? "left-0 top-full pt-1" : "left-full top-0 pl-1"} absolute z-50 hidden min-w-[230px] group-hover/menu-node:block`}>
                <div className="rounded-xl border border-[#ECAA4D]/35 bg-white py-2 shadow-[0_22px_48px_rgba(28,28,28,0.12)]">
                  <RecursiveDesktopNode nodes={node.children} deepMode={deepMode} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function MobileTrigger({ menuItems }: { menuItems?: HeaderMenuNode[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#ECAA4D] shadow-[0_6px_18px_rgba(155,44,59,0.45)] transition hover:brightness-110"
        style={{ backgroundColor: BRAND_HIGHLIGHT }}
        aria-label="Mở menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {open && <MobileDrawer onClose={() => setOpen(false)} menuItems={menuItems} />}
    </>
  )
}

function MobileDrawer({ onClose, menuItems: propMenuItems }: { onClose: () => void; menuItems?: HeaderMenuNode[] }) {
  const menuItems = propMenuItems?.length ? propMenuItems : fallbackHeaderItems
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([])

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div
        className="absolute inset-y-0 right-0 w-[88%] max-w-md border-l border-[#751826] bg-[#F7E1B3] text-[#1C1C1C] shadow-[0_24px_64px_rgba(28,28,28,0.25)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#9B2C3B]/15 bg-[#ECAA4D] px-4 py-3">
          <span className="text-base font-bold uppercase tracking-[0.16em]" style={{ color: BRAND_BASE }}>
            Menu
          </span>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#1C1C1C] transition hover:bg-[#1C1C1C]/10"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="max-h-[calc(100vh-56px)] space-y-1 overflow-y-auto px-3 py-3 text-sm text-[#1C1C1C]/85">
          <RecursiveMobileNodes
            nodes={menuItems}
            expandedIds={expandedMobileItems}
            onToggle={toggleMobileItem}
            onClose={onClose}
          />
        </nav>
      </div>
    </div>
  )
}

function RecursiveMobileNodes({
  nodes,
  expandedIds,
  onToggle,
  onClose,
}: {
  nodes: HeaderMenuNode[]
  expandedIds: string[]
  onToggle: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0
        const isExpanded = expandedIds.includes(node.id)

        return (
          <div key={node.id}>
            <div className="flex items-center rounded-lg bg-white/50 transition hover:bg-white">
              <Link
                href={node.href || '#'}
                className="min-w-0 flex-1 px-3 py-2.5 text-sm font-semibold leading-snug text-[#1C1C1C]"
                onClick={onClose}
              >
                {node.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  aria-label={`Mở menu con ${node.label}`}
                  aria-expanded={isExpanded}
                  onClick={(event) => {
                    event.preventDefault()
                    onToggle(node.id)
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-[#9B2C3B]"
                >
                  <ChevronDown size={17} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-4 mt-1 border-l border-[#9B2C3B]/20 pl-3">
                <RecursiveMobileNodes
                  nodes={node.children}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onClose={onClose}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function __selfTest(): boolean {
  try {
    console.assert(Array.isArray(languageOptions) && languageOptions.length >= 2, "languageOptions missing")
    console.assert(Array.isArray(trendingKeywords), "trendingKeywords not array")
    console.assert(defaultMenuItems.every((m) => typeof m.label === "string" && typeof m.href === "string"), "menuItems shape")
    const firstMenu = defaultMenuItems.find((m) => m.children)
    if (firstMenu?.children) {
      console.assert(Array.isArray(firstMenu.children[0].children), "nested children shape")
    }
    const probeNode: HeaderMenuNode = { id: "_", label: "_", href: "/_", children: [] }
    console.assert(!!probeNode.href, "HeaderMenuNode href missing")
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
    hasMenuItems: defaultMenuItems.length >= 4,
  }
  return results
}

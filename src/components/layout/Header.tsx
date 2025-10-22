import Image from "next/image";
import Link from "next/link";

import { primaryNav } from "@/data/winecellar";

const languageOptions = [
  { code: "en", label: "English", href: "https://winecellar.vn/en/", flag: "https://winecellar.vn/wp-content/plugins/sitepress-multilingual-cms/res/flags/en.svg" },
  { code: "vi", label: "Tiếng Việt", href: "https://winecellar.vn/", flag: "https://winecellar.vn/wp-content/plugins/sitepress-multilingual-cms/res/flags/vi.svg" },
];

const trendingKeywords = [
  { label: "vang pháp", href: "https://winecellar.vn/ruou-vang-phap/" },
  { label: "vang ý", href: "https://winecellar.vn/ruou-vang-y/" },
  { label: "rượu mạnh", href: "https://winecellar.vn/ruou-manh-cao-cap/" },
  { label: "bia", href: "https://winecellar.vn/bia-nhap-khau/" },
  { label: "ly rượu vang", href: "https://winecellar.vn/pha-le-riedel/" },
  { label: "bánh quy", href: "https://winecellar.vn/banh-nhap-khau/" },
  { label: "trà anh quốc", href: "https://winecellar.vn/tra/" },
  { label: "nước khoáng", href: "https://winecellar.vn/nuoc-khoang/" },
];

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2ZM7.2 14h9.9c.8 0 1.4-.4 1.7-1.1l3-6.9c.1-.3.2-.6.2-.9a1.5 1.5 0 0 0-1.5-1.5H6.3L5.6 1.5A1.5 1.5 0 0 0 4.1 0H1.5a1.5 1.5 0 0 0 0 3h1l2.4 10.4c.2.9 1 1.6 1.9 1.6Z" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="w-full text-sm text-zinc-700">
      <TopBar />
      <MainBar />
      <NavBar />
    </header>
  );
}

function TopBar() {
  return (
    <div className="bg-[#ededed] text-xs text-zinc-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <p className="text-center md:text-left">
          For foreign customers, please Get in touch with us on{" "}
          <Link href="https://open.kakao.com/o/sPyrGCvh" className="font-semibold text-[#990d23] hover:underline">
            Kakaotalk
          </Link>
        </p>
        <nav className="flex items-center justify-center gap-4">
          {languageOptions.map((lang) => (
            <Link key={lang.code} href={lang.href} className="flex items-center gap-2 transition hover:text-[#990d23]">
              <Image src={lang.flag} alt={lang.label} width={18} height={12} />
              <span>{lang.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MainBar() {
  return (
    <div className="bg-[#990d23]">
      <div className="mx-auto flex min-h-[100px] w-full max-w-[1310px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex w-full items-center justify-center lg:w-[250px] lg:justify-start">
          <Link href="https://winecellar.vn/">
            <Image
              src="https://winecellar.vn/wp-content/uploads/2022/09/W-Bronze-logo-New-1.png"
              alt="Winecellar.vn logo"
              width={250}
              height={100}
              className="max-h-[100px] w-auto"
              priority
            />
          </Link>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[55%]">
          <SearchForm />
          <div className="flex flex-wrap justify-start gap-3 text-xs font-semibold uppercase tracking-wide text-white/90">
            {trendingKeywords.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-center lg:w-[180px] lg:justify-end">
          <Link
            href="https://winecellar.vn/cart/"
            className="inline-flex min-w-[140px] items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#990d23] shadow transition hover:bg-zinc-100"
          >
            <span>Giỏ hàng</span>
            <CartIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchForm() {
  return (
    <form
      action="https://winecellar.vn/"
      method="get"
      className="relative flex w-full items-center gap-3 rounded-full border border-white/15 bg-white/15 px-4 py-2 text-white shadow-inner backdrop-blur"
    >
      <input type="hidden" name="post_type" value="product" />
      <input
        type="search"
        name="s"
        placeholder="Nhập tên rượu vang, rượu mạnh, phụ kiện,... cần tìm"
        className="w-full border-none bg-transparent text-sm text-white placeholder:text-white/70 outline-none"
        autoComplete="off"
      />
      <button
        type="submit"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#990d23] transition hover:bg-white"
        aria-label="Tìm kiếm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="m21.53 20.47-3.66-3.66A8.94 8.94 0 0 0 19 11a9 9 0 1 0-9 9 8.94 8.94 0 0 0 5.81-1.13l3.66 3.66a.75.75 0 1 0 1.06-1.06ZM11 18.5a7.5 7.5 0 1 1 7.5-7.5 7.51 7.51 0 0 1-7.5 7.5Z" />
        </svg>
      </button>
    </form>
  );
}

function NavBar() {
  return (
    <div className="border-b border-zinc-200 bg-white shadow">
      <div className="mx-auto hidden max-w-6xl items-center justify-between px-4 py-4 text-[0.9rem] font-semibold text-zinc-600 lg:flex">
        {primaryNav.map((item) => (
          <div key={item.label} className="group relative">
            <Link href={item.href} className="flex items-center gap-2 transition hover:text-[#990d23]">
              {item.icon ? <Image src={item.icon} alt="" width={22} height={22} className="h-5 w-5" /> : null}
              <span className="uppercase tracking-wide">{item.label}</span>
              {item.children ? <span className="text-xs text-zinc-400 transition group-hover:text-[#990d23]">▼</span> : null}
            </Link>
            {item.children ? (
              <div className="invisible absolute left-0 top-full z-20 mt-3 min-w-[220px] translate-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-xl opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <ul className="space-y-2">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link href={child.href} className="block text-zinc-600 transition hover:text-[#990d23]">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  return (
    <div className="lg:hidden">
      <details className="border-b border-zinc-200">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-700">
          Menu
          <span className="text-xl text-[#990d23]">＋</span>
        </summary>
        <nav className="flex flex-col gap-2 px-4 pb-4 text-sm">
          {primaryNav.map((item) => (
            <div key={item.label} className="space-y-1">
              <Link href={item.href} className="block font-semibold text-zinc-700 transition hover:text-[#990d23]">
                {item.label}
              </Link>
              {item.children ? (
                <div className="ml-3 space-y-1 text-zinc-500">
                  {item.children.map((child) => (
                    <Link key={child.label} href={child.href} className="block transition hover:text-[#990d23]">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </details>
    </div>
  );
}

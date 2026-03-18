import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  Inter,
  Roboto,
  Noto_Sans,
  Nunito,
  Source_Sans_3,
  Merriweather,
  Lora,
  Montserrat,
  Noto_Serif,
} from "next/font/google";
import "./globals.css";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { QueryProvider } from "@/lib/query-client";
import { getImageUrl } from "@/lib/utils/image";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans-3",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Dynamic metadata từ settings API
 * Fallback về hard-code values nếu API fail
 */
export async function generateMetadata(): Promise<Metadata> {
  let settings = FALLBACK_SETTINGS;
  
  try {
    settings = await fetchSettings();
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
  }

  const fallbackLogo = FALLBACK_SETTINGS.logo_url ?? "";
  const rawFaviconUrl = settings.favicon_url || FALLBACK_SETTINGS.favicon_url || fallbackLogo || "";
  const faviconUrl = rawFaviconUrl ? getImageUrl(rawFaviconUrl) : "";
  const ogImageUrl = settings.og_image_url || settings.logo_url || FALLBACK_SETTINGS.og_image_url || fallbackLogo || "";
  const title = settings.meta_defaults.title;
  const description = settings.meta_defaults.description;
  const titleTemplate = settings.default_meta_title_template?.trim()
    ? settings.default_meta_title_template.trim()
    : `%s | ${settings.site_name}`;
  const ogTitle = settings.default_og_title?.trim() || title;
  const ogDescription = settings.default_og_description?.trim() || description;
  const indexingEnabled = settings.indexing_enabled !== false;
  
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    keywords: settings.meta_defaults.keywords || undefined,
    authors: [{ name: settings.site_name }],
    creator: settings.site_name,
    publisher: settings.site_name,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: SITE_URL,
      siteName: settings.site_name,
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: settings.site_name,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
      googleBot: {
        index: indexingEnabled,
        follow: indexingEnabled,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: faviconUrl
      ? {
          icon: [{ url: faviconUrl }],
          shortcut: faviconUrl,
          apple: faviconUrl,
          other: [{ rel: "icon", url: faviconUrl }],
        }
      : undefined,
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "OfJxli24KN_kG9FcbbuAy0q6bXumGnVsKWVrr0V8Iac",
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || "9B303080DC2D655419DD32E2EFE2D686",
      },
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: settings.site_name,
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
  };
}

/**
 * Viewport configuration (moved from generateMetadata)
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9B2C3B' },
    { media: '(prefers-color-scheme: dark)', color: '#9B2C3B' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" dir="ltr" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${beVietnamPro.variable} ${inter.variable} ${roboto.variable} ${notoSans.variable} ${nunito.variable} ${sourceSans3.variable} ${merriweather.variable} ${lora.variable} ${montserrat.variable} ${notoSerif.variable} font-sans antialiased bg-white text-[#1C1C1C]`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

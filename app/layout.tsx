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

  const faviconUrl = settings.favicon_url || "/media/logo.webp";
  const ogImageUrl = settings.og_image_url || settings.logo_url || `${SITE_URL}/media/logo.webp`;
  const title = settings.meta_defaults.title;
  const description = settings.meta_defaults.description;
  
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${settings.site_name}`,
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
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: settings.site_name,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [{ url: faviconUrl, type: "image/webp" }],
      shortcut: faviconUrl,
      apple: faviconUrl,
      other: [{ rel: "icon", url: faviconUrl, type: "image/webp" }],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
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

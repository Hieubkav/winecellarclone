import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Speedial from "@/components/layouts/Speedial";
import AgeGate from "@/components/layouts/AgeGate";
import { fetchHomeComponents, type SpeedDialConfig } from "@/lib/api/home";
import { adaptSpeedDialProps } from "@/components/home/adapters";
import { fetchMenus } from "@/lib/api/menus";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { fetchSocialLinks } from "@/lib/api/socialLinks";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { QueryProvider } from "@/lib/query-client";
import { TrackingProvider } from "@/components/providers/TrackingProvider";
import { OrganizationSchema, WebSiteSchema } from "@/lib/seo/structured-data";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
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
          url: settings.logo_url || `${SITE_URL}/media/logo.webp`,
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
      images: [settings.logo_url || `${SITE_URL}/media/logo.webp`],
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
      // Add later: google, yandex, bing verification codes
      // google: 'google-site-verification-code',
    },
    manifest: '/manifest.json',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#9B2C3B' },
      { media: '(prefers-color-scheme: dark)', color: '#9B2C3B' },
    ],
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings data từ API (server-side)
  let settings = FALLBACK_SETTINGS;
  try {
    settings = await fetchSettings();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    // Fallback to default hardcoded data
  }

  // Fetch menu data từ API
  let menuItems = undefined;
  try {
    menuItems = await fetchMenus();
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    // Fallback to default hardcoded data in Header component
  }

  // Fetch speedial component từ API
  let speedialProps = undefined;
  try {
    const components = await fetchHomeComponents();
    const speedialComponent = components.find((c) => c.type === "speed_dial");
    
    if (speedialComponent) {
      speedialProps = adaptSpeedDialProps(speedialComponent.config as SpeedDialConfig);
    }
  } catch (error) {
    console.error("Failed to fetch speedial component:", error);
    // Fallback to default hardcoded data
  }

  // Fetch social links từ API (server-side)
  let socialLinks: Awaited<ReturnType<typeof fetchSocialLinks>> = [];
  try {
    socialLinks = await fetchSocialLinks();
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    // Fallback to empty array
  }

  return (
    <html lang="vi" dir="ltr" className="scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-[#1C1C1C]`}>
        {/* SEO: Structured Data */}
        <OrganizationSchema
          name={settings.site_name}
          logo={settings.logo_url || undefined}
          description={settings.meta_defaults.description}
          address={settings.address || undefined}
          telephone={settings.hotline || undefined}
          email={settings.email || undefined}
          socialLinks={socialLinks}
        />
        <WebSiteSchema
          name={settings.site_name}
          description={settings.meta_defaults.description}
        />

        <QueryProvider>
          <SettingsProvider settings={settings}>
            <TrackingProvider>
              <AgeGate />
              <Header menuItems={menuItems} />
              <Speedial {...speedialProps} />
              {children}
              <Footer socialLinks={socialLinks} />
            </TrackingProvider>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

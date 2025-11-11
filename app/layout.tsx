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

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

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
  
  return {
    title: settings.meta_defaults.title,
    description: settings.meta_defaults.description,
    keywords: settings.meta_defaults.keywords || undefined,
    icons: {
      icon: [{ url: faviconUrl, type: "image/webp" }],
      shortcut: faviconUrl,
      apple: faviconUrl,
      other: [{ rel: "icon", url: faviconUrl, type: "image/webp" }],
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
    <html lang="vi">
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-[#1C1C1C]`}>
        <SettingsProvider settings={settings}>
          <AgeGate />
          <Header menuItems={menuItems} />
          <Speedial {...speedialProps} />
          {children}
          <Footer socialLinks={socialLinks} />
        </SettingsProvider>
      </body>
    </html>
  );
}

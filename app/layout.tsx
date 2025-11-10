import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Speedial from "@/components/layouts/Speedial";
import AgeGate from "@/components/layouts/AgeGate";
import { fetchHomeComponents, type SpeedDialConfig } from "@/lib/api/home";
import { adaptSpeedDialProps } from "@/components/home/adapters";
import { fetchMenus } from "@/lib/api/menus";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thiên Kim Wine",
  description: "Thiên Kim Wine - Bộ sưu tập rượu vang cao cấp cho mọi dịp.",
  icons: {
    icon: [{ url: "/media/logo.webp", type: "image/webp" }],
    shortcut: "/media/logo.webp",
    apple: "/media/logo.webp",
    other: [{ rel: "icon", url: "/media/logo.webp", type: "image/webp" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  return (
    <html lang="vi">
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-[#1C1C1C]`}>
        <AgeGate />
        <Header menuItems={menuItems} />
        <Speedial {...speedialProps} />
        {children}
      </body>
    </html>
  );
}

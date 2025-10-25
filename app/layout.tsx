import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Speedial from "@/components/layouts/Speedial";
import Footer from "@/components/layouts/Footer";
import AgeGate from "@/components/layouts/AgeGate";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-[#1C1C1C]`}>
        <AgeGate />
        <Header />
        <Speedial />
        {children}
        <Footer />
      </body>
    </html>
  );
}

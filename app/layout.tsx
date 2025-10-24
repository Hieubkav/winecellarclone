import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}

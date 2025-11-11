import type { Metadata } from "next";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { fetchSocialLinks } from "@/lib/api/socialLinks";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoGrid from "@/components/contact/ContactInfoGrid";
import ContactMap from "@/components/contact/ContactMap";
import ContactSocial from "@/components/contact/ContactSocial";

/**
 * Contact Page - Server Component
 * 
 * Features:
 * - Fetch settings từ API (ISR 5 phút)
 * - Responsive layout (mobile-first)
 * - Accessible (WCAG 2.1 AA)
 * - Performance optimized (lazy load map)
 */

export const metadata: Metadata = {
  title: "Liên hệ - Thiên Kim Wine",
  description: "Liên hệ với Thiên Kim Wine. Chúng tôi luôn sẵn sàng hỗ trợ bạn với các câu hỏi về rượu vang và dịch vụ.",
  openGraph: {
    title: "Liên hệ - Thiên Kim Wine",
    description: "Liên hệ với Thiên Kim Wine. Hotline, địa chỉ, giờ mở cửa.",
  },
};

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function ContactPage() {
  // Fetch settings từ API (server-side)
  let settings = FALLBACK_SETTINGS;
  
  try {
    settings = await fetchSettings();
  } catch (error) {
    console.error("Failed to fetch settings for contact page:", error);
    // Fallback to default settings
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
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <ContactHero siteName={settings.site_name} />

      {/* Contact Info Grid (4 cards: Hotline, Địa chỉ, Giờ mở cửa, Email) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactInfoGrid
          hotline={settings.hotline}
          address={settings.address}
          hours={settings.hours}
          email={settings.email}
        />
      </section>

      {/* Map Section (Lazy loaded) - Hiển thị nếu có google_map_embed */}
      {settings.google_map_embed && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <ContactMap mapEmbedUrl={settings.google_map_embed} />
        </section>
      )}

      {/* Social Links */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactSocial socialLinks={socialLinks} />
        </div>
      </section>
    </main>
  );
}

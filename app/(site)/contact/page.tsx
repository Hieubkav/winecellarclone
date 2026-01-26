import type { Metadata } from "next";
import { fetchSettings, FALLBACK_SETTINGS } from "@/lib/api/settings";
import { fetchSocialLinks } from "@/lib/api/socialLinks";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoGrid from "@/components/contact/ContactInfoGrid";
import ContactMap from "@/components/contact/ContactMap";
import ContactSocial from "@/components/contact/ContactSocial";
import FAQSection, { DEFAULT_WINE_FAQ } from "@/components/seo/FAQSection";
import { FAQPageSchema } from "@/lib/seo/structured-data";
import type { ContactConfig } from "@/lib/types/contact";
import { DEFAULT_CONTACT_CONFIG } from "@/lib/types/contact";

/**
 * Contact Page - Server Component
 * 
 * Features:
 * - Fetch settings từ API (ISR 5 phút)
 * - Responsive layout (mobile-first)
 * - Accessible (WCAG 2.1 AA)
 * - Performance optimized (lazy load map)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Liên hệ - Thiên Kim Wine",
  description: "Liên hệ với Thiên Kim Wine. Chúng tôi luôn sẵn sàng hỗ trợ bạn với các câu hỏi về rượu vang và dịch vụ.",
  keywords: "liên hệ mua rượu vang, hotline rượu vang, địa chỉ cửa hàng rượu vang",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Liên hệ - Thiên Kim Wine",
    description: "Liên hệ với Thiên Kim Wine. Hotline, địa chỉ, giờ mở cửa.",
    url: `${SITE_URL}/contact`,
    images: [
      {
        url: `${SITE_URL}/media/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Thiên Kim Wine - Liên hệ",
      }
    ],
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

  // Get contact config from settings, fallback to default
  const contactConfig: ContactConfig = settings.contact_config || DEFAULT_CONTACT_CONFIG;
  
  // Determine map embed URL (prefer from contact_config, fallback to settings.google_map_embed)
  const mapEmbedUrl = contactConfig.map?.embedUrl || settings.google_map_embed;
  const showMap = contactConfig.map?.active !== false && mapEmbedUrl;
  
  // Determine if social section should be shown
  const showSocial = contactConfig.social?.active !== false;

  return (
    <main className="min-h-screen bg-white">
      {/* SEO: FAQ Structured Data */}
      <FAQPageSchema items={DEFAULT_WINE_FAQ} />

      {/* Hero Section */}
      <ContactHero 
        siteName={settings.site_name}
        title={contactConfig.hero?.title}
        subtitle={contactConfig.hero?.subtitle}
        showDecorative={contactConfig.hero?.showDecorative}
      />

      {/* Contact Info Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {contactConfig.cards && contactConfig.cards.length > 0 ? (
          <ContactInfoGrid cards={contactConfig.cards} />
        ) : (
          <ContactInfoGrid
            hotline={settings.hotline}
            address={settings.address}
            hours={settings.hours}
            email={settings.email}
          />
        )}
      </section>

      {/* Map Section (Lazy loaded) */}
      {showMap && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <ContactMap mapEmbedUrl={mapEmbedUrl} />
        </section>
      )}

      {/* Social Links */}
      {showSocial && socialLinks.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ContactSocial 
              socialLinks={socialLinks}
              title={contactConfig.social?.title}
              subtitle={contactConfig.social?.subtitle}
              footerText={contactConfig.social?.footerText}
            />
          </div>
        </section>
      )}

      {/* FAQ Section for SEO */}
      <FAQSection
        title="Câu hỏi thường gặp"
        subtitle="Những thắc mắc phổ biến về rượu vang và dịch vụ của chúng tôi"
        items={DEFAULT_WINE_FAQ}
        className="bg-white"
      />
    </main>
  );
}

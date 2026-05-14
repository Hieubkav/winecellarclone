import type { Metadata } from "next";
import { fetchSettingsSafe } from "@/lib/api/settings";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoGrid from "@/components/contact/ContactInfoGrid";
import ContactMap from "@/components/contact/ContactMap";
import ContactSocial from "@/components/contact/ContactSocial";
import type { ContactConfig } from "@/lib/types/contact";
import { DEFAULT_CONTACT_CONFIG } from "@/lib/types/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Liên hệ - Thiên Kim Wine",
  description: "Liên hệ với Thiên Kim Wine để được tư vấn chọn rượu vang, rượu mạnh, quà tặng và dịch vụ doanh nghiệp.",
  keywords: "liên hệ mua rượu vang, hotline rượu vang, địa chỉ cửa hàng rượu vang",
  alternates: {
    canonical: `${SITE_URL}/lien-he`,
  },
  openGraph: {
    title: "Liên hệ - Thiên Kim Wine",
    description: "Liên hệ với Thiên Kim Wine. Hotline, địa chỉ, giờ mở cửa.",
    url: `${SITE_URL}/lien-he`,
    images: [
      {
        url: `${SITE_URL}/media/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Thiên Kim Wine - Liên hệ",
      },
    ],
  },
};

export const revalidate = 300;

export default async function ContactPage() {
  const settings = await fetchSettingsSafe();
  const contactConfig: ContactConfig = settings.contact_config || DEFAULT_CONTACT_CONFIG;
  const mapEmbedUrl = contactConfig.map?.embedUrl || settings.google_map_embed;
  const showMap = contactConfig.map?.active !== false && mapEmbedUrl;
  const showSocial = contactConfig.social?.active !== false;
  const socialLinks = (contactConfig.social_links ?? [])
    .filter((link) => link && link.active !== false && link.platform && link.url)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <main className="min-h-screen bg-white">
      <ContactHero
        siteName={settings.site_name}
        title={contactConfig.hero?.title}
        subtitle={contactConfig.hero?.subtitle}
        showDecorative={contactConfig.hero?.showDecorative}
      />

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

      {showMap && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <ContactMap mapEmbedUrl={mapEmbedUrl} />
        </section>
      )}

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
    </main>
  );
}

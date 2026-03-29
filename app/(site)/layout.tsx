import dynamic from "next/dynamic";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Speedial from "@/components/layouts/Speedial";
import { fetchSpeedDialComponentSafe, type SpeedDialConfig } from "@/lib/api/home";
 import { adaptSpeedDialProps } from "@/components/home/adapters";
import { fetchMenusSafe } from "@/lib/api/menus";
import { fetchSettingsSafe } from "@/lib/api/settings";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { TrackingProvider } from "@/components/providers/TrackingProvider";
 import { OrganizationSchema, WebSiteSchema } from "@/lib/seo/structured-data";

const AgeGate = dynamic(() => import("@/components/layouts/AgeGate"), { ssr: false });
 
 export default async function SiteLayout({
   children,
 }: {
   children: React.ReactNode;
 }) {
  const [settings, menuItems, speedialComponent] = await Promise.all([
    fetchSettingsSafe(),
    fetchMenusSafe(),
    fetchSpeedDialComponentSafe(),
  ]);
  const socialLinks = (settings.contact_config?.social_links ?? [])
    .filter((link) => link && link.active !== false && link.platform && link.url)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const speedialProps = speedialComponent
    ? adaptSpeedDialProps(speedialComponent.config as SpeedDialConfig)
    : undefined;
 
   return (
     <SettingsProvider settings={settings}>
       <TrackingProvider>
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
         <AgeGate />
         <Header menuItems={menuItems} />
         <Speedial {...speedialProps} />
         {children}
         <Footer socialLinks={socialLinks} />
       </TrackingProvider>
     </SettingsProvider>
   );
 }

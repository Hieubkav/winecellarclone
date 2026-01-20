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
 import { TrackingProvider } from "@/components/providers/TrackingProvider";
 import { OrganizationSchema, WebSiteSchema } from "@/lib/seo/structured-data";
 
 export default async function SiteLayout({
   children,
 }: {
   children: React.ReactNode;
 }) {
   let settings = FALLBACK_SETTINGS;
   try {
     settings = await fetchSettings();
   } catch (error) {
     console.error("Failed to fetch settings:", error);
   }
 
   let menuItems = undefined;
   try {
     menuItems = await fetchMenus();
   } catch (error) {
     console.error("Failed to fetch menu items:", error);
   }
 
   let speedialProps = undefined;
   try {
     const components = await fetchHomeComponents();
     const speedialComponent = components.find((c) => c.type === "speed_dial");
     
     if (speedialComponent) {
       speedialProps = adaptSpeedDialProps(speedialComponent.config as SpeedDialConfig);
     }
   } catch (error) {
     console.error("Failed to fetch speedial component:", error);
   }
 
   let socialLinks: Awaited<ReturnType<typeof fetchSocialLinks>> = [];
   try {
     socialLinks = await fetchSocialLinks();
   } catch (error) {
     console.error("Failed to fetch social links:", error);
   }
 
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

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
  const [settingsResult, menusResult, homeComponentsResult, socialLinksResult] = await Promise.allSettled([
    fetchSettings(),
    fetchMenus(),
    fetchHomeComponents(),
    fetchSocialLinks(),
  ]);

  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : FALLBACK_SETTINGS;
  if (settingsResult.status === "rejected") {
    console.error("Failed to fetch settings:", settingsResult.reason);
  }

  const menuItems = menusResult.status === "fulfilled" ? menusResult.value : undefined;
  if (menusResult.status === "rejected") {
    console.error("Failed to fetch menu items:", menusResult.reason);
  }

  let speedialProps = undefined;
  if (homeComponentsResult.status === "fulfilled") {
    const speedialComponent = homeComponentsResult.value.find((c) => c.type === "speed_dial");

    if (speedialComponent) {
      speedialProps = adaptSpeedDialProps(speedialComponent.config as SpeedDialConfig);
    }
  } else {
    console.error("Failed to fetch speedial component:", homeComponentsResult.reason);
  }

  const socialLinks: Awaited<ReturnType<typeof fetchSocialLinks>> =
    socialLinksResult.status === "fulfilled" ? socialLinksResult.value : [];
  if (socialLinksResult.status === "rejected") {
    console.error("Failed to fetch social links:", socialLinksResult.reason);
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

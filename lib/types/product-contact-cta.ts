export type ProductContactCtaMode = "contact_page" | "social_4_buttons";

export interface ProductContactCtaConfig {
  mode: ProductContactCtaMode;
  items: {
    facebook?: string | null;
    zalo?: string | null;
    phone?: string | null;
    tiktok?: string | null;
  };
}

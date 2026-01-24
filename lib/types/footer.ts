export interface FooterItem {
  id: string;
  label: string;
  value: string;
  href?: string;
  type: 'text' | 'link' | 'phone' | 'email' | 'address';
}

export interface FooterColumn {
  id: string;
  title: string;
  type: 'info' | 'contact' | 'social' | 'custom';
  active: boolean;
  items: FooterItem[];
}

export interface FooterConfig {
  columns: FooterColumn[];
  copyright: string;
  tagline: string;
  showBackToTop: boolean;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [],
  copyright: '© {year} {siteName}. All rights reserved.',
  tagline: '',
  showBackToTop: true,
};

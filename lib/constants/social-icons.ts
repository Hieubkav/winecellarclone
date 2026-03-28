export const SOCIAL_ICON_SOURCES: Record<string, { src: string; alt: string }> = {
  facebook: { src: '/icons/social/facebook.svg', alt: 'Facebook' },
  instagram: { src: '/icons/social/instagram.svg', alt: 'Instagram' },
  youtube: { src: '/icons/social/youtube.svg', alt: 'YouTube' },
  linkedin: { src: '/icons/social/linkedin.svg', alt: 'LinkedIn' },
  twitter: { src: '/icons/social/x.svg', alt: 'X' },
  'twitter/x': { src: '/icons/social/x.svg', alt: 'X' },
  x: { src: '/icons/social/x.svg', alt: 'X' },
  tiktok: { src: '/icons/social/tiktok.svg', alt: 'TikTok' },
  telegram: { src: '/icons/social/telegram.svg', alt: 'Telegram' },
  whatsapp: { src: '/icons/social/whatsapp.svg', alt: 'WhatsApp' },
  zalo: { src: '/icons/social/zalo.svg', alt: 'Zalo' },
};

export const getSocialIconSource = (platform?: string) => {
  const normalized = platform?.trim().toLowerCase();
  if (!normalized) return undefined;
  return SOCIAL_ICON_SOURCES[normalized];
};

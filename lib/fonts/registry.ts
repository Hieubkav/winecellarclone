export type FontKey =
  | 'be-vietnam-pro'
  | 'inter'
  | 'roboto'
  | 'noto-sans'
  | 'nunito'
  | 'source-sans-3'
  | 'merriweather'
  | 'lora'
  | 'montserrat'
  | 'noto-serif';

export interface FontRegistryItem {
  key: FontKey;
  label: string;
  variable: string;
}

export const DEFAULT_FONT_KEY: FontKey = 'be-vietnam-pro';

export const FONT_REGISTRY: FontRegistryItem[] = [
  { key: 'be-vietnam-pro', label: 'Be Vietnam Pro', variable: '--font-be-vietnam-pro' },
  { key: 'inter', label: 'Inter', variable: '--font-inter' },
  { key: 'roboto', label: 'Roboto', variable: '--font-roboto' },
  { key: 'noto-sans', label: 'Noto Sans', variable: '--font-noto-sans' },
  { key: 'nunito', label: 'Nunito', variable: '--font-nunito' },
  { key: 'source-sans-3', label: 'Source Sans 3', variable: '--font-source-sans-3' },
  { key: 'merriweather', label: 'Merriweather', variable: '--font-merriweather' },
  { key: 'lora', label: 'Lora', variable: '--font-lora' },
  { key: 'montserrat', label: 'Montserrat', variable: '--font-montserrat' },
  { key: 'noto-serif', label: 'Noto Serif', variable: '--font-noto-serif' },
];

export const FONT_REGISTRY_BY_KEY: Record<FontKey, FontRegistryItem> = Object.fromEntries(
  FONT_REGISTRY.map((font) => [font.key, font])
) as Record<FontKey, FontRegistryItem>;

export const isValidFontKey = (value?: string | null): value is FontKey => {
  if (!value) {
    return false;
  }
  return Boolean(FONT_REGISTRY_BY_KEY[value as FontKey]);
};

export const resolveFontVariable = (fontKey?: string | null): string => {
  const resolvedKey = isValidFontKey(fontKey) ? fontKey : DEFAULT_FONT_KEY;
  return FONT_REGISTRY_BY_KEY[resolvedKey].variable;
};

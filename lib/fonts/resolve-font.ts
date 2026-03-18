import type { CSSProperties } from 'react';
import type { Settings } from '@/lib/api/settings';
import { DEFAULT_FONT_KEY, isValidFontKey, resolveFontVariable } from '@/lib/fonts/registry';

export type FontScope =
  | 'global'
  | 'home'
  | 'product_list'
  | 'product_detail'
  | 'article_list'
  | 'article_detail';

const resolveGlobalKey = (settings?: Settings | null): string => {
  if (isValidFontKey(settings?.global_font_key)) {
    return settings.global_font_key;
  }
  return DEFAULT_FONT_KEY;
};

export const resolveScopedFontKey = (settings: Settings | null | undefined, scope: FontScope): string => {
  const globalKey = resolveGlobalKey(settings);

  if (!settings) {
    return globalKey;
  }

  const scopeKeyMap: Record<Exclude<FontScope, 'global'>, string | null | undefined> = {
    home: settings.home_font_key,
    product_list: settings.product_list_font_key,
    product_detail: settings.product_detail_font_key,
    article_list: settings.article_list_font_key,
    article_detail: settings.article_detail_font_key,
  };

  if (scope === 'global') {
    return globalKey;
  }

  const candidate = scopeKeyMap[scope];
  return isValidFontKey(candidate) ? candidate : globalKey;
};

export const resolveScopedFontVariable = (settings: Settings | null | undefined, scope: FontScope): string => {
  return resolveFontVariable(resolveScopedFontKey(settings, scope));
};

export const getScopedFontStyle = (
  settings: Settings | null | undefined,
  scope: FontScope
): CSSProperties => {
  return { fontFamily: `var(${resolveScopedFontVariable(settings, scope)})` };
};

'use client';

import { Card } from '@/app/(admin)/admin/components/ui';
import { Label } from '@/components/ui/label';
import { FONT_REGISTRY, FONT_REGISTRY_BY_KEY, DEFAULT_FONT_KEY, isValidFontKey, resolveFontVariable } from '@/lib/fonts/registry';

const PREVIEW_TEXT = 'Tiếng Việt rõ đẹp: Rượu vang đỏ, bài viết nổi bật, khuyến mãi hôm nay.';
const PREVIEW_SCOPES = [
  { key: 'home', label: 'Trang chủ' },
  { key: 'product_list', label: 'Danh sách sản phẩm' },
  { key: 'product_detail', label: 'Chi tiết sản phẩm' },
  { key: 'article_list', label: 'Danh sách bài viết' },
  { key: 'article_detail', label: 'Chi tiết bài viết' },
] as const;

interface FontSettingsTabProps {
  globalFontKey: string;
  homeFontKey: string | null;
  productListFontKey: string | null;
  productDetailFontKey: string | null;
  articleListFontKey: string | null;
  articleDetailFontKey: string | null;
  onGlobalFontChange: (value: string) => void;
  onHomeFontChange: (value: string | null) => void;
  onProductListFontChange: (value: string | null) => void;
  onProductDetailFontChange: (value: string | null) => void;
  onArticleListFontChange: (value: string | null) => void;
  onArticleDetailFontChange: (value: string | null) => void;
}

const renderFontOptions = () =>
  FONT_REGISTRY.map((font) => (
    <option key={font.key} value={font.key}>
      {font.label}
    </option>
  ));

const renderScopedSelect = (
  id: string,
  value: string | null,
  onChange: (value: string | null) => void
) => (
  <select
    id={id}
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value || null)}
    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">Dùng font mặc định toàn site</option>
    {renderFontOptions()}
  </select>
);

const resolveFontKey = (value: string | null, fallback: string) => {
  if (isValidFontKey(value)) {
    return value;
  }
  if (isValidFontKey(fallback)) {
    return fallback;
  }
  return DEFAULT_FONT_KEY;
};

const resolveFontLabel = (fontKey: string) => {
  return FONT_REGISTRY_BY_KEY[fontKey as keyof typeof FONT_REGISTRY_BY_KEY]?.label ?? 'Font mặc định';
};

export const FontSettingsTab = ({
  globalFontKey,
  homeFontKey,
  productListFontKey,
  productDetailFontKey,
  articleListFontKey,
  articleDetailFontKey,
  onGlobalFontChange,
  onHomeFontChange,
  onProductListFontChange,
  onProductDetailFontChange,
  onArticleListFontChange,
  onArticleDetailFontChange,
}: FontSettingsTabProps) => {
  const resolvedGlobalKey = resolveFontKey(globalFontKey, DEFAULT_FONT_KEY);
  const resolvedGlobalLabel = resolveFontLabel(resolvedGlobalKey);
  const scopeValues = {
    home: homeFontKey,
    product_list: productListFontKey,
    product_detail: productDetailFontKey,
    article_list: articleListFontKey,
    article_detail: articleDetailFontKey,
  } as const;

  return (
    <Card>
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Font chữ toàn site</h2>
        <p className="text-sm text-slate-500">
          Quản lý font chữ tập trung cho trang chủ, sản phẩm và bài viết
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="globalFontKey">Font mặc định toàn site</Label>
          <select
            id="globalFontKey"
            value={globalFontKey}
            onChange={(event) => onGlobalFontChange(event.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {renderFontOptions()}
          </select>
          <p className="text-xs text-slate-500">Đang dùng: {resolvedGlobalLabel}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeFontKey">Font trang chủ (home-components)</Label>
            {renderScopedSelect('homeFontKey', homeFontKey, onHomeFontChange)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productListFontKey">Font danh sách sản phẩm</Label>
            {renderScopedSelect('productListFontKey', productListFontKey, onProductListFontChange)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDetailFontKey">Font chi tiết sản phẩm</Label>
            {renderScopedSelect('productDetailFontKey', productDetailFontKey, onProductDetailFontChange)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="articleListFontKey">Font danh sách bài viết</Label>
            {renderScopedSelect('articleListFontKey', articleListFontKey, onArticleListFontChange)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="articleDetailFontKey">Font chi tiết bài viết</Label>
            {renderScopedSelect('articleDetailFontKey', articleDetailFontKey, onArticleDetailFontChange)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Preview mặc định toàn site</p>
            <p className="text-sm text-slate-800 dark:text-slate-200" style={{ fontFamily: `var(${resolveFontVariable(resolvedGlobalKey)})` }}>
              {PREVIEW_TEXT}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PREVIEW_SCOPES.map((scope) => {
              const selectedKey = scopeValues[scope.key];
              const resolvedKey = resolveFontKey(selectedKey, resolvedGlobalKey);
              const resolvedLabel = resolveFontLabel(resolvedKey);
              const isInherited = !isValidFontKey(selectedKey);
              return (
                <div key={scope.key} className="rounded-md border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">{scope.label}</p>
                  <p
                    className="text-sm text-slate-800 dark:text-slate-200"
                    style={{ fontFamily: `var(${resolveFontVariable(resolvedKey)})` }}
                  >
                    {PREVIEW_TEXT}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Đang dùng: {resolvedLabel}{isInherited ? ' (kế thừa từ mặc định toàn site)' : ' (thiết lập riêng)'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

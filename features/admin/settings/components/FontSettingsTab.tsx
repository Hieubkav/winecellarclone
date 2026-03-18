'use client';

import { Card } from '@/app/(admin)/admin/components/ui';
import { Label } from '@/components/ui/label';
import { FONT_REGISTRY } from '@/lib/fonts/registry';

const PREVIEW_TEXT = 'Tiếng Việt rõ đẹp: Rượu vang đỏ, bài viết nổi bật, khuyến mãi hôm nay.';

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

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Preview tiếng Việt</p>
          <p className="text-sm text-slate-800 dark:text-slate-200">{PREVIEW_TEXT}</p>
        </div>
      </div>
    </Card>
  );
};

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DynamicIcon from '@/components/shared/DynamicIcon';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { fetchAdminCatalogAttributeGroups, fetchAdminSocialLinks } from '@/lib/api/admin';
import {
  fetchProductDetail,
  fetchProductFilters,
  fetchProductList,
  type ExtraAttr,
  type ProductDetail,
  type ProductFiltersPayload,
  type ProductListResponse,
} from '@/lib/api/products';
import { fetchSettings, type Settings } from '@/lib/api/settings';
import { DYNAMIC_ICON_MAP, resolveIconInput } from '@/lib/icons/dynamicIconRegistry';
import { getImageUrl } from '@/lib/utils/image';
import type { AdminCatalogAttributeGroupsResponse, AdminSocialLinksResponse } from '@/lib/api/admin';

type AuditItem = {
  id: string;
  source: string;
  label: string;
  rawIcon: string | null;
  iconName: string | null;
  iconUrl: string | null;
  normalizedName: string | null;
  error: string | null;
};

const isRelativeStorageUrl = (url: string): boolean => {
  return url.startsWith('/storage/') || url.startsWith('storage/') || url.includes('localhost:3000/storage');
};

const normalizeIconName = (value: string): string => {
  const trimmed = value.trim();
  const normalized = trimmed.includes(':') ? trimmed.split(':').pop() || trimmed : trimmed;
  return normalized
    .split(/[-_\s]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join('');
};

const evaluateIcon = (rawIcon: string | null, iconName: string | null, iconUrl: string | null) => {
  if (iconUrl) {
    if (isRelativeStorageUrl(iconUrl)) {
      return { error: 'icon_url_relative_storage', normalizedName: null };
    }

    return { error: null, normalizedName: null };
  }

  if (iconName) {
    if (DYNAMIC_ICON_MAP[iconName]) {
      return { error: null, normalizedName: null };
    }

    const normalized = normalizeIconName(iconName);
    if (DYNAMIC_ICON_MAP[normalized]) {
      return { error: 'icon_name_needs_normalize', normalizedName: normalized };
    }

    return { error: 'icon_name_not_supported', normalizedName: normalized };
  }

  if (rawIcon) {
    const normalized = normalizeIconName(rawIcon);
    if (DYNAMIC_ICON_MAP[normalized]) {
      return { error: 'icon_missing_needs_normalize', normalizedName: normalized };
    }
  }

  return { error: 'icon_missing', normalizedName: null };
};

export default function IconAuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const nextItems: AuditItem[] = [];
    const addItem = (item: Omit<AuditItem, 'normalizedName' | 'error'>) => {
      const { error, normalizedName } = evaluateIcon(item.rawIcon, item.iconName, item.iconUrl);
      nextItems.push({ ...item, error, normalizedName });
    };

    try {
      const results = await Promise.allSettled([
        fetchAdminCatalogAttributeGroups({ per_page: 200 }),
        fetchAdminSocialLinks({ per_page: 200 }),
        fetchProductFilters(),
        fetchProductList({ per_page: 40 }),
        fetchSettings(),
      ]);

      const [attributeGroupsResult, socialLinksResult, filtersResult, productListResult, settingsResult] = results;
      const attributeGroups = attributeGroupsResult.status === 'fulfilled'
        ? (attributeGroupsResult.value as AdminCatalogAttributeGroupsResponse)
        : null;
      const socialLinks = socialLinksResult.status === 'fulfilled'
        ? (socialLinksResult.value as AdminSocialLinksResponse)
        : null;
      const filters = filtersResult.status === 'fulfilled'
        ? (filtersResult.value as ProductFiltersPayload)
        : null;
      const productList = productListResult.status === 'fulfilled'
        ? (productListResult.value as ProductListResponse)
        : null;
      const settings = settingsResult.status === 'fulfilled'
        ? (settingsResult.value as Settings)
        : null;

      if (attributeGroups) {
        attributeGroups.data.forEach((group) => {
          const resolved = resolveIconInput(group.icon_path);
          addItem({
            id: `admin-attribute-${group.code}`,
            source: 'admin-attribute-groups',
            label: `${group.name} (${group.code})`,
            rawIcon: group.icon_path ?? null,
            iconName: resolved.iconName,
            iconUrl: resolved.iconUrl,
          });
        });
      }

      if (socialLinks) {
        socialLinks.data.forEach((link) => {
          addItem({
            id: `admin-social-${link.id}`,
            source: 'admin-social-links',
            label: `${link.platform} (${link.url})`,
            rawIcon: link.icon_url ?? null,
            iconName: null,
            iconUrl: link.icon_url ?? null,
          });
        });
      }

      if (filters) {
        filters.attribute_filters.forEach((filter) => {
          addItem({
            id: `public-filter-${filter.code}`,
            source: 'public-filters',
            label: `${filter.name} (${filter.code})`,
            rawIcon: filter.icon_name || filter.icon_url || null,
            iconName: filter.icon_name ?? null,
            iconUrl: filter.icon_url ?? null,
          });
        });
      }

      if (settings?.contact_config?.cards) {
        settings.contact_config.cards.forEach((card) => {
          addItem({
            id: `contact-card-${card.id}`,
            source: 'public-contact-config',
            label: `${card.title} (${card.type})`,
            rawIcon: card.icon ?? null,
            iconName: card.icon ?? null,
            iconUrl: null,
          });
        });
      }

      if (productList?.data?.length) {
        const detailResults = await Promise.allSettled(
          productList.data.map((product) => fetchProductDetail(product.slug))
        );

        detailResults
          .map((result) => (result.status === 'fulfilled' ? result.value : null))
          .filter((detail): detail is ProductDetail => Boolean(detail))
          .forEach((detail) => {
            detail.attributes?.forEach((attr) => {
              addItem({
                id: `product-detail-${detail.slug}-${attr.group_code}`,
                source: 'product-detail-attributes',
                label: `${detail.slug} / ${attr.group_name || attr.group_code}`,
                rawIcon: attr.icon_name || attr.icon_url || null,
                iconName: attr.icon_name ?? null,
                iconUrl: attr.icon_url ?? null,
              });
            });

            (Object.entries(detail.extra_attrs ?? {}) as Array<[string, ExtraAttr]>).forEach(([code, attr]) => {
              addItem({
                id: `product-detail-extra-${detail.slug}-${code}`,
                source: 'product-detail-extra-attrs',
                label: `${detail.slug} / ${attr.label || code}`,
                rawIcon: attr.icon_name || attr.icon_url || null,
                iconName: attr.icon_name ?? null,
                iconUrl: attr.icon_url ?? null,
              });
            });
          });
      }
    } catch (error) {
      console.error('Icon audit failed:', error);
      setLoadError('Không thể tải dữ liệu audit.');
    }

    setItems(nextItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const summary = useMemo(() => {
    const errorItems = items.filter((item) => item.error);
    return {
      total: items.length,
      errors: errorItems.length,
      ok: items.length - errorItems.length,
    };
  }, [items]);

  if (process.env.NODE_ENV === 'production') {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Trang audit chỉ dùng cho môi trường dev.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Icon Audit</h1>
          <p className="text-sm text-slate-500">Kiểm tra icon dynamic toàn site.</p>
        </div>
        <Button onClick={loadAudit} disabled={loading}>
          {loading ? 'Đang tải...' : 'Reload audit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tổng items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pass</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600">{summary.ok}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">{summary.errors}</CardContent>
        </Card>
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách lỗi</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2 pr-4">Nguồn</th>
                <th className="py-2 pr-4">Label</th>
                <th className="py-2 pr-4">Raw</th>
                <th className="py-2 pr-4">Icon name</th>
                <th className="py-2 pr-4">Icon url</th>
                <th className="py-2 pr-4">Lỗi</th>
                <th className="py-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((item) => item.error)
                .map((item) => {
                  const previewName = item.normalizedName && DYNAMIC_ICON_MAP[item.normalizedName]
                    ? item.normalizedName
                    : item.iconName;
                  const previewUrl = item.iconUrl
                    ? (isRelativeStorageUrl(item.iconUrl) ? getImageUrl(item.iconUrl) : item.iconUrl)
                    : null;

                  return (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="py-2 pr-4 text-xs text-slate-500">{item.source}</td>
                      <td className="py-2 pr-4 text-slate-900">{item.label}</td>
                      <td className="py-2 pr-4 text-xs text-slate-500">{item.rawIcon || '-'}</td>
                      <td className="py-2 pr-4 text-xs text-slate-500">{item.iconName || '-'}</td>
                      <td className="py-2 pr-4 text-xs text-slate-500">{item.iconUrl || '-'}</td>
                      <td className="py-2 pr-4 text-xs text-red-600">{item.error}</td>
                      <td className="py-2">
                        <DynamicIcon
                          iconName={previewName}
                          iconUrl={previewUrl}
                          size={18}
                          className="h-5 w-5 text-slate-700"
                          imageClassName="h-5 w-5"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {!items.some((item) => item.error) && (
            <p className="text-sm text-slate-500">Không có lỗi icon.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tổng hợp tất cả items</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2 pr-4">Nguồn</th>
                <th className="py-2 pr-4">Label</th>
                <th className="py-2 pr-4">Raw</th>
                <th className="py-2 pr-4">Icon name</th>
                <th className="py-2 pr-4">Icon url</th>
                <th className="py-2 pr-4">Trạng thái</th>
                <th className="py-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const previewName = item.normalizedName && DYNAMIC_ICON_MAP[item.normalizedName]
                  ? item.normalizedName
                  : item.iconName;
                const previewUrl = item.iconUrl
                  ? (isRelativeStorageUrl(item.iconUrl) ? getImageUrl(item.iconUrl) : item.iconUrl)
                  : null;

                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4 text-xs text-slate-500">{item.source}</td>
                    <td className="py-2 pr-4 text-slate-900">{item.label}</td>
                    <td className="py-2 pr-4 text-xs text-slate-500">{item.rawIcon || '-'}</td>
                    <td className="py-2 pr-4 text-xs text-slate-500">{item.iconName || '-'}</td>
                    <td className="py-2 pr-4 text-xs text-slate-500">{item.iconUrl || '-'}</td>
                    <td className={`py-2 pr-4 text-xs ${item.error ? 'text-red-600' : 'text-emerald-600'}`}>
                      {item.error ? item.error : 'ok'}
                    </td>
                    <td className="py-2">
                      <DynamicIcon
                        iconName={previewName}
                        iconUrl={previewUrl}
                        size={18}
                        className="h-5 w-5 text-slate-700"
                        imageClassName="h-5 w-5"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '../components/ui';
import {
  createMenu,
  fetchAdminIa,
  type AdminIaComplianceItem,
} from '@/lib/api/admin';

const isTopLevelRoute = (path: string) => path === '/' || path.split('/').filter(Boolean).length === 1;

export default function InformationArchitecturePage() {
  const [items, setItems] = useState<AdminIaComplianceItem[]>([]);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState({ total: 0, passed: 0, warnings: 0, missing: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadIa = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminIa();
      setItems(response.data.compliance.items);
      setScore(response.data.compliance.score);
      setSummary(response.data.compliance.summary);
    } catch (error) {
      console.error('Load page structure failed:', error);
      toast.error('Không tải được sơ đồ trang');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIa();
  }, [loadIa]);

  const missingTopLevelMenus = useMemo(
    () => items.filter((item) => !item.menu_covered && item.resolvable && isTopLevelRoute(item.path)),
    [items]
  );

  const missingItems = useMemo(
    () => items.filter((item) => item.severity === 'missing'),
    [items]
  );

  const warningItems = useMemo(
    () => items.filter((item) => item.severity === 'warning'),
    [items]
  );

  const actionItems = useMemo(
    () => [...missingItems, ...warningItems],
    [missingItems, warningItems]
  );

  const readyItems = useMemo(
    () => items.filter((item) => item.severity === 'pass'),
    [items]
  );

  const handleGenerateDraftMenus = async () => {
    if (missingTopLevelMenus.length === 0) {
      toast.info('Không còn menu cấp 1 cần tạo.');
      return;
    }

    setIsGenerating(true);
    try {
      for (const [index, item] of missingTopLevelMenus.entries()) {
        await createMenu({
          title: item.label,
          type: 'standard',
          href: item.path,
          semantic_type: item.source,
          route_payload: item.route_payload ?? { path: item.path },
          active: false,
          order: 100 + index,
        });
      }
      toast.success(`Đã tạo ${missingTopLevelMenus.length} menu nháp. Kiểm tra rồi bật khi sẵn sàng.`);
      await loadIa();
    } catch (error) {
      console.error('Generate draft menus failed:', error);
      toast.error('Không tạo được menu nháp');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-16">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Trang website</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gắn menu và nội dung cho các đường dẫn quan trọng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/articles/create">
            <Button variant="outline" className="h-9">Tạo bài viết</Button>
          </Link>
          <Button onClick={handleGenerateDraftMenus} disabled={isGenerating || missingTopLevelMenus.length === 0} className="h-9 gap-2">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Sinh menu nháp
          </Button>
          <Button variant="outline" onClick={loadIa} className="h-9 gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-4">
          <StatusPill label="Sẵn sàng" value={`${score}%`} variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive'} />
          <StatusPill label="Cần xử lý" value={actionItems.length} variant={actionItems.length === 0 ? 'success' : 'warning'} />
          <StatusPill label="Thiếu nội dung" value={summary.missing} variant={summary.missing === 0 ? 'success' : 'destructive'} />
          <StatusPill label="Đã ổn" value={readyItems.length} variant="success" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {(actionItems.length > 0 ? actionItems : readyItems.slice(0, 8)).map((item) => (
          <PageCard key={`${item.path}-${item.severity}`} item={item} />
        ))}
      </div>

      {actionItems.length === 0 && readyItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">Chưa có dữ liệu trang.</CardContent>
        </Card>
      )}

      {readyItems.length > 8 && actionItems.length === 0 && (
        <div className="text-center text-xs text-slate-500">Còn {readyItems.length - 8} trang đã ổn.</div>
      )}
    </div>
  );
}

function StatusPill({ label, value, variant }: { label: string; value: number | string; variant: 'success' | 'warning' | 'destructive' }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      </div>
      <Badge variant={variant}>{variant === 'success' ? 'Ổn' : 'Xem lại'}</Badge>
    </div>
  );
}

function PageCard({ item }: { item: AdminIaComplianceItem }) {
  const isContentMissing = item.severity === 'missing';
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{item.label}</span>
            <span className="truncate text-xs font-normal text-slate-500">{item.path}</span>
          </span>
          <div className="flex items-center gap-2">
            <Link href={item.path} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" className="h-7 gap-1 px-2 text-xs">
                Mở trang
                <ExternalLink size={13} />
              </Button>
            </Link>
            <RouteStatusBadge severity={item.severity} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">{humanMessage(item)}</div>
        <div className="flex flex-wrap gap-2">
          {isContentMissing ? (
            <Link href="/admin/articles/create">
              <Button variant="outline" className="h-8 px-3 text-xs">Tạo bài viết</Button>
            </Link>
          ) : null}
          {!item.menu_covered && item.resolvable ? (
            <Link href="/admin/menus">
              <Button variant="outline" className="h-8 px-3 text-xs">Vào menu</Button>
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function humanMessage(item: AdminIaComplianceItem) {
  if (item.severity === 'pass') {
    return 'Đã có menu và dữ liệu.';
  }

  if (item.severity === 'missing') {
    return item.source === 'static_child'
      ? 'Chưa gắn bài viết cho trang này.'
      : 'Thiếu dữ liệu để mở trang này.';
  }

  return 'Trang có dữ liệu, nhưng chưa nằm trong menu.';
}

function RouteStatusBadge({ severity }: { severity: AdminIaComplianceItem['severity'] }) {
  if (severity === 'pass') {
    return <Badge variant="success">Ổn</Badge>;
  }

  if (severity === 'missing') {
    return <Badge variant="destructive">Thiếu nội dung</Badge>;
  }

  return <Badge variant="warning">Thiếu menu</Badge>;
}

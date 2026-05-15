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
  type AdminIaTemplateGroup,
} from '@/lib/api/admin';

const isTopLevelRoute = (path: string) => path === '/' || path.split('/').filter(Boolean).length === 1;
const MAX_QUICK_ITEMS = 8;

export default function InformationArchitecturePage() {
  const [groups, setGroups] = useState<AdminIaTemplateGroup[]>([]);
  const [items, setItems] = useState<AdminIaComplianceItem[]>([]);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState({ total: 0, passed: 0, warnings: 0, missing: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadIa = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminIa();
      setGroups(response.data.groups);
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

  const quickItems = useMemo(
    () => [...missingItems, ...warningItems].slice(0, MAX_QUICK_ITEMS),
    [missingItems, warningItems]
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sơ đồ trang</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Trang nào đã ổn, trang nào cần thêm menu hoặc nội dung.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={loadIa} className="h-9 gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button onClick={handleGenerateDraftMenus} disabled={isGenerating || missingTopLevelMenus.length === 0} className="h-9 gap-2">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Sinh menu nháp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Sẵn sàng" value={`${score}%`} variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive'} />
        <SummaryCard label="Đã ổn" value={summary.passed} variant="success" />
        <SummaryCard label="Thiếu menu" value={summary.warnings} variant="warning" />
        <SummaryCard label="Thiếu nội dung" value={summary.missing} variant="destructive" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
            <span>Cần xử lý</span>
            <Link href="/admin/menus">
              <Button variant="outline" className="h-7 gap-1 px-2 text-xs">
                Quản lý menu
                <ExternalLink size={13} />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quickItems.length === 0 ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              Các trang chính đã ổn.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {quickItems.map((item) => (
                <IssueRow key={`${item.path}-${item.severity}`} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {groups.map((group) => (
          <Card key={group.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.items.map((item) => (
                <div key={item.path} className="space-y-2">
                  <IaRouteRow item={items.find((entry) => entry.path === item.path)} label={item.label} path={item.path} />
                  {item.children && item.children.length > 0 && (
                    <div className="ml-3 space-y-2 border-l border-slate-200 pl-3 dark:border-slate-800">
                      {item.children.map((child) => (
                        <IaRouteRow
                          key={child.path}
                          item={items.find((entry) => entry.path === child.path)}
                          label={child.label}
                          path={child.path}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, variant }: { label: string; value: number | string; variant: 'success' | 'warning' | 'destructive' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <div className="flex items-end justify-between gap-2">
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
          <Badge variant={variant}>{variant === 'success' ? 'Ổn' : 'Xem lại'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function IaRouteRow({ item, label, path, compact = false }: { item?: AdminIaComplianceItem; label: string; path: string; compact?: boolean }) {
  const severity = item?.severity ?? 'warning';
  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className={compact ? 'text-sm font-medium text-slate-800 dark:text-slate-100' : 'font-medium text-slate-900 dark:text-slate-100'}>
          {label}
        </div>
        <div className="truncate font-mono text-xs text-slate-500">{path}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RouteStatusBadge severity={severity} />
        <Link href={path} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="h-7 px-2 text-xs">Mở</Button>
        </Link>
      </div>
    </div>
  );
}

function IssueRow({ item }: { item: AdminIaComplianceItem }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 truncate font-medium text-slate-900 dark:text-slate-100">{item.label}</div>
        <RouteStatusBadge severity={item.severity} />
      </div>
      <div className="truncate font-mono text-xs text-slate-500">{item.path}</div>
      <div className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</div>
    </div>
  );
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

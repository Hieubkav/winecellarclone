'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, FolderTree, Loader2, RefreshCw, Sparkles } from 'lucide-react';
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
      console.error('Load IA failed:', error);
      toast.error('Không tải được dữ liệu IA');
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
      toast.success(`Đã tạo ${missingTopLevelMenus.length} menu nháp. Kiểm tra rồi bật active khi sẵn sàng.`);
      await loadIa();
    } catch (error) {
      console.error('Generate IA draft menus failed:', error);
      toast.error('Không tạo được menu nháp từ IA');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Kiến trúc thông tin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi IA theo chuẩn chị Ngân, kiểm tra route/menu/sitemap và sinh menu nháp an toàn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={loadIa} className="gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button onClick={handleGenerateDraftMenus} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Sinh menu nháp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Tuân thủ IA chị Ngân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{score}%</div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <MetricCard label="Đã phủ menu" value={summary.passed} tone="success" />
        <MetricCard label="Thiếu menu" value={summary.warnings} tone="warning" />
        <MetricCard label="Thiếu taxonomy" value={summary.missing} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree size={18} />
              Cây IA đề xuất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {groups.map((group) => (
              <section key={group.key} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.path} className="space-y-2">
                      <IaRouteRow item={items.find((entry) => entry.path === item.path)} label={item.label} path={item.path} />
                      {item.children && item.children.length > 0 && (
                        <div className="ml-4 space-y-2 border-l border-slate-200 pl-4 dark:border-slate-800">
                          {item.children.map((child) => (
                            <IaRouteRow
                              key={child.path}
                              item={items.find((entry) => entry.path === child.path)}
                              label={child.label}
                              path={child.path}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động an toàn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Nút sinh menu chỉ tạo menu cấp 1 ở trạng thái <strong>inactive</strong>, không tự publish ra header.
              </p>
              <p>
                Sau khi sinh, vào <Link href="/admin/menus" className="font-medium text-blue-600 hover:underline">Menu Builder</Link> để kiểm tra, kéo thả và bật active.
              </p>
              <Badge variant={missingTopLevelMenus.length > 0 ? 'warning' : 'success'}>
                {missingTopLevelMenus.length} menu cấp 1 có thể tạo nháp
              </Badge>
            </CardContent>
          </Card>

          <IssueCard title="Thiếu taxonomy / slug lệch" items={missingItems} empty="Không có lỗi taxonomy nghiêm trọng." />
          <IssueCard title="Có route nhưng chưa phủ menu" items={warningItems.slice(0, 12)} empty="Menu đã phủ các route quan trọng." />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: 'success' | 'warning' | 'danger' }) {
  const color = tone === 'success' ? 'text-emerald-600' : tone === 'warning' ? 'text-amber-600' : 'text-red-600';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function IaRouteRow({ item, label, path }: { item?: AdminIaComplianceItem; label: string; path: string }) {
  const severity = item?.severity ?? 'warning';
  const badgeVariant = severity === 'pass' ? 'success' : severity === 'missing' ? 'destructive' : 'warning';
  const icon = severity === 'pass'
    ? <CheckCircle2 size={14} className="text-emerald-600" />
    : <AlertTriangle size={14} className={severity === 'missing' ? 'text-red-600' : 'text-amber-600'} />;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-slate-800 dark:text-slate-100">{label}</span>
        </div>
        <div className="mt-1 font-mono text-xs text-slate-500">{path}</div>
        {item?.message && <div className="mt-1 text-xs text-slate-500">{item.message}</div>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={badgeVariant}>{severity === 'pass' ? 'Đã phủ' : severity === 'missing' ? 'Thiếu data' : 'Chưa vào menu'}</Badge>
        {item?.source && <Badge variant="outline">{item.source}</Badge>}
      </div>
    </div>
  );
}

function IssueCard({ title, items, empty }: { title: string; items: AdminIaComplianceItem[]; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.path}-${item.severity}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-100">{item.label}</div>
                <div className="font-mono text-xs text-slate-500">{item.path}</div>
                <p className="mt-1 text-xs text-slate-500">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Menu as MenuIcon, Layers, Link as LinkIcon } from 'lucide-react';
import { Button, Card, Skeleton } from '../components/ui';
import { 
  fetchAdminMenus, 
  type AdminMenuDetail,
} from '@/lib/api/admin';
import { toast } from 'sonner';
import { MenuBuilder } from './MenuBuilder';
import { MenuPreview } from './MenuPreview';

export default function MenusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<AdminMenuDetail[]>([]);

  const loadMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const listRes = await fetchAdminMenus({ per_page: 100, with_items: 1 });
      setMenus(listRes.data as AdminMenuDetail[]);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      toast.error('Không thể tải danh sách menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Stats
  const totalBlocks = menus.reduce((acc, m) => acc + (m.blocks?.length || 0), 0);
  const totalItems = menus.reduce((acc, m) => 
    acc + (m.blocks?.reduce((a, b) => a + (b.items?.length || 0), 0) || 0), 0
  );
  const activeMenus = menus.filter(m => m.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Menu Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý menu điều hướng trực quan - Kéo thả, chỉnh sửa inline
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 border-r border-slate-200 dark:border-slate-700 pr-4">
            <span className="flex items-center gap-1">
              <MenuIcon size={14} />
              {activeMenus}/{menus.length} menu
            </span>
            <span className="flex items-center gap-1">
              <Layers size={14} />
              {totalBlocks} blocks
            </span>
            <span className="flex items-center gap-1">
              <LinkIcon size={14} />
              {totalItems} items
            </span>
          </div>
          <Button variant="outline" onClick={loadMenus} className="gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Menu Builder */}
      <Card className="p-4">
        <MenuBuilder menus={menus} onRefresh={loadMenus} />
      </Card>

      {/* Preview - Full Width at bottom */}
      <MenuPreview menus={menus} />
    </div>
  );
}

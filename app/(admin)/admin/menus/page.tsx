'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui';
import { 
  fetchAdminMenus, 
  type AdminMenuDetail,
} from '@/lib/api/admin';
import { toast } from 'sonner';
import { MenuTreeBuilder } from './MenuTreeBuilder';

export default function MenusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<AdminMenuDetail[]>([]);

  const loadMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const listRes = await fetchAdminMenus({ per_page: 100, with_tree: 1 });
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Header Menu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý menu điều hướng chính trên thanh header
          </p>
        </div>
        <Button variant="outline" onClick={loadMenus} className="gap-2">
          <RefreshCw size={16} />
          Làm mới
        </Button>
      </div>

      <MenuTreeBuilder menus={menus} onRefresh={loadMenus} />
    </div>
  );
}

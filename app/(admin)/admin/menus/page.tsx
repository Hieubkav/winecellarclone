'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Loader2, Menu as MenuIcon } from 'lucide-react';
import { Button, Card, Skeleton } from '../components/ui';
import { 
  fetchAdminMenus, 
  fetchAdminMenu,
  createMenu,
  type AdminMenu,
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
      // Fetch list first
      const listRes = await fetchAdminMenus({ per_page: 100 });
      
      // Then fetch full details for each menu (with blocks & items)
      const detailPromises = listRes.data.map(m => fetchAdminMenu(m.id));
      const detailResults = await Promise.all(detailPromises);
      
      const fullMenus = detailResults.map(r => r.data);
      setMenus(fullMenus);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      toast.error('Không thể tải danh sách menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const handleAddMenu = async () => {
    const title = prompt('Nhập tiêu đề menu:');
    if (!title?.trim()) return;

    const type = prompt('Loại menu (để trống nếu không cần):', '') || null;

    try {
      const result = await createMenu({
        title: title.trim(),
        type: type?.trim() || null,
        active: true,
      });

      if (result.success) {
        toast.success('Đã tạo menu mới');
        loadMenus(); // Refresh
      }
    } catch (error) {
      console.error('Failed to create menu:', error);
      toast.error('Không thể tạo menu');
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Menu Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý menu điều hướng trực quan - Kéo thả, chỉnh sửa ngay trên trang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadMenus} className="gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button onClick={handleAddMenu} className="gap-2">
            <Plus size={16} />
            Thêm menu
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Menu Builder */}
        <div className="xl:col-span-2">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MenuIcon size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Cấu trúc Menu ({menus.length})
              </h2>
            </div>
            <MenuBuilder menus={menus} onRefresh={loadMenus} />
          </Card>
        </div>

        {/* Preview & Stats */}
        <div className="space-y-4">
          <MenuPreview menus={menus} />

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">
              Thống kê
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng menu:</span>
                <span className="font-medium">{menus.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đang hiện:</span>
                <span className="font-medium text-green-600">
                  {menus.filter(m => m.active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đang ẩn:</span>
                <span className="font-medium text-slate-400">
                  {menus.filter(m => !m.active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng blocks:</span>
                <span className="font-medium">
                  {menus.reduce((acc, m) => acc + (m.blocks?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng items:</span>
                <span className="font-medium">
                  {menus.reduce((acc, m) => 
                    acc + (m.blocks?.reduce((a, b) => a + (b.items?.length || 0), 0) || 0), 0
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-2">
              Mẹo sử dụng
            </h3>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5">
              <li>• <strong>Kéo thả</strong> icon ≡ để sắp xếp menus</li>
              <li>• <strong>Click vào text</strong> để chỉnh sửa ngay</li>
              <li>• <strong>Icon mắt</strong> để bật/tắt hiển thị</li>
              <li>• Menu hiển thị trên header theo thứ tự</li>
              <li>• Block = nhóm links trong dropdown</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

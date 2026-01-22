'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../../../components/ui';
import { fetchAdminHomeComponent, updateHomeComponent } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function HomeComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [componentId, setComponentId] = useState<number | null>(null);
  
  const [type, setType] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setComponentId(id);
      loadComponent(id);
    });
  }, []);

  const loadComponent = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await fetchAdminHomeComponent(id);
      const component = result.data;
      
      setType(component.type);
      setConfigJson(JSON.stringify(component.config, null, 2));
      setOrder(component.order.toString());
      setActive(component.active);
    } catch (error) {
      console.error('Failed to load component:', error);
      toast.error('Không thể tải thành phần');
      router.push('/admin/home-components');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!componentId) return;
    
    if (!type.trim()) {
      toast.error('Vui lòng nhập loại thành phần');
      return;
    }

    // Validate JSON
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(configJson);
    } catch (error) {
      toast.error('Cấu hình JSON không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        type: type.trim(),
        config,
        order: parseInt(order),
        active,
      };

      const result = await updateHomeComponent(componentId, data);
      
      if (result.success) {
        toast.success(result.message || 'Cập nhật thành phần thành công');
        router.push('/admin/home-components');
      }
    } catch (error) {
      console.error('Failed to update component:', error);
      toast.error('Không thể cập nhật thành phần. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <div className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/home-components">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa thành phần</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật cấu hình thành phần trang chủ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">
                Loại thành phần <span className="text-red-500">*</span>
              </Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="hero_carousel, dual_banner, category_grid, ..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config">
                Cấu hình (JSON) <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="config"
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder='{"title": "Tiêu đề", "items": []}'
                className="w-full min-h-[300px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono resize-y"
                required
              />
              <p className="text-xs text-slate-500">
                Chỉnh sửa cấu hình JSON. Lưu ý: JSON không hợp lệ sẽ không được lưu.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Thứ tự hiển thị</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0, 1, 2, ..."
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Hiển thị trên trang chủ
              </Label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/home-components">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

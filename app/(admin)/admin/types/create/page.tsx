'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';
import { createProductType } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function ProductTypeCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState('true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên phân loại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductType({
        name: name.trim(),
        order: order ? Number(order) : null,
        active: active === 'true',
      });
      toast.success('Đã tạo phân loại thành công');
      router.push('/admin/types');
    } catch (error) {
      console.error('Failed to create type:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        toast.error(String((error.payload as { message?: string }).message ?? 'Tạo phân loại thất bại.'));
      } else {
        toast.error('Tạo phân loại thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/types">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm phân loại</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo mới phân loại sản phẩm</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Tên phân loại</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Rượu vang"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự hiển thị</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="active">Trạng thái</Label>
                <select
                  id="active"
                  className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/admin/types">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu phân loại'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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
      toast.error('Vui lòng nhập tên nhóm sản phẩm.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductType({
        name: name.trim(),
        order: order ? Number(order) : null,
        active: active === 'true',
      });
      toast.success('Đã tạo nhóm sản phẩm thành công');
      router.push('/admin/product-types');
    } catch (error) {
      console.error('Failed to create type:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        toast.error(String((error.payload as { message?: string }).message ?? 'Tạo nhóm sản phẩm thất bại.'));
      } else {
        toast.error('Tạo nhóm sản phẩm thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/product-types">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm nhóm sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo mới nhóm phân loại sản phẩm</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhóm sản phẩm</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Rượu vang"
                required
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

            <div className="flex justify-end gap-3">
              <Link href="/admin/product-types">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu nhóm sản phẩm'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

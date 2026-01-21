'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Skeleton } from '../../../components/ui';
import { fetchAdminProductType, updateProductType } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductTypeEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState('true');

  useEffect(() => {
    async function loadType() {
      setIsLoading(true);
      try {
        const res = await fetchAdminProductType(Number(id));
        const type = res.data;
        setName(type.name);
        setSlug(type.slug);
        setOrder(type.order !== null && type.order !== undefined ? String(type.order) : '');
        setActive(type.active ? 'true' : 'false');
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to load type:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadType();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên phân loại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProductType(Number(id), {
        name: name.trim(),
        order: order ? Number(order) : null,
        active: active === 'true',
      });
      toast.success('Đã lưu thay đổi thành công');
    } catch (error) {
      console.error('Failed to update type:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        toast.error(String((error.payload as { message?: string }).message ?? 'Cập nhật phân loại thất bại.'));
      } else {
        toast.error('Cập nhật phân loại thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Card>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy phân loại</h2>
        <p className="text-slate-500 mb-4">Phân loại này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/admin/types">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/types">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cập nhật phân loại</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chỉnh sửa thông tin phân loại</p>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} disabled />
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
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

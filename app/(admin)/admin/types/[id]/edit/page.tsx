'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, X } from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Skeleton, Badge } from '../../../components/ui';
import { 
  fetchAdminProductType, 
  updateProductType, 
  fetchAdminCatalogAttributeGroups,
  type AdminCatalogAttributeGroup 
} from '@/lib/api/admin';
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
  const [allAttributes, setAllAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [linkedAttributes, setLinkedAttributes] = useState<AdminCatalogAttributeGroup[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [typeRes, attributesRes] = await Promise.all([
          fetchAdminProductType(Number(id)),
          fetchAdminCatalogAttributeGroups({ per_page: 100 })
        ]);
        
        const type = typeRes.data;
        setName(type.name);
        setSlug(type.slug);
        setOrder(type.order !== null && type.order !== undefined ? String(type.order) : '');
        setActive(type.active ? 'true' : 'false');
        
        setAllAttributes(attributesRes.data);
        
        // Filter attributes linked to this type
        const linked = attributesRes.data.filter(attr => 
          attr.product_types.some(pt => pt.id === Number(id))
        );
        setLinkedAttributes(linked);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to load data:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
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

  const getFilterTypeBadge = (filterType: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'info' | 'success' }> = {
      checkbox: { label: 'Checkbox', variant: 'info' },
      radio: { label: 'Radio', variant: 'success' },
      range: { label: 'Range', variant: 'secondary' },
      color: { label: 'Color', variant: 'default' },
    };
    const config = badges[filterType] || { label: filterType, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên phân loại <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                value={slug} 
                disabled 
                className="bg-slate-50 dark:bg-slate-900 text-slate-500"
              />
              <p className="text-xs text-slate-500">Slug không thể thay đổi sau khi tạo</p>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/admin/types">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Linked Attributes Section */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter size={20} className="text-purple-600" />
                Nhóm thuộc tính liên kết
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {linkedAttributes.length} nhóm thuộc tính được sử dụng cho phân loại này
              </p>
            </div>
            <Link href={`/admin/attributes?type_id=${id}`}>
              <Button variant="outline" size="sm">
                Quản lý thuộc tính
              </Button>
            </Link>
          </div>
        </div>
        <CardContent className="p-4">
          {linkedAttributes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkedAttributes.map(attr => (
                <div 
                  key={attr.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                      <Filter size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{attr.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {attr.code}
                        </code>
                        {getFilterTypeBadge(attr.filter_type)}
                        <Badge variant="secondary" className="text-xs">
                          {attr.terms_count} giá trị
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/attributes/${attr.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Xem
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Filter size={32} className="mx-auto mb-2 text-slate-300" />
              <p>Chưa có nhóm thuộc tính nào được liên kết</p>
              <p className="text-sm mt-1">Thuộc tính được quản lý trong Filament Admin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

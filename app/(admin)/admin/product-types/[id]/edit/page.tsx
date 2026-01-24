'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, X, Plus, Edit, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Skeleton, Badge } from '../../../components/ui';
import { 
  fetchAdminProductType, 
  updateProductType, 
  fetchAdminCatalogAttributeGroups,
  attachAttributeGroupToType,
  detachAttributeGroupFromType,
  type AdminCatalogAttributeGroup 
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ProductTypeEditPage({ params }: PageProps) {
  const { id } = use(params);
  const _router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [order, setOrder] = useState('');
  const [active, setActive] = useState('true');
  const [allAttributes, setAllAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [linkedAttributes, setLinkedAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

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
        setIsNewRecord(false);
        setOrder(type.order !== null && type.order !== undefined ? String(type.order) : '');
        setActive(type.active ? 'true' : 'false');
        
        setAllAttributes(attributesRes.data);
        
        if (type.attribute_groups) {
          const attrGroups = type.attribute_groups;
          const linkedIds = new Set(attrGroups.map((g: any) => g.id));
          const linked = attributesRes.data
            .filter(attr => linkedIds.has(attr.id))
            .map(attr => {
              const typeGroup = attrGroups.find((g: any) => g.id === attr.id);
              return {
                ...attr,
                position: typeGroup?.position ?? 0,
              };
            })
            .sort((a, b) => a.position - b.position);
          setLinkedAttributes(linked as any);
        }
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
      toast.error('Vui lòng nhập tên nhóm sản phẩm.');
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
        toast.error(String((error.payload as { message?: string }).message ?? 'Cập nhật nhóm sản phẩm thất bại.'));
      } else {
        toast.error('Cập nhật nhóm sản phẩm thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAttributeGroup = async (groupId: number) => {
    setIsAttaching(true);
    try {
      await attachAttributeGroupToType(Number(id), groupId, linkedAttributes.length);
      toast.success('Đã thêm nhóm thuộc tính');
      
      const typeRes = await fetchAdminProductType(Number(id));
      const type = typeRes.data;
      if (type.attribute_groups) {
          const attrGroups = type.attribute_groups;
          const linkedIds = new Set(attrGroups.map((g: any) => g.id));
        const linked = allAttributes
          .filter(attr => linkedIds.has(attr.id))
            .map(attr => {
              const typeGroup = attrGroups.find((g: any) => g.id === attr.id);
              return {
                ...attr,
                position: typeGroup?.position ?? 0,
              };
            })
          .sort((a, b) => a.position - b.position);
        setLinkedAttributes(linked as any);
      }
      setShowAddPopup(false);
    } catch (error) {
      console.error('Failed to add attribute group:', error);
      toast.error('Thêm nhóm thuộc tính thất bại');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleRemoveAttributeGroup = async (groupId: number) => {
    try {
      await detachAttributeGroupFromType(Number(id), groupId);
      toast.success('Đã xóa nhóm thuộc tính');
      setLinkedAttributes(prev => prev.filter(attr => attr.id !== groupId));
    } catch (error) {
      console.error('Failed to remove attribute group:', error);
      toast.error('Xóa nhóm thuộc tính thất bại');
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
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy nhóm sản phẩm</h2>
        <p className="text-slate-500 mb-4">Nhóm sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/admin/product-types">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/product-types">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cập nhật nhóm sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chỉnh sửa thông tin nhóm sản phẩm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhóm sản phẩm <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || isNewRecord) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input 
                  id="slug" 
                  value={slug}
                  onChange={(e) => isNewRecord && setSlug(generateSlug(e.target.value))}
                  disabled={!isNewRecord}
                  className={!isNewRecord ? "bg-slate-50 dark:bg-slate-900 text-slate-500" : ""}
                />
                {!isNewRecord && (
                  <Badge variant="secondary" className="px-3 flex items-center whitespace-nowrap">
                    Đã khóa
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isNewRecord ? 'Slug tự động từ tên, có thể chỉnh sửa trước khi lưu' : 'Slug không thể thay đổi sau khi tạo'}
              </p>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/admin/product-types">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter size={20} className="text-red-600" />
                Nhóm thuộc tính liên kết
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {linkedAttributes.length} nhóm thuộc tính được sử dụng cho nhóm sản phẩm này
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddPopup(true)}>
              <Plus size={16} className="mr-2" />
              Thêm thuộc tính
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          {linkedAttributes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkedAttributes.map(attr => {
                const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                  ? (LucideIcons as any)[attr.icon_path]
                  : Filter;
                
                return (
                  <div 
                    key={attr.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                        <IconComponent size={16} className="text-red-600 dark:text-red-400" />
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
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/attribute-groups/${attr.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Xem chi tiết">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveAttributeGroup(attr.id)}
                        title="Xóa liên kết"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Filter size={32} className="mx-auto mb-2 text-slate-300" />
              <p>Chưa có nhóm thuộc tính nào được liên kết</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddPopup(true)}
              >
                <Plus size={16} className="mr-2" />
                Thêm thuộc tính đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thêm nhóm thuộc tính</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowAddPopup(false)}
              >
                <X size={20} />
              </Button>
            </div>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {allAttributes
                  .filter(attr => !linkedAttributes.some(linked => linked.id === attr.id))
                  .map(attr => {
                    const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                      ? (LucideIcons as any)[attr.icon_path]
                      : Filter;
                    
                    return (
                      <button
                        key={attr.id}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleAddAttributeGroup(attr.id)}
                        disabled={isAttaching}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                            <IconComponent size={16} className="text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{attr.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {attr.code}
                              </code>
                              <Badge variant="secondary" className="text-xs">
                                {attr.terms_count} giá trị
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Plus size={16} className="text-slate-400" />
                      </button>
                    );
                  })}
                {allAttributes.filter(attr => !linkedAttributes.some(linked => linked.id === attr.id)).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>Tất cả nhóm thuộc tính đã được liên kết</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

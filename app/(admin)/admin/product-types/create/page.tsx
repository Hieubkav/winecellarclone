'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, X, Plus, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Badge, Skeleton } from '../../components/ui';
import { 
  createProductType, 
  fetchAdminCatalogAttributeGroups, 
  syncAttributeGroupsToType,
  type AdminCatalogAttributeGroup 
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function ProductTypeCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [active, setActive] = useState('true');
  
  const [allAttributes, setAllAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<AdminCatalogAttributeGroup[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  async function loadAttributes() {
    setIsLoading(true);
    try {
      const res = await fetchAdminCatalogAttributeGroups({ per_page: 100 });
      setAllAttributes(res.data);
    } catch (error) {
      console.error('Failed to load attributes:', error);
      toast.error('Không thể tải danh sách thuộc tính');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddAttribute = (attr: AdminCatalogAttributeGroup) => {
    if (!selectedAttributes.find(a => a.id === attr.id)) {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
    setShowAddPopup(false);
  };

  const handleRemoveAttribute = (attrId: number) => {
    setSelectedAttributes(selectedAttributes.filter(a => a.id !== attrId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...selectedAttributes];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setSelectedAttributes(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm sản phẩm.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProductType({
        name: name.trim(),
        order: order ? Number(order) : null,
        active: active === 'true',
      });
      
      const newTypeId = result.data?.id;
      
      if (newTypeId && selectedAttributes.length > 0) {
        const groups = selectedAttributes.map((attr, index) => ({
          id: attr.id,
          position: index + 1,
        }));
        
        await syncAttributeGroupsToType(newTypeId, groups);
      }
      
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhóm sản phẩm <span className="text-red-500">*</span></Label>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/admin/product-types">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo nhóm sản phẩm'}
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
                Nhóm thuộc tính
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {selectedAttributes.length} thuộc tính đã chọn - Kéo thả để sắp xếp
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddPopup(true)} type="button">
              <Plus size={16} className="mr-2" />
              Thêm thuộc tính
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          {selectedAttributes.length > 0 ? (
            <div className="space-y-2">
              {selectedAttributes.map((attr, index) => {
                const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                  ? (LucideIcons as any)[attr.icon_path]
                  : Filter;
                
                return (
                  <div
                    key={attr.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-move hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <GripVertical size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <IconComponent size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      type="button"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Filter size={32} className="mx-auto mb-2 text-slate-300" />
              <p>Chưa chọn thuộc tính nào</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddPopup(true)}
                type="button"
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
                type="button"
              >
                <X size={20} />
              </Button>
            </div>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {allAttributes
                  .filter(attr => !selectedAttributes.some(selected => selected.id === attr.id))
                  .map(attr => {
                    const IconComponent = attr.icon_path && (LucideIcons as any)[attr.icon_path]
                      ? (LucideIcons as any)[attr.icon_path]
                      : Filter;
                    
                    return (
                      <button
                        key={attr.id}
                        type="button"
                        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleAddAttribute(attr)}
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
                {allAttributes.filter(attr => !selectedAttributes.some(selected => selected.id === attr.id)).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>Tất cả thuộc tính đã được chọn</p>
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

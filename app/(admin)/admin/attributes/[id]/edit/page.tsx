'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Skeleton, Badge } from '../../../components/ui';
import { IconPicker } from '../../../components/IconPicker';
import { 
  fetchAdminCatalogAttributeGroup, 
  updateCatalogAttributeGroup,
  type AdminCatalogAttributeGroup 
} from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AttributeGroupEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [filterType, setFilterType] = useState('checkbox');
  const [inputType, setInputType] = useState<string>('');
  const [isFilterable, setIsFilterable] = useState(true);
  const [position, setPosition] = useState('');
  const [iconPath, setIconPath] = useState('');
  
  const [terms, setTerms] = useState<Array<{ id: number; name: string; slug: string; position: number }>>([]);
  const [productTypes, setProductTypes] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetchAdminCatalogAttributeGroup(Number(id));
        const attr = res.data;
        
        setCode(attr.code);
        setName(attr.name);
        setFilterType(attr.filter_type);
        setInputType(attr.input_type || '');
        setIsFilterable(attr.is_filterable);
        setPosition(attr.position !== null && attr.position !== undefined ? String(attr.position) : '');
        setIconPath(attr.icon_path || '');
        
        // @ts-ignore - terms exists in detailed response
        setTerms(attr.terms || []);
        setProductTypes(attr.product_types || []);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to load attribute group:', error);
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
      toast.error('Vui lòng nhập tên thuộc tính.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCatalogAttributeGroup(Number(id), {
        name: name.trim(),
        filter_type: filterType,
        input_type: inputType || null,
        is_filterable: isFilterable,
        position: position ? Number(position) : null,
        icon_path: iconPath.trim() || null,
      });
      toast.success('Đã lưu thay đổi thành công');
    } catch (error) {
      console.error('Failed to update attribute group:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        toast.error(String((error.payload as { message?: string }).message ?? 'Cập nhật thuộc tính thất bại.'));
      } else {
        toast.error('Cập nhật thuộc tính thất bại. Vui lòng thử lại.');
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
            {[1, 2, 3, 4].map(i => (
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
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy nhóm thuộc tính</h2>
        <p className="text-slate-500 mb-4">Nhóm thuộc tính này có thể đã bị xóa hoặc không tồn tại.</p>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cập nhật nhóm thuộc tính</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chỉnh sửa thông tin nhóm thuộc tính</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Mã thuộc tính</Label>
              <Input 
                id="code" 
                value={code} 
                disabled 
                className="bg-slate-50 dark:bg-slate-900 text-slate-500"
              />
              <p className="text-xs text-slate-500">Mã không thể thay đổi sau khi tạo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên thuộc tính <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Ví dụ: Xuất xứ"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterType">Loại filter</Label>
                <select
                  id="filterType"
                  className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="checkbox">Checkbox (chọn nhiều)</option>
                  <option value="radio">Radio (chọn một)</option>
                  <option value="range">Range (khoảng giá trị)</option>
                  <option value="color">Color (màu sắc)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inputType">Loại input</Label>
                <select
                  id="inputType"
                  className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                >
                  <option value="">Không có</option>
                  <option value="select">Select</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconPath">Icon</Label>
              <IconPicker
                value={iconPath}
                onChange={setIconPath}
              />
              <p className="text-xs text-slate-500">Chọn icon từ thư viện Lucide</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFilterable"
                checked={isFilterable}
                onChange={(e) => setIsFilterable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="isFilterable">Có thể lọc</Label>
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

      {/* Product Types Section */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag size={20} className="text-blue-600" />
            Phân loại sử dụng thuộc tính này
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {productTypes.length > 0 
              ? `${productTypes.length} phân loại đang sử dụng` 
              : 'Chưa có phân loại nào sử dụng'}
          </p>
        </div>
        <CardContent className="p-4">
          {productTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {productTypes.map(type => (
                <Link key={type.id} href={`/admin/types/${type.id}/edit`}>
                  <Badge variant="info" className="cursor-pointer hover:bg-blue-600">
                    {type.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Info size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Thuộc tính này chưa được liên kết với phân loại nào</p>
              <p className="text-xs mt-1">Quản lý liên kết trong Filament Admin</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms Section */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Giá trị thuộc tính
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {terms.length} giá trị
          </p>
        </div>
        <CardContent className="p-4">
          {terms.length > 0 ? (
            <div className="space-y-2">
              {terms.map((term, index) => (
                <div 
                  key={term.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 font-mono w-8">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{term.name}</div>
                      <code className="text-xs text-slate-500">{term.slug}</code>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Vị trí: {term.position}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p className="text-sm">Chưa có giá trị nào</p>
              <p className="text-xs mt-1">Quản lý giá trị trong Filament Admin</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';
import { IconPicker } from '../../components/IconPicker';
import { createCatalogAttributeGroup } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

type FilterType = 'checkbox' | 'radio' | 'range' | 'color';

function generateCode(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function AttributeGroupCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('checkbox');
  const [inputType, setInputType] = useState<string>('');
  const [isFilterable, setIsFilterable] = useState(true);
  const [iconPath, setIconPath] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm thuộc tính.');
      return;
    }
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã nhóm thuộc tính.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCatalogAttributeGroup({
        code: code.trim(),
        name: name.trim(),
        filter_type: filterType,
        input_type: inputType.trim() || null,
        is_filterable: Boolean(isFilterable),
        icon_path: iconPath.trim() || null,
      });
      
      toast.success('Đã tạo nhóm thuộc tính thành công');
      
      if (result.data?.id) {
        router.push(`/admin/attribute-groups/${result.data.id}/edit`);
      } else {
        router.push('/admin/attribute-groups');
      }
    } catch (error) {
      console.error('Failed to create attribute group:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object') {
        const payload = error.payload as { 
          message?: string; 
          error?: string;
          errors?: Record<string, string[]>;
          details?: Record<string, string[]>;
        };
        const validationErrors = payload.errors || payload.details;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error(payload.message || payload.error || 'Tạo nhóm thuộc tính thất bại.');
        }
      } else {
        toast.error('Tạo nhóm thuộc tính thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/attribute-groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm nhóm thuộc tính</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tạo mới nhóm thuộc tính và giá trị filter</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="code">Mã thuộc tính <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ví dụ: origin"
                required
              />
              <p className="text-xs text-slate-500">
                Mã không thể thay đổi sau khi tạo. Sử dụng snake_case (chữ thường, dấu gạch dưới).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên thuộc tính <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(generateCode(e.target.value));
                  }
                }}
                placeholder="Ví dụ: Xuất xứ"
                required
              />
              <p className="text-xs text-slate-500">
                Mã sẽ tự động tạo từ tên nếu để trống
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterType">Loại filter</Label>
                <select
                  id="filterType"
                  className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
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

            <div className="flex justify-end gap-3">
              <Link href="/admin/attribute-groups">
                <Button type="button" variant="outline">Hủy bỏ</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo nhóm thuộc tính'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

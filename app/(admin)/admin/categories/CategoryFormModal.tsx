'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Card, Input, Label } from '../components/ui';
import { createCategory, updateCategory, type AdminCategory } from '@/lib/api/admin';
import type { ProductFilterOption } from '@/lib/api/products';

interface CategoryFormModalProps {
  category: AdminCategory | null;
  types: ProductFilterOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryFormModal({ category, types, onClose, onSuccess }: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type_id: '',
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type_id: category.type_id?.toString() || '',
        active: category.active,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        name: formData.name,
        type_id: formData.type_id ? Number(formData.type_id) : null,
        active: formData.active,
      };

      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type_id">Phân loại sản phẩm</Label>
            <select
              id="type_id"
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={formData.type_id}
              onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
            >
              <option value="">Chung (Tất cả phân loại)</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Danh mục chỉ hiển thị cho phân loại đã chọn</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="active" className="!mb-0">Hiển thị danh mục</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

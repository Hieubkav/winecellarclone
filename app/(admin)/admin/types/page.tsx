'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Tag, Search, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData } from '../components/TableUtilities';
import { deleteProductType, fetchAdminProductTypes, type AdminProductType } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';

export default function ProductTypesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [types, setTypes] = useState<AdminProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });

  useEffect(() => {
    async function loadTypes() {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { per_page: 100 };
        if (searchTerm) params.q = searchTerm;
        if (filterActive) params.active = filterActive;
        const res = await fetchAdminProductTypes(params);
        setTypes(res.data);
      } catch (error) {
        console.error('Failed to fetch types:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTypes();
  }, [searchTerm, filterActive]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return types;
    const lower = searchTerm.toLowerCase();
    return types.filter(t => t.name.toLowerCase().includes(lower) || t.slug.toLowerCase().includes(lower));
  }, [types, searchTerm]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteProductType(deleteConfirm);
      setDeleteConfirm(null);
      const res = await fetchAdminProductTypes({ per_page: 100, ...(filterActive ? { active: filterActive } : {}) });
      setTypes(res.data);
    } catch (error) {
      console.error('Failed to delete type:', error);
      if (error instanceof ApiError && error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
        alert(String((error.payload as { message?: string }).message ?? 'Xóa thất bại.'));
      } else {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Phân loại sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý phân loại ({types.length} phân loại)
          </p>
        </div>
        <Link href="/admin/types/create">
          <Button className="gap-2">
            <Plus size={16} />
            Thêm phân loại
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm phân loại..."
              className="pl-9 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Tạm ẩn</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Tên phân loại" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Slug</TableHead>
              <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(type => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                      <Tag size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">{type.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{type.slug}</code>
                </TableCell>
                <TableCell>{type.order ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant={type.active ? 'success' : 'secondary'}>
                    {type.active ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/types/${type.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Edit size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      aria-label="Delete"
                      onClick={() => setDeleteConfirm(type.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  {searchTerm ? 'Không tìm thấy phân loại phù hợp' : 'Chưa có phân loại nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
                <p className="text-sm text-slate-500 mt-1">Bạn có chắc chắn muốn xóa phân loại này?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

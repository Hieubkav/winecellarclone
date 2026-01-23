 'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Search, FolderTree, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { fetchAdminCategories, deleteCategory, bulkDeleteCategories, updateCategory, type AdminCategory } from '@/lib/api/admin';
import { fetchProductFilters, type ProductFilterOption } from '@/lib/api/products';
import CategoryFormModal from './CategoryFormModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CategoriesListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [types, setTypes] = useState<ProductFilterOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'name', label: 'Tên danh mục', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'type', label: 'Phân loại' },
    { key: 'products_count', label: 'Số SP' },
    { key: 'order', label: 'Thứ tự' },
    { key: 'active', label: 'Trạng thái', required: true },
    { key: 'actions', label: 'Hành động', required: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(c => c.required || ['name', 'type', 'products_count', 'active', 'actions'].includes(c.key)).map(c => c.key)
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (searchTerm) params.q = searchTerm;
      if (filterType) params.type_id = filterType;

      const [categoriesRes, filtersRes] = await Promise.all([
        fetchAdminCategories(params),
        fetchProductFilters(),
      ]);

      setCategories(categoriesRes.data);
      setTotalCategories(categoriesRes.meta.total);
      setTypes(filtersRes.types);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ 
      key, 
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
    }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const sortedData = useSortableData(categories, sortConfig);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(c => c.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteCategory(deleteConfirm.id);
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteCategories(selectedIds);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert(error?.message || 'Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    loadData();
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatus(id);
    try {
      await updateCategory(id, { active: !currentStatus });
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, active: !currentStatus } : c
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị danh mục' : 'Đã tắt hiển thị danh mục',
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingStatus(null);
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
            {[1, 2, 3, 4, 5].map(i => (
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý danh mục và phân loại sản phẩm • {totalCategories} danh mục
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          Thêm danh mục
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <BulkActionBar 
          selectedCount={selectedIds.length} 
          onDelete={() => setDeleteConfirm({ type: 'bulk' })} 
          onClearSelection={() => setSelectedIds([])} 
        />
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Tìm danh mục..." 
                className="pl-9 w-48" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <select 
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tất cả phân loại</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && (
                <TableHead className="w-[40px]">
                  <SelectCheckbox 
                    checked={selectedIds.length === sortedData.length && sortedData.length > 0} 
                    onChange={toggleSelectAll} 
                    indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} 
                  />
                </TableHead>
              )}
              {visibleColumns.includes('name') && (
                <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              )}
              {visibleColumns.includes('slug') && <TableHead>Slug</TableHead>}
              {visibleColumns.includes('type') && (
                <SortableHeader label="Phân loại" sortKey="type_name" sortConfig={sortConfig} onSort={handleSort} />
              )}
              {visibleColumns.includes('products_count') && (
                <SortableHeader label="Số SP" sortKey="products_count" sortConfig={sortConfig} onSort={handleSort} />
              )}
              {visibleColumns.includes('order') && (
                <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
              )}
              {visibleColumns.includes('active') && <TableHead>Trạng thái</TableHead>}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(category => (
              <TableRow key={category.id} className={selectedIds.includes(category.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && (
                  <TableCell>
                    <SelectCheckbox checked={selectedIds.includes(category.id)} onChange={() => toggleSelectItem(category.id)} />
                  </TableCell>
                )}
                {visibleColumns.includes('name') && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center">
                        <FolderTree size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('slug') && (
                  <TableCell>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{category.slug}</code>
                  </TableCell>
                )}
                {visibleColumns.includes('type') && (
                  <TableCell>
                    <Badge variant={category.type_id ? 'info' : 'secondary'}>
                      {category.type_name || 'Chung'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('products_count') && (
                  <TableCell>
                    <Badge variant="secondary">{category.products_count || 0}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('order') && (
                  <TableCell>
                    <Badge variant="secondary">{category.order ?? '-'}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('active') && (
                  <TableCell>
                    <div
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                        togglingStatus === category.id ? "opacity-50 cursor-wait" : "",
                        category.active ? "bg-green-500" : "bg-slate-300"
                      )}
                      onClick={() => handleToggleStatus(category.id, category.active)}
                      title={`Click để ${category.active ? 'ẩn' : 'hiển thị'}`}
                    >
                      <div className={cn(
                        "w-3 h-3 bg-white rounded-full transition-transform",
                        category.active ? "translate-x-2" : "-translate-x-2"
                      )} />
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/filter?category=${category.slug}`} target="_blank">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-600 hover:text-blue-700" 
                          title="Xem trên web"
                          aria-label="View on website"
                        >
                          <ExternalLink size={16} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setEditingCategory(category);
                          setIsFormOpen(true);
                        }}
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteConfirm({ type: 'single', id: category.id })}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterType 
                    ? 'Không tìm thấy kết quả phù hợp' 
                    : 'Chưa có danh mục nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-500">
              Hiển thị {sortedData.length} / {totalCategories} danh mục
            </span>
          </div>
        )}
      </Card>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {deleteConfirm.type === 'bulk' 
                    ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} danh mục đã chọn?`
                    : 'Bạn có chắc chắn muốn xóa danh mục này?'
                  }
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isFormOpen && (
        <CategoryFormModal
          category={editingCategory}
          types={types}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

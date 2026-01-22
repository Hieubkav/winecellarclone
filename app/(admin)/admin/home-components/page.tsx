'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Settings2, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar } from '../components/TableUtilities';
import { fetchAdminHomeComponents, deleteHomeComponent, bulkDeleteHomeComponents, type AdminHomeComponent } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function HomeComponentsListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [components, setComponents] = useState<AdminHomeComponent[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadComponents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminHomeComponents({ per_page: 100 });
      setComponents(result.data);
    } catch (error) {
      console.error('Failed to fetch components:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedData = useSortableData(components, sortConfig);

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
        await deleteHomeComponent(deleteConfirm.id);
        toast.success('Xóa thành công');
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteHomeComponents(selectedIds);
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} thành phần`);
      }
      setDeleteConfirm(null);
      loadComponents();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card><div className="p-4 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Thành phần trang chủ</h1>
          <p className="text-sm text-slate-500">Quản lý các phần hiển thị trên trang chủ ({components.length} thành phần)</p>
        </div>
        <Link href="/admin/home-components/create">
          <Button className="gap-2"><Plus size={16} />Thêm thành phần</Button>
        </Link>
      </div>

      {selectedIds.length > 0 && (
        <BulkActionBar selectedCount={selectedIds.length} onDelete={() => setDeleteConfirm({ type: 'bulk' })} onClearSelection={() => setSelectedIds([])} />
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} />
              </TableHead>
              <SortableHeader label="Loại" sortKey="type" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(component => (
              <TableRow key={component.id} className={selectedIds.includes(component.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(component.id)} onChange={() => toggleSelectItem(component.id)} /></TableCell>
                <TableCell className="font-medium">{component.type}</TableCell>
                <TableCell>{component.order}</TableCell>
                <TableCell><Badge variant={component.active ? 'success' : 'secondary'}>{component.active ? 'Hiển thị' : 'Ẩn'}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/home-components/${component.id}/edit`}>
                      <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteConfirm({ type: 'single', id: component.id })}><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Chưa có thành phần nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle className="text-red-600" size={24} /></div>
              <div>
                <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
                <p className="text-sm text-slate-500 mt-1">{deleteConfirm.type === 'bulk' ? `Xóa ${selectedIds.length} thành phần?` : 'Xóa thành phần này?'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>Hủy</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Đang xóa...' : 'Xóa'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

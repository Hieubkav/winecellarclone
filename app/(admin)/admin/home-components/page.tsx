'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, AlertTriangle, GripVertical } from 'lucide-react';
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar } from '../components/TableUtilities';
import { fetchAdminHomeComponents, deleteHomeComponent, bulkDeleteHomeComponents, reorderHomeComponents, updateHomeComponent, type AdminHomeComponent } from '@/lib/api/admin';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getComponentTypeInfo } from './componentTypes';
import { cn } from '@/lib/utils';

interface SortableRowProps {
  component: AdminHomeComponent;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  togglingStatus: number | null;
}

function SortableRow({ component, isSelected, onToggleSelect, onDelete, onToggleStatus, togglingStatus }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = getComponentTypeInfo(component.type);

  return (
    <TableRow ref={setNodeRef} style={style} className={isSelected ? 'bg-blue-500/5' : ''}>
      <TableCell>
        <SelectCheckbox checked={isSelected} onChange={onToggleSelect} />
      </TableCell>
      <TableCell>
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical size={18} className="text-slate-400" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {typeInfo ? (
            <>
              <typeInfo.icon size={16} className="text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{typeInfo.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{typeInfo.description}</p>
              </div>
            </>
          ) : (
            <span className="font-medium text-slate-500">{component.type}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div
          className={cn(
            "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
            togglingStatus === component.id ? "opacity-50 cursor-wait" : "",
            component.active ? "bg-green-500" : "bg-slate-300"
          )}
          onClick={() => onToggleStatus(component.id, component.active)}
          title={`Click để ${component.active ? 'ẩn' : 'hiển thị'}`}
        >
          <div className={cn(
            "w-3 h-3 bg-white rounded-full transition-transform",
            component.active ? "translate-x-2" : "-translate-x-2"
          )} />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link href={`/admin/home-components/${component.id}/edit${typeInfo ? `?type=${encodeURIComponent(typeInfo.label)}` : ''}`}>
            <Button variant="ghost" size="icon">
              <Edit size={16} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function HomeComponentsListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [components, setComponents] = useState<AdminHomeComponent[]>([]);
  const [totalComponents, setTotalComponents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_home_components_perPage');
      if (saved === 'all') return 'all';
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const perPageOptions = [10, 25, 50, 100];

  useEffect(() => {
    localStorage.setItem('admin_home_components_perPage', String(perPage));
  }, [perPage]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadComponents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminHomeComponents({
        per_page: perPage === 'all' ? 1000 : perPage,
        page: currentPage,
      });
      setComponents(result.data);
      setTotalComponents(result.meta.total);
      setTotalPages(result.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch components:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = components.findIndex(c => c.id === active.id);
    const newIndex = components.findIndex(c => c.id === over.id);

    const reordered = arrayMove(components, oldIndex, newIndex);
    setComponents(reordered);

    try {
      const items = reordered.map((component, index) => ({
        id: component.id,
        order: index,
      }));
      
      await reorderHomeComponents(items);
      toast.success('Đã cập nhật thứ tự hiển thị');
    } catch (error) {
      console.error('Reorder failed:', error);
      toast.error('Không thể cập nhật thứ tự');
      loadComponents();
    }
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

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatus(id);
    try {
      await updateHomeComponent(id, { active: !currentStatus });
      setComponents(prev => prev.map(c => 
        c.id === id ? { ...c, active: !currentStatus } : c
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị thành phần' : 'Đã tắt hiển thị thành phần',
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
          <p className="text-sm text-slate-500">Quản lý các phần hiển thị trên trang chủ ({totalComponents} thành phần)</p>
        </div>
        <Link href="/admin/home-components/create">
          <Button className="gap-2"><Plus size={16} />Thêm thành phần</Button>
        </Link>
      </div>

      {selectedIds.length > 0 && (
        <BulkActionBar selectedCount={selectedIds.length} onDelete={() => setDeleteConfirm({ type: 'bulk' })} onClearSelection={() => setSelectedIds([])} />
      )}

      <Card>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} />
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <SortableHeader label="Loại" sortKey="type" sortConfig={sortConfig} onSort={handleSort} />
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {sortedData.map(component => (
                  <SortableRow
                    key={component.id}
                    component={component}
                    isSelected={selectedIds.includes(component.id)}
                    onToggleSelect={() => toggleSelectItem(component.id)}
                    onDelete={() => setDeleteConfirm({ type: 'single', id: component.id })}
                    onToggleStatus={handleToggleStatus}
                    togglingStatus={togglingStatus}
                  />
                ))}
              </SortableContext>
              {sortedData.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Chưa có thành phần nào</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      {sortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Hiển thị {sortedData.length} / {totalComponents} thành phần
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Hiển thị:</span>
              <select
                className="h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                value={perPage}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setPerPage(value);
                  setCurrentPage(1);
                }}
              >
                {perPageOptions.map(option => (
                  <option key={option} value={option}>{option} / trang</option>
                ))}
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && perPage !== 'all' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-slate-500">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}
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

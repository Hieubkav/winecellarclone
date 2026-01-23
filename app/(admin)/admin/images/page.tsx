'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, ImageIcon, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar } from '../components/TableUtilities';
import { fetchAdminImages, deleteImage, bulkDeleteImages, type AdminImage } from '@/lib/api/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ImagesListPage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_images_perPage');
      if (saved === 'all') return 'all';
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const perPageOptions = [10, 25, 50, 100];

  useEffect(() => {
    localStorage.setItem('admin_images_perPage', String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadImages = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      const params: Record<string, string | number> = {
        per_page: perPage === 'all' ? 1000 : perPage,
        page: currentPage,
      };
      if (debouncedSearchTerm) params.q = debouncedSearchTerm;
      const result = await fetchAdminImages(params);
      setImages(result.data);
      setTotalImages(result.meta.total);
      setTotalPages(result.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, currentPage, perPage]);

  useEffect(() => {
    loadImages(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      loadImages(false);
    }
  }, [debouncedSearchTerm, currentPage, perPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedData = useSortableData(images, sortConfig);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(img => img.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteImage(deleteConfirm.id);
        toast.success('Xóa hình ảnh thành công');
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteImages(selectedIds);
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} hình ảnh`);
      }
      setDeleteConfirm(null);
      loadImages(false);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isInitialLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Card><div className="p-4 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></Card></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Thư viện ảnh</h1>
          <p className="text-sm text-slate-500">Quản lý hình ảnh ({totalImages} ảnh)</p>
        </div>
        <Link href="/admin/images/create"><Button className="gap-2"><Plus size={16} />Tải ảnh lên</Button></Link>
      </div>

      {selectedIds.length > 0 && <BulkActionBar selectedCount={selectedIds.length} onDelete={() => setDeleteConfirm({ type: 'bulk' })} onClearSelection={() => setSelectedIds([])} />}

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            )}
            <Input placeholder="Tìm ảnh..." className={cn("pl-9", isSearching && "pr-9")} value={searchTerm} onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }} />
          </div>
        </div>
        <div className="relative">
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 pointer-events-none rounded-lg" />
          )}
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>
              <TableHead className="w-[80px]">Xem trước</TableHead>
              <SortableHeader label="Tên file" sortKey="file_path" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Alt text</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(img => (
              <TableRow key={img.id} className={selectedIds.includes(img.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(img.id)} onChange={() => toggleSelectItem(img.id)} /></TableCell>
                <TableCell>
                  {img.url ? (
                    <Image src={img.url} alt={img.alt || ''} width={60} height={60} className="w-15 h-15 object-cover rounded" />
                  ) : (
                    <div className="w-15 h-15 bg-slate-200 rounded flex items-center justify-center"><ImageIcon size={16} className="text-slate-400" /></div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{img.file_path}</TableCell>
                <TableCell className="max-w-[150px] truncate">{img.alt || '—'}</TableCell>
                <TableCell>{img.width && img.height ? `${img.width}×${img.height}` : '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/images/${img.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16} /></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteConfirm({ type: 'single', id: img.id })}><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">{searchTerm ? 'Không tìm thấy ảnh' : 'Chưa có ảnh nào'}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedData.length} / {totalImages} ảnh
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
              <div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="text-red-600" size={24} /></div>
              <div><h3 className="text-lg font-semibold">Xác nhận xóa</h3><p className="text-sm text-slate-500 mt-1">{deleteConfirm.type === 'bulk' ? `Xóa ${selectedIds.length} ảnh?` : 'Xóa ảnh này?'}</p></div>
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

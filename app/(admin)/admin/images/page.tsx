'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, ImageIcon, AlertTriangle, LayoutGrid, LayoutList } from 'lucide-react';
import { Button, Card, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar, ColumnToggle } from '../components/TableUtilities';
import { fetchAdminImages, deleteImage, bulkDeleteImages, type AdminImage } from '@/lib/api/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImageEditModal } from './components/ImageEditModal';

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
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_images_viewMode');
      return (saved as 'list' | 'grid') || 'grid';
    }
    return 'grid';
  });
  const perPageOptions = [10, 25, 50, 100];

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'preview', label: 'Xem trước', required: true },
    { key: 'file_path', label: 'Tên file', required: true },
    { key: 'alt', label: 'Alt text' },
    { key: 'dimensions', label: 'Kích thước' },
    { key: 'actions', label: 'Hành động', required: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_images_visibleColumns');
      if (saved) return JSON.parse(saved);
    }
    return ['select', 'preview', 'file_path', 'actions'];
  });

  useEffect(() => {
    localStorage.setItem('admin_images_perPage', String(perPage));
  }, [perPage]);

  useEffect(() => {
    localStorage.setItem('admin_images_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('admin_images_visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      loadImages(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, currentPage, perPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
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
          <div className="flex flex-wrap gap-3 items-center justify-between">
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
            <div className="flex gap-2">
              <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded-md p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <LayoutList size={16} />
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <LayoutGrid size={16} />
                  Grid
                </Button>
              </div>
              {viewMode === 'list' && <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />}
            </div>
          </div>
        </div>
        <div className="relative">
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 pointer-events-none rounded-lg" />
          )}
          {viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('select') && (
                    <TableHead className="w-[40px]">
                      <SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} />
                    </TableHead>
                  )}
                  {visibleColumns.includes('preview') && <TableHead className="w-[80px]">Xem trước</TableHead>}
                  {visibleColumns.includes('file_path') && (
                    <SortableHeader label="Tên file" sortKey="file_path" sortConfig={sortConfig} onSort={handleSort} />
                  )}
                  {visibleColumns.includes('alt') && <TableHead>Alt text</TableHead>}
                  {visibleColumns.includes('dimensions') && <TableHead>Kích thước</TableHead>}
                  {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map(img => (
                  <TableRow key={img.id} className={selectedIds.includes(img.id) ? 'bg-blue-500/5' : ''}>
                    {visibleColumns.includes('select') && (
                      <TableCell>
                        <SelectCheckbox checked={selectedIds.includes(img.id)} onChange={() => toggleSelectItem(img.id)} />
                      </TableCell>
                    )}
                    {visibleColumns.includes('preview') && (
                      <TableCell>
                        {img.url ? (
                          <Image src={img.url} alt={img.alt || ''} width={60} height={60} className="w-15 h-15 object-cover rounded" />
                        ) : (
                          <div className="w-15 h-15 bg-slate-200 rounded flex items-center justify-center"><ImageIcon size={16} className="text-slate-400" /></div>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.includes('file_path') && (
                      <TableCell className="font-medium max-w-[200px] truncate">{img.file_path}</TableCell>
                    )}
                    {visibleColumns.includes('alt') && (
                      <TableCell className="max-w-[150px] truncate">{img.alt || '—'}</TableCell>
                    )}
                    {visibleColumns.includes('dimensions') && (
                      <TableCell>{img.width && img.height ? `${img.width}×${img.height}` : '—'}</TableCell>
                    )}
                    {visibleColumns.includes('actions') && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingImageId(img.id)}><Edit size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteConfirm({ type: 'single', id: img.id })}><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {sortedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                      {searchTerm ? 'Không tìm thấy ảnh' : 'Chưa có ảnh nào'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4">
              {sortedData.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  {searchTerm ? 'Không tìm thấy ảnh' : 'Chưa có ảnh nào'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {sortedData.map(img => (
                    <div
                      key={img.id}
                      className={cn(
                        "group relative aspect-square rounded-lg border-2 transition-all overflow-hidden",
                        selectedIds.includes(img.id)
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <SelectCheckbox
                          checked={selectedIds.includes(img.id)}
                          onChange={() => toggleSelectItem(img.id)}
                        />
                      </div>
                      {img.url ? (
                        <Image
                          src={img.url}
                          alt={img.alt || img.file_path}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16vw, 12vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <ImageIcon size={32} className="text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate mb-2">{img.file_path}</p>
                        <div className="flex gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 gap-1 h-7 text-xs"
                            onClick={() => setEditingImageId(img.id)}
                          >
                            <Edit size={12} />
                            Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1 h-7 text-xs"
                            onClick={() => setDeleteConfirm({ type: 'single', id: img.id })}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {editingImageId && (
        <ImageEditModal
          imageId={editingImageId}
          onClose={() => setEditingImageId(null)}
          onSuccess={() => loadImages(false)}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, FileText, ExternalLink, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar, ColumnToggle } from '../components/TableUtilities';
import { fetchAdminArticles, deleteArticle, bulkDeleteArticles, updateArticle, type AdminArticle } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
 
 export default function ArticlesListPage() {
   const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
   const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'published_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_articles_perPage');
      if (saved === 'all') return 'all';
      if (saved) return Number(saved);
    }
    return 25;
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const perPageOptions = [10, 25, 50, 100];

  const columns = [
    { key: 'title', label: 'Tiêu đề', required: true },
    { key: 'excerpt', label: 'Mô tả ngắn' },
    { key: 'published_at', label: 'Ngày xuất bản' },
    { key: 'active', label: 'Trạng thái' },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_articles_columns');
      if (saved) return JSON.parse(saved);
    }
    return ['title', 'published_at', 'active'];
  });

  useEffect(() => {
    localStorage.setItem('admin_articles_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    localStorage.setItem('admin_articles_perPage', String(perPage));
  }, [perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);
 
  const loadArticles = useCallback(async (isInitial = false) => {
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

      const articlesRes = await fetchAdminArticles(params);
      setArticles(articlesRes.data);
      setTotalArticles(articlesRes.meta.total);
      setTotalPages(articlesRes.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, debouncedSearchTerm, perPage]);

  useEffect(() => {
    loadArticles(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      loadArticles(false);
    }
  }, [currentPage, debouncedSearchTerm, perPage]);
 
   const handleSort = (key: string) => {
     setSortConfig(prev => ({ 
       key, 
       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
     }));
   };
 
  const sortedData = useSortableData(articles, sortConfig);
 
  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(a => a.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteArticle(deleteConfirm.id);
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteArticles(selectedIds);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      loadArticles(false);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingStatus(id);
    try {
      await updateArticle(id, { active: !currentStatus });
      setArticles(prev => prev.map(a => 
        a.id === id ? { ...a, active: !currentStatus } : a
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị bài viết' : 'Đã tắt hiển thị bài viết',
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingStatus(null);
    }
  };

   const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString('vi-VN', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
     });
   };
 
   if (isInitialLoading) {
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
               <Skeleton key={i} className="h-16 w-full" />
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
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bài viết</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý nội dung bài viết và tin tức ({totalArticles} bài viết)
           </p>
         </div>
      <Link href="/admin/articles/create">
        <Button className="gap-2">
          <Plus size={16} />
          Thêm bài viết
        </Button>
      </Link>
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
           <div className="relative max-w-xs">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             {isSearching && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
               </div>
             )}
             <Input
               placeholder="Tìm bài viết..."
               className={cn("pl-9 w-48", isSearching && "pr-9")}
               value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
             />
           </div>
           <ColumnToggle
             columns={columns}
             visibleColumns={visibleColumns}
             onToggle={toggleColumn}
           />
         </div>
 
         <div className="relative">
           {isSearching && (
             <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 pointer-events-none rounded-lg" />
           )}
           <Table>
           <TableHeader>
             <TableRow>
              <TableHead className="w-[40px]">
                <SelectCheckbox 
                  checked={selectedIds.length === sortedData.length && sortedData.length > 0} 
                  onChange={toggleSelectAll} 
                  indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} 
                />
              </TableHead>
               <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
               {visibleColumns.includes('excerpt') && <TableHead>Mô tả ngắn</TableHead>}
               {visibleColumns.includes('published_at') && <SortableHeader label="Ngày xuất bản" sortKey="published_at" sortConfig={sortConfig} onSort={handleSort} />}
               {visibleColumns.includes('active') && <TableHead>Trạng thái</TableHead>}
               <TableHead className="text-right">Hành động</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(article => (
              <TableRow key={article.id} className={selectedIds.includes(article.id) ? 'bg-blue-500/5' : ''}>
                <TableCell>
                  <SelectCheckbox checked={selectedIds.includes(article.id)} onChange={() => toggleSelectItem(article.id)} />
                </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-3">
                    {article.cover_image_url ? (
                      <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-slate-400" />
                      </div>
                    )}
                     <div className="min-w-0">
                       <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                         {article.title}
                       </p>
                     </div>
                   </div>
                 </TableCell>
                 {visibleColumns.includes('excerpt') && (
                   <TableCell>
                     <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[300px]">
                       {article.excerpt || '—'}
                     </p>
                   </TableCell>
                 )}
                 {visibleColumns.includes('published_at') && (
                   <TableCell>
                     <span className="text-sm text-slate-500">{article.published_at ? formatDate(article.published_at) : '—'}</span>
                   </TableCell>
                 )}
                 {visibleColumns.includes('active') && (
                   <TableCell>
                     <div
                       className={cn(
                         "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                         togglingStatus === article.id ? "opacity-50 cursor-wait" : "",
                         article.active ? "bg-green-500" : "bg-slate-300"
                       )}
                       onClick={() => handleToggleStatus(article.id, article.active)}
                       title={`Click để ${article.active ? 'ẩn' : 'hiển thị'}`}
                     >
                       <div className={cn(
                         "w-3 h-3 bg-white rounded-full transition-transform",
                         article.active ? "translate-x-2" : "-translate-x-2"
                       )} />
                     </div>
                   </TableCell>
                 )}
                 <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                    <Link href={`/bai-viet/${article.slug}`} target="_blank">
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
                  <Link href={`/admin/articles/${article.id}/edit`}>
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <Edit size={16} />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteConfirm({ type: 'single', id: article.id })}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                   </div>
                 </TableCell>
               </TableRow>
             ))}
             {sortedData.length === 0 && (
               <TableRow>
              <TableCell colSpan={2 + visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm 
                     ? 'Không tìm thấy kết quả phù hợp' 
                     : 'Chưa có bài viết nào'}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </div>
 
         {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedData.length} / {totalArticles} bài viết
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

    {/* Delete Confirmation Modal */}
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
                  ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} bài viết đã chọn?`
                  : 'Bạn có chắc chắn muốn xóa bài viết này?'
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
     </div>
   );
 }

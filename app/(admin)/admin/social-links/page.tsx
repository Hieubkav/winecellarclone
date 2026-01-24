'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Link as LinkIcon, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar } from '../components/TableUtilities';
import { fetchAdminSocialLinks, deleteSocialLink, bulkDeleteSocialLinks, updateSocialLink, type AdminSocialLink } from '@/lib/api/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SocialLinksListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<AdminSocialLink[]>([]);
  const [totalLinks, setTotalLinks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_social_links_perPage');
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
    localStorage.setItem('admin_social_links_perPage', String(perPage));
  }, [perPage]);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminSocialLinks({
        per_page: perPage === 'all' ? 1000 : perPage,
        page: currentPage,
      });
      setLinks(result.data);
      setTotalLinks(result.meta.total);
      setTotalPages(result.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedData = useSortableData(links, sortConfig);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(l => l.id));
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteSocialLink(deleteConfirm.id);
        toast.success('Xóa thành công');
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteSocialLinks(selectedIds);
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} liên kết`);
      }
      setDeleteConfirm(null);
      loadLinks();
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
      await updateSocialLink(id, { active: !currentStatus });
      setLinks(prev => prev.map(l => 
        l.id === id ? { ...l, active: !currentStatus } : l
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị liên kết' : 'Đã tắt hiển thị liên kết',
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
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Card><div className="p-4 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></Card></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mạng xã hội</h1>
          <p className="text-sm text-slate-500">Quản lý liên kết mạng xã hội ({totalLinks} liên kết)</p>
        </div>
        <Link href="/admin/social-links/create"><Button className="gap-2"><Plus size={16} />Thêm liên kết</Button></Link>
      </div>

      {selectedIds.length > 0 && <BulkActionBar selectedCount={selectedIds.length} onDelete={() => setDeleteConfirm({ type: 'bulk' })} onClearSelection={() => setSelectedIds([])} />}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>
              <SortableHeader label="Nền tảng" sortKey="platform" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>URL</TableHead>
              <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(link => (
              <TableRow key={link.id} className={selectedIds.includes(link.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(link.id)} onChange={() => toggleSelectItem(link.id)} /></TableCell>
                <TableCell className="font-medium">{link.platform}</TableCell>
                <TableCell><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><LinkIcon size={14} />{link.url}</a></TableCell>
                <TableCell>{link.order}</TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                      togglingStatus === link.id ? "opacity-50 cursor-wait" : "",
                      link.active ? "bg-green-500" : "bg-slate-300"
                    )}
                    onClick={() => handleToggleStatus(link.id, link.active)}
                    title={`Click để ${link.active ? 'ẩn' : 'hiển thị'}`}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full transition-transform",
                      link.active ? "translate-x-2" : "-translate-x-2"
                    )} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/social-links/${link.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16} /></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteConfirm({ type: 'single', id: link.id })}><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Chưa có liên kết nào</TableCell></TableRow>}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hiển thị {sortedData.length} / {totalLinks} liên kết
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
              <div><h3 className="text-lg font-semibold">Xác nhận xóa</h3><p className="text-sm text-slate-500 mt-1">{deleteConfirm.type === 'bulk' ? `Xóa ${selectedIds.length} liên kết?` : 'Xóa liên kết này?'}</p></div>
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

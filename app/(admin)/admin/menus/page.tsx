 'use client';
 
 import React, { useState, useEffect, useCallback } from 'react';
 import Link from 'next/link';
 import { Search, Plus, Edit, Trash2, AlertTriangle, Menu as MenuIcon, Layers } from 'lucide-react';
 import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
 import { SortableHeader, useSortableData, SelectCheckbox, BulkActionBar } from '../components/TableUtilities';
 import { fetchAdminMenus, deleteMenu, bulkDeleteMenus, updateMenu, type AdminMenu } from '@/lib/api/admin';
 import { cn } from '@/lib/utils';
 import { toast } from 'sonner';
 
 export default function MenusListPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [menus, setMenus] = useState<AdminMenu[]>([]);
   const [totalMenus, setTotalMenus] = useState(0);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [perPage, setPerPage] = useState<number | 'all'>(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('admin_menus_perPage');
       if (saved === 'all') return 'all';
       if (saved) return Number(saved);
     }
     return 25;
   });
   const [searchTerm, setSearchTerm] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
   const perPageOptions = [10, 25, 50, 100];

   useEffect(() => {
     localStorage.setItem('admin_menus_perPage', String(perPage));
   }, [perPage]);
 
   const loadMenus = useCallback(async () => {
     setIsLoading(true);
     try {
       const params: Record<string, string | number> = {
         per_page: perPage === 'all' ? 1000 : perPage,
         page: currentPage,
       };
       if (searchTerm) params.q = searchTerm;
 
       const res = await fetchAdminMenus(params);
       setMenus(res.data);
       setTotalMenus(res.meta.total);
       setTotalPages(res.meta.last_page);
     } catch (error) {
       console.error('Failed to fetch menus:', error);
       toast.error('Không thể tải danh sách menu');
     } finally {
       setIsLoading(false);
     }
   }, [searchTerm, currentPage, perPage]);
 
   useEffect(() => {
     loadMenus();
   }, [loadMenus]);
 
   const handleSort = (key: string) => {
     setSortConfig(prev => ({
       key,
       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
     }));
   };
 
   const sortedData = useSortableData(menus, sortConfig);
 
   const toggleSelectAll = () => {
     setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(m => m.id));
   };
 
   const toggleSelectItem = (id: number) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };
 
   const handleDelete = async () => {
     if (!deleteConfirm) return;
     setIsDeleting(true);
     try {
       if (deleteConfirm.type === 'single' && deleteConfirm.id) {
         await deleteMenu(deleteConfirm.id);
         toast.success('Xóa menu thành công');
       } else if (deleteConfirm.type === 'bulk') {
         await bulkDeleteMenus(selectedIds);
         setSelectedIds([]);
         toast.success(`Đã xóa ${selectedIds.length} menu`);
       }
       setDeleteConfirm(null);
       loadMenus();
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
      await updateMenu(id, { active: !currentStatus });
      setMenus(prev => prev.map(m => 
        m.id === id ? { ...m, active: !currentStatus } : m
      ));
      toast.success(
        !currentStatus ? 'Đã bật hiển thị menu' : 'Đã tắt hiển thị menu',
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
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Menu</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             Quản lý menu điều hướng ({totalMenus} menu)
           </p>
         </div>
         <Link href="/admin/menus/create">
           <Button className="gap-2">
             <Plus size={16} />
             Thêm menu
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
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
           <div className="relative max-w-xs">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <Input
               placeholder="Tìm menu..."
               className="pl-9 w-48"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
         </div>
 
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
               <TableHead>Loại</TableHead>
               <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead>Blocks</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Hành động</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(menu => (
               <TableRow key={menu.id} className={selectedIds.includes(menu.id) ? 'bg-blue-500/5' : ''}>
                 <TableCell>
                   <SelectCheckbox checked={selectedIds.includes(menu.id)} onChange={() => toggleSelectItem(menu.id)} />
                 </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-3">
                   <div
                     className={cn(
                       "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                       togglingStatus === menu.id ? "opacity-50 cursor-wait" : "",
                       menu.active ? "bg-green-500" : "bg-slate-300"
                     )}
                     onClick={() => handleToggleStatus(menu.id, menu.active)}
                     title={`Click để ${menu.active ? 'ẩn' : 'hiển thị'}`}
                   >
                     <div className={cn(
                       "w-3 h-3 bg-white rounded-full transition-transform",
                       menu.active ? "translate-x-2" : "-translate-x-2"
                     )} />
                   </div>
                     <div>
                       <p className="font-medium text-slate-900 dark:text-slate-100">{menu.title}</p>
                       {menu.href && (
                         <p className="text-xs text-slate-500 truncate max-w-[200px]">{menu.href}</p>
                       )}
                     </div>
                   </div>
                 </TableCell>
                 <TableCell>
                   <span className="text-sm text-slate-500">{menu.type || '—'}</span>
                 </TableCell>
                 <TableCell>
                   <span className="text-sm text-slate-500">{menu.order}</span>
                 </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-1">
                     <Layers size={14} className="text-slate-400" />
                     <span className="text-sm text-slate-500">{menu.blocks_count}</span>
                   </div>
                 </TableCell>
                 <TableCell>
                   <Badge variant={menu.active ? 'success' : 'secondary'}>
                     {menu.active ? 'Hiển thị' : 'Ẩn'}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                     <Link href={`/admin/menus/${menu.id}/edit`}>
                       <Button variant="ghost" size="icon" aria-label="Edit">
                         <Edit size={16} />
                       </Button>
                     </Link>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="text-red-600 hover:text-red-700"
                       onClick={() => setDeleteConfirm({ type: 'single', id: menu.id })}
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
                 <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                   {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có menu nào'}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       {sortedData.length > 0 && (
         <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500">
               Hiển thị {sortedData.length} / {totalMenus} menu
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
               <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                 <AlertTriangle className="text-red-600" size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                   Xác nhận xóa
                 </h3>
                 <p className="text-sm text-slate-500 mt-1">
                   {deleteConfirm.type === 'bulk'
                     ? `Xóa ${selectedIds.length} menu đã chọn?`
                     : 'Xóa menu này?'}
                 </p>
                 <p className="text-xs text-red-500 mt-2">
                   Hành động này sẽ xóa cả các blocks và items bên trong.
                 </p>
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

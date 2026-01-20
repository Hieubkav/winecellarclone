 'use client';
 
 import React, { useState, useMemo, useEffect } from 'react';
 import Link from 'next/link';
 import { Plus, Edit, Trash2, Search, FolderTree, ChevronRight } from 'lucide-react';
 import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
 import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
 import { cn } from '@/lib/utils';
 
 interface Category {
   id: number;
   name: string;
   slug: string;
   parentId?: number;
   parentName?: string;
   productCount: number;
   order: number;
   active: boolean;
 }
 
 const mockCategories: Category[] = [
   { id: 1, name: 'Rượu Vang Đỏ', slug: 'ruou-vang-do', productCount: 45, order: 1, active: true },
   { id: 2, name: 'Rượu Vang Trắng', slug: 'ruou-vang-trang', productCount: 32, order: 2, active: true },
   { id: 3, name: 'Champagne', slug: 'champagne', productCount: 18, order: 3, active: true },
   { id: 4, name: 'Whisky', slug: 'whisky', productCount: 28, order: 4, active: true },
   { id: 5, name: 'Cognac', slug: 'cognac', productCount: 15, order: 5, active: true },
   { id: 6, name: 'Sake', slug: 'sake', productCount: 12, order: 6, active: false },
   { id: 7, name: 'Vodka', slug: 'vodka', productCount: 20, order: 7, active: true },
   { id: 8, name: 'Gin', slug: 'gin', productCount: 16, order: 8, active: true },
   { id: 9, name: 'Bordeaux', slug: 'bordeaux', parentId: 1, parentName: 'Rượu Vang Đỏ', productCount: 22, order: 1, active: true },
   { id: 10, name: 'Burgundy', slug: 'burgundy', parentId: 1, parentName: 'Rượu Vang Đỏ', productCount: 18, order: 2, active: true },
 ];
 
 export default function CategoriesListPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [categories, setCategories] = useState<Category[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [isDeleting, setIsDeleting] = useState(false);
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setCategories(mockCategories);
       setIsLoading(false);
     }, 500);
     return () => clearTimeout(timer);
   }, []);
 
   const handleSort = (key: string) => {
     setSortConfig(prev => ({ 
       key, 
       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
     }));
   };
 
   const filteredData = useMemo(() => {
     let data = [...categories];
     if (searchTerm) {
       data = data.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
     }
     if (filterStatus === 'active') {
       data = data.filter(c => c.active);
     } else if (filterStatus === 'inactive') {
       data = data.filter(c => !c.active);
     }
     return data;
   }, [categories, searchTerm, filterStatus]);
 
   const sortedData = useSortableData(filteredData, sortConfig);
 
   const toggleSelectAll = () => {
     setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(c => c.id));
   };
 
   const toggleSelectItem = (id: number) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };
 
   const handleDelete = async (id: number) => {
     if (confirm('Xóa danh mục này?')) {
       setCategories(prev => prev.filter(c => c.id !== id));
     }
   };
 
   const handleBulkDelete = async () => {
     if (confirm(`Xóa ${selectedIds.length} danh mục đã chọn?`)) {
       setIsDeleting(true);
       await new Promise(resolve => setTimeout(resolve, 500));
       setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)));
       setSelectedIds([]);
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
             Quản lý danh mục và phân loại sản phẩm ({categories.length} danh mục)
           </p>
         </div>
         <Link href="/admin/categories/create">
           <Button className="gap-2">
             <Plus size={16} />
             Thêm danh mục
           </Button>
         </Link>
       </div>
 
       <BulkActionBar 
         selectedCount={selectedIds.length} 
         onDelete={handleBulkDelete} 
         onClearSelection={() => setSelectedIds([])} 
         isLoading={isDeleting}
       />
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
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
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="">Tất cả trạng thái</option>
             <option value="active">Đang hoạt động</option>
             <option value="inactive">Tạm ẩn</option>
           </select>
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
               <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead>Danh mục cha</TableHead>
               <SortableHeader label="Số sản phẩm" sortKey="productCount" sortConfig={sortConfig} onSort={handleSort} />
               <SortableHeader label="Thứ tự" sortKey="order" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Hành động</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(category => (
               <TableRow key={category.id} className={selectedIds.includes(category.id) ? 'bg-blue-500/5' : ''}>
                 <TableCell>
                   <SelectCheckbox checked={selectedIds.includes(category.id)} onChange={() => toggleSelectItem(category.id)} />
                 </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center">
                       <FolderTree size={16} className="text-amber-600 dark:text-amber-400" />
                     </div>
                     <span className="font-medium">{category.name}</span>
                   </div>
                 </TableCell>
                 <TableCell>
                   {category.parentName ? (
                     <div className="flex items-center gap-1 text-slate-500">
                       <ChevronRight size={14} />
                       <span>{category.parentName}</span>
                     </div>
                   ) : (
                     <span className="text-slate-400">—</span>
                   )}
                 </TableCell>
                 <TableCell>
                   <Badge variant="secondary">{category.productCount} sản phẩm</Badge>
                 </TableCell>
                 <TableCell>
                   <span className="text-slate-500">{category.order}</span>
                 </TableCell>
                 <TableCell>
                   <Badge variant={category.active ? 'success' : 'secondary'}>
                     {category.active ? 'Hoạt động' : 'Tạm ẩn'}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                     <Link href={`/admin/categories/${category.id}/edit`}>
                       <Button variant="ghost" size="icon" aria-label="Edit">
                         <Edit size={16} />
                       </Button>
                     </Link>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="text-red-500 hover:text-red-600" 
                       onClick={() => handleDelete(category.id)}
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
                   {searchTerm || filterStatus 
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
               Hiển thị {sortedData.length} / {categories.length} danh mục
             </span>
           </div>
         )}
       </Card>
     </div>
   );
 }

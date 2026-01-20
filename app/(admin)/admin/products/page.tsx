 'use client';
 
 import React, { useState, useMemo, useEffect } from 'react';
 import Link from 'next/link';
 import { Plus, Edit, Trash2, ExternalLink, Search, Package } from 'lucide-react';
 import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
 import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
 import { cn } from '@/lib/utils';
 
 interface Product {
   id: number;
   name: string;
   slug: string;
   price: number;
   salePrice?: number;
   image?: string;
   categoryName: string;
   status: 'active' | 'draft' | 'archived';
 }
 
 const mockProducts: Product[] = [
   { id: 1, name: 'Rượu Vang Đỏ Pháp Bordeaux', slug: 'ruou-vang-do-phap-bordeaux', price: 1500000, salePrice: 1200000, categoryName: 'Rượu Vang Đỏ', status: 'active' },
   { id: 2, name: 'Rượu Vang Trắng Chile', slug: 'ruou-vang-trang-chile', price: 850000, categoryName: 'Rượu Vang Trắng', status: 'active' },
   { id: 3, name: 'Champagne Dom Pérignon', slug: 'champagne-dom-perignon', price: 8500000, categoryName: 'Champagne', status: 'active' },
   { id: 4, name: 'Whisky Macallan 18 Years', slug: 'whisky-macallan-18-years', price: 12000000, categoryName: 'Whisky', status: 'draft' },
   { id: 5, name: 'Cognac Hennessy XO', slug: 'cognac-hennessy-xo', price: 6500000, categoryName: 'Cognac', status: 'active' },
   { id: 6, name: 'Rượu Sake Nhật Bản', slug: 'ruou-sake-nhat-ban', price: 750000, categoryName: 'Sake', status: 'archived' },
   { id: 7, name: 'Vodka Grey Goose', slug: 'vodka-grey-goose', price: 1200000, categoryName: 'Vodka', status: 'active' },
   { id: 8, name: 'Gin Tanqueray', slug: 'gin-tanqueray', price: 980000, categoryName: 'Gin', status: 'draft' },
 ];
 
 const mockCategories = ['Rượu Vang Đỏ', 'Rượu Vang Trắng', 'Champagne', 'Whisky', 'Cognac', 'Sake', 'Vodka', 'Gin'];
 
 export default function ProductsListPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [products, setProducts] = useState<Product[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterCategory, setFilterCategory] = useState('');
   const [filterStatus, setFilterStatus] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [isDeleting, setIsDeleting] = useState(false);
 
   const columns = [
     { key: 'select', label: 'Chọn' },
     { key: 'image', label: 'Ảnh' },
     { key: 'name', label: 'Tên sản phẩm', required: true },
     { key: 'categoryName', label: 'Danh mục' },
     { key: 'price', label: 'Giá bán' },
     { key: 'status', label: 'Trạng thái' },
     { key: 'actions', label: 'Hành động', required: true },
   ];
 
   const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setProducts(mockProducts);
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
 
   const toggleColumn = (key: string) => {
     setVisibleColumns(prev => 
       prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
     );
   };
 
   const filteredData = useMemo(() => {
     let data = [...products];
     if (searchTerm) {
       data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
     }
     if (filterCategory) {
       data = data.filter(p => p.categoryName === filterCategory);
     }
     if (filterStatus) {
       data = data.filter(p => p.status === filterStatus);
     }
     return data;
   }, [products, searchTerm, filterCategory, filterStatus]);
 
   const sortedData = useSortableData(filteredData, sortConfig);
 
   const toggleSelectAll = () => {
     setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(p => p.id));
   };
 
   const toggleSelectItem = (id: number) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };
 
   const handleDelete = async (id: number) => {
     if (confirm('Xóa sản phẩm này?')) {
       setProducts(prev => prev.filter(p => p.id !== id));
     }
   };
 
   const handleBulkDelete = async () => {
     if (confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
       setIsDeleting(true);
       await new Promise(resolve => setTimeout(resolve, 500));
       setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
       setSelectedIds([]);
       setIsDeleting(false);
     }
   };
 
   const formatPrice = (price: number) => {
     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
   };
 
   const statusConfig = {
     active: { label: 'Đang bán', variant: 'success' as const },
     draft: { label: 'Bản nháp', variant: 'secondary' as const },
     archived: { label: 'Lưu trữ', variant: 'warning' as const },
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
           <div className="p-4 border-b border-slate-100 dark:border-slate-800">
             <Skeleton className="h-10 w-64" />
           </div>
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
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sản phẩm</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             Quản lý kho hàng và thông tin sản phẩm ({products.length} sản phẩm)
           </p>
         </div>
         <Link href="/admin/products/create">
           <Button className="gap-2">
             <Plus size={16} />
             Thêm sản phẩm
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
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
           <div className="flex flex-wrap gap-3 flex-1">
             <div className="relative max-w-xs">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <Input 
                 placeholder="Tìm tên sản phẩm..." 
                 className="pl-9 w-48" 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
               />
             </div>
             <select 
               className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
               value={filterCategory} 
               onChange={(e) => setFilterCategory(e.target.value)}
             >
               <option value="">Tất cả danh mục</option>
               {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <select 
               className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="">Tất cả trạng thái</option>
               <option value="active">Đang bán</option>
               <option value="draft">Bản nháp</option>
               <option value="archived">Lưu trữ</option>
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
               {visibleColumns.includes('image') && <TableHead className="w-[60px]">Ảnh</TableHead>}
               {visibleColumns.includes('name') && (
                 <SortableHeader label="Tên sản phẩm" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
               )}
               {visibleColumns.includes('categoryName') && (
                 <SortableHeader label="Danh mục" sortKey="categoryName" sortConfig={sortConfig} onSort={handleSort} />
               )}
               {visibleColumns.includes('price') && (
                 <SortableHeader label="Giá bán" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
               )}
               {visibleColumns.includes('status') && (
                 <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
               )}
               {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(product => (
               <TableRow key={product.id} className={selectedIds.includes(product.id) ? 'bg-blue-500/5' : ''}>
                 {visibleColumns.includes('select') && (
                   <TableCell>
                     <SelectCheckbox checked={selectedIds.includes(product.id)} onChange={() => toggleSelectItem(product.id)} />
                   </TableCell>
                 )}
                 {visibleColumns.includes('image') && (
                   <TableCell>
                     <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                       <Package size={16} className="text-slate-400" />
                     </div>
                   </TableCell>
                 )}
                 {visibleColumns.includes('name') && (
                   <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                 )}
                 {visibleColumns.includes('categoryName') && (
                   <TableCell>{product.categoryName}</TableCell>
                 )}
                 {visibleColumns.includes('price') && (
                   <TableCell>
                     <div>
                       {product.salePrice ? (
                         <>
                           <span className="text-red-500 font-medium">{formatPrice(product.salePrice)}</span>
                           <span className="text-slate-400 line-through text-xs ml-1">{formatPrice(product.price)}</span>
                         </>
                       ) : (
                         <span>{formatPrice(product.price)}</span>
                       )}
                     </div>
                   </TableCell>
                 )}
                 {visibleColumns.includes('status') && (
                   <TableCell>
                     <Badge variant={statusConfig[product.status].variant}>
                       {statusConfig[product.status].label}
                     </Badge>
                   </TableCell>
                 )}
                 {visibleColumns.includes('actions') && (
                   <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-blue-600 hover:text-blue-700" 
                         title="Xem trên web"
                         aria-label="View on website"
                       >
                         <ExternalLink size={16} />
                       </Button>
                       <Link href={`/admin/products/${product.id}/edit`}>
                         <Button variant="ghost" size="icon" aria-label="Edit">
                           <Edit size={16} />
                         </Button>
                       </Link>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-red-500 hover:text-red-600" 
                         onClick={() => handleDelete(product.id)}
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
                   {searchTerm || filterCategory || filterStatus 
                     ? 'Không tìm thấy kết quả phù hợp' 
                     : 'Chưa có sản phẩm nào'}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
 
         {sortedData.length > 0 && (
           <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <span className="text-sm text-slate-500">
               Hiển thị {sortedData.length} / {products.length} sản phẩm
             </span>
           </div>
         )}
       </Card>
     </div>
   );
 }

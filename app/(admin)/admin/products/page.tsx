'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Search, Package, AlertTriangle } from 'lucide-react';
 import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
 import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { fetchProductFilters, type ProductFilterOption } from '@/lib/api/products';
import { fetchAdminProducts, deleteProduct, bulkDeleteProducts, type AdminProduct } from '@/lib/api/admin';
 
 export default function ProductsListPage() {
   const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<ProductFilterOption[]>([]);
  const [types, setTypes] = useState<ProductFilterOption[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
 
   const columns = [
     { key: 'select', label: 'Chọn' },
     { key: 'image', label: 'Ảnh' },
     { key: 'name', label: 'Tên sản phẩm', required: true },
    { key: 'type_name', label: 'Phân loại' },
    { key: 'category_name', label: 'Danh mục' },
     { key: 'price', label: 'Giá bán' },
    { key: 'active', label: 'Trạng thái' },
     { key: 'actions', label: 'Hành động', required: true },
   ];
 
   const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));
 
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        per_page: 20,
        page: currentPage,
      };
      
      if (searchTerm) params.q = searchTerm;
      if (filterCategory) params.category_id = filterCategory;
      if (filterType) params.type_id = filterType;

      const [productsRes, filtersRes] = await Promise.all([
        fetchAdminProducts(params),
        fetchProductFilters(filterType ? Number(filterType) : undefined),
      ]);

      setProducts(productsRes.data);
      setTotalProducts(productsRes.meta.total);
      setCategories(filtersRes.categories);
      setTypes(filtersRes.types);
      setHasMore(currentPage < productsRes.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterCategory, filterType, searchTerm]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
 
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
 
  const sortedData = useSortableData(products, sortConfig);
 
   const toggleSelectAll = () => {
     setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(p => p.id));
   };
 
   const toggleSelectItem = (id: number) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };
 
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteProduct(deleteConfirm.id);
      } else if (deleteConfirm.type === 'bulk') {
        await bulkDeleteProducts(selectedIds);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      loadProducts();
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
      await updateProduct(id, { active: !currentStatus });
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, active: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setTogglingStatus(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Liên hệ';
     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
            Quản lý kho hàng và thông tin sản phẩm ({totalProducts} sản phẩm)
           </p>
         </div>
         <Link href="/admin/products/create">
           <Button className="gap-2">
             <Plus size={16} />
             Thêm sản phẩm
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
           <div className="flex flex-wrap gap-3 flex-1">
             <div className="relative max-w-xs">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <Input 
                 placeholder="Tìm tên sản phẩm..." 
                 className="pl-9 w-48" 
                 value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }} 
               />
             </div>
             <select 
               className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterCategory('');
                setCurrentPage(1);
              }}
             >
              <option value="">Tất cả phân loại</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
             <select 
               className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
              value={filterCategory} 
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
             >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
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
              {visibleColumns.includes('type_name') && (
                <SortableHeader label="Phân loại" sortKey="type_name" sortConfig={sortConfig} onSort={handleSort} />
              )}
              {visibleColumns.includes('category_name') && (
                <SortableHeader label="Danh mục" sortKey="category_name" sortConfig={sortConfig} onSort={handleSort} />
               )}
               {visibleColumns.includes('price') && (
                 <SortableHeader label="Giá bán" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
               )}
              {visibleColumns.includes('active') && <TableHead>Trạng thái</TableHead>}
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
                  {product.cover_image_url ? (
                    <Image
                      src={product.cover_image_url}
                      alt={product.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                      <Package size={16} className="text-slate-400" />
                    </div>
                  )}
                   </TableCell>
                 )}
                 {visibleColumns.includes('name') && (
                   <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                 )}
              {visibleColumns.includes('type_name') && (
                <TableCell>
                  <Badge variant="info">{product.type_name || 'Không có'}</Badge>
                </TableCell>
              )}
                {visibleColumns.includes('category_name') && (
                  <TableCell>{product.category_name || 'Không có'}</TableCell>
                 )}
                 {visibleColumns.includes('price') && (
                   <TableCell>
                     <div className="flex flex-col">
                    {product.original_price && product.price && product.original_price > product.price ? (
                         <>
                        <span className="text-red-500 font-medium">{formatPrice(product.price)}</span>
                        <span className="text-slate-400 line-through text-xs">{formatPrice(product.original_price)}</span>
                         </>
                       ) : (
                         <span>{formatPrice(product.price)}</span>
                       )}
                     </div>
                   </TableCell>
                 )}
              {visibleColumns.includes('active') && (
                <TableCell>
                  <Badge variant={product.active ? 'success' : 'secondary'}>
                    className={togglingStatus === product.id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-80 transition-opacity'}
                    variant={product.active ? 'success' : 'secondary'}
                    onClick={() => handleToggleStatus(product.id, product.active)}
                    title="Click để chuyển trạng thái"
                  >
                  </Badge>
                </TableCell>
                  </Badge>
              )}
                 {visibleColumns.includes('actions') && (
                   <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                    <Link href={`/san-pham/${product.slug}`} target="_blank">
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
                       <Link href={`/admin/products/${product.id}/edit`}>
                         <Button variant="ghost" size="icon" aria-label="Edit">
                           <Edit size={16} />
                         </Button>
                       </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteConfirm({ type: 'single', id: product.id })}
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
                  {searchTerm || filterCategory || filterType 
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
              Hiển thị {sortedData.length} / {totalProducts} sản phẩm
             </span>
            {hasMore && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Tải thêm
              </Button>
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
                  ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`
                  : 'Bạn có chắc chắn muốn xóa sản phẩm này?'
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

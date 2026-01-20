 'use client';
 
import React, { useState, useMemo, useEffect } from 'react';
 import Link from 'next/link';
import { Search, FolderTree } from 'lucide-react';
import { Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData } from '../components/TableUtilities';
import { fetchProductFilters } from '@/lib/api/products';
 
 interface Category {
   id: number;
   name: string;
   slug: string;
  type_id?: number | null;
 }
 
interface ProductType {
  id: number;
  name: string;
  slug: string;
}
 
 export default function CategoriesListPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'order', direction: 'asc' });
 
   useEffect(() => {
    async function fetchData() {
      try {
        const filtersRes = await fetchProductFilters();
        setCategories(filtersRes.categories as Category[]);
        setTypes(filtersRes.types as ProductType[]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
    if (filterType) {
      const typeId = Number(filterType);
      data = data.filter(c => c.type_id === typeId || c.type_id === null);
     }
     return data;
  }, [categories, searchTerm, filterType]);
 
   const sortedData = useSortableData(filteredData, sortConfig);
 
  const getTypeName = (typeId: number | null | undefined) => {
    if (!typeId) return 'Chung';
    const type = types.find(t => t.id === typeId);
    return type?.name || 'Không xác định';
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
            Xem danh mục và phân loại sản phẩm ({categories.length} danh mục)
           </p>
         </div>
       </div>
 
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
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
           >
            <option value="">Tất cả phân loại</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
         </div>
 
         <Table>
           <TableHeader>
             <TableRow>
               <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Slug</TableHead>
              <TableHead>Phân loại</TableHead>
               <TableHead className="text-right">Hành động</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(category => (
              <TableRow key={category.id}>
                 <TableCell>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center">
                       <FolderTree size={16} className="text-amber-600 dark:text-amber-400" />
                     </div>
                     <span className="font-medium">{category.name}</span>
                   </div>
                 </TableCell>
                 <TableCell>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{category.slug}</code>
                 </TableCell>
                 <TableCell>
                  <Badge variant={category.type_id ? 'info' : 'secondary'}>
                    {getTypeName(category.type_id)}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-right">
                  <Link 
                    href={`/filter?category=${category.slug}`} 
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Xem sản phẩm
                  </Link>
                 </TableCell>
               </TableRow>
             ))}
             {sortedData.length === 0 && (
               <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  {searchTerm || filterType 
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

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Phân loại sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {types.map(type => (
            <Link 
              key={type.id} 
              href={`/filter?type_id=${type.id}`}
              target="_blank"
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">{type.name}</p>
              <p className="text-xs text-slate-500 mt-1">{type.slug}</p>
            </Link>
          ))}
        </div>
      </Card>
     </div>
   );
 }

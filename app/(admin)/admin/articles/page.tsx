 'use client';
 
 import React, { useState, useMemo, useEffect } from 'react';
 import Link from 'next/link';
 import { Plus, Edit, Trash2, Search, FileText, ExternalLink, Calendar } from 'lucide-react';
 import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
 import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
 import { cn } from '@/lib/utils';
 
 interface Article {
   id: number;
   title: string;
   slug: string;
   excerpt?: string;
   image?: string;
   status: 'published' | 'draft';
   publishedAt?: string;
   createdAt: string;
 }
 
 const mockArticles: Article[] = [
   { id: 1, title: 'Hướng dẫn chọn rượu vang cho người mới', slug: 'huong-dan-chon-ruou-vang', excerpt: 'Bài viết hướng dẫn chi tiết cách chọn rượu vang phù hợp...', status: 'published', publishedAt: '2024-01-15', createdAt: '2024-01-10' },
   { id: 2, title: 'Top 10 loại Whisky được ưa chuộng nhất', slug: 'top-10-whisky', excerpt: 'Khám phá những loại whisky hàng đầu thế giới...', status: 'published', publishedAt: '2024-01-12', createdAt: '2024-01-08' },
   { id: 3, title: 'Cách bảo quản rượu vang đúng cách', slug: 'cach-bao-quan-ruou-vang', excerpt: 'Những mẹo bảo quản rượu vang giữ nguyên hương vị...', status: 'draft', createdAt: '2024-01-05' },
   { id: 4, title: 'Champagne vs Sparkling Wine: Sự khác biệt', slug: 'champagne-vs-sparkling-wine', excerpt: 'Phân biệt champagne và rượu vang sủi bọt...', status: 'published', publishedAt: '2024-01-01', createdAt: '2023-12-28' },
   { id: 5, title: 'Nghệ thuật thưởng thức Cognac', slug: 'nghe-thuat-thuong-thuc-cognac', excerpt: 'Hướng dẫn cách thưởng thức cognac đúng chuẩn...', status: 'draft', createdAt: '2023-12-25' },
   { id: 6, title: 'Sake Nhật Bản: Văn hóa và cách thưởng thức', slug: 'sake-nhat-ban', excerpt: 'Tìm hiểu về văn hóa sake và cách uống...', status: 'published', publishedAt: '2023-12-20', createdAt: '2023-12-15' },
 ];
 
 export default function ArticlesListPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [articles, setArticles] = useState<Article[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('');
   const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [isDeleting, setIsDeleting] = useState(false);
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setArticles(mockArticles);
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
     let data = [...articles];
     if (searchTerm) {
       data = data.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
     }
     if (filterStatus) {
       data = data.filter(a => a.status === filterStatus);
     }
     return data;
   }, [articles, searchTerm, filterStatus]);
 
   const sortedData = useSortableData(filteredData, sortConfig);
 
   const toggleSelectAll = () => {
     setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(a => a.id));
   };
 
   const toggleSelectItem = (id: number) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };
 
   const handleDelete = async (id: number) => {
     if (confirm('Xóa bài viết này?')) {
       setArticles(prev => prev.filter(a => a.id !== id));
     }
   };
 
   const handleBulkDelete = async () => {
     if (confirm(`Xóa ${selectedIds.length} bài viết đã chọn?`)) {
       setIsDeleting(true);
       await new Promise(resolve => setTimeout(resolve, 500));
       setArticles(prev => prev.filter(a => !selectedIds.includes(a.id)));
       setSelectedIds([]);
       setIsDeleting(false);
     }
   };
 
   const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString('vi-VN', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
     });
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
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bài viết</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             Quản lý nội dung bài viết và tin tức ({articles.length} bài viết)
           </p>
         </div>
         <Link href="/admin/articles/create">
           <Button className="gap-2">
             <Plus size={16} />
             Viết bài mới
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
               placeholder="Tìm bài viết..." 
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
             <option value="published">Đã xuất bản</option>
             <option value="draft">Bản nháp</option>
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
               <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead className="hidden lg:table-cell">Mô tả ngắn</TableHead>
               <TableHead>Trạng thái</TableHead>
               <SortableHeader label="Ngày tạo" sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort} />
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
                     <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center shrink-0">
                       <FileText size={16} className="text-slate-400" />
                     </div>
                     <div className="min-w-0">
                       <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                         {article.title}
                       </p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                         <Calendar size={12} />
                         {article.publishedAt ? formatDate(article.publishedAt) : 'Chưa xuất bản'}
                       </p>
                     </div>
                   </div>
                 </TableCell>
                 <TableCell className="hidden lg:table-cell">
                   <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[300px]">
                     {article.excerpt || '—'}
                   </p>
                 </TableCell>
                 <TableCell>
                   <Badge variant={article.status === 'published' ? 'success' : 'secondary'}>
                     {article.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                   </Badge>
                 </TableCell>
                 <TableCell>
                   <span className="text-sm text-slate-500">{formatDate(article.createdAt)}</span>
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                     {article.status === 'published' && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-blue-600 hover:text-blue-700" 
                         title="Xem trên web"
                         aria-label="View on website"
                       >
                         <ExternalLink size={16} />
                       </Button>
                     )}
                     <Link href={`/admin/articles/${article.id}/edit`}>
                       <Button variant="ghost" size="icon" aria-label="Edit">
                         <Edit size={16} />
                       </Button>
                     </Link>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="text-red-500 hover:text-red-600" 
                       onClick={() => handleDelete(article.id)}
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
                 <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                   {searchTerm || filterStatus 
                     ? 'Không tìm thấy kết quả phù hợp' 
                     : 'Chưa có bài viết nào'}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
 
         {sortedData.length > 0 && (
           <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <span className="text-sm text-slate-500">
               Hiển thị {sortedData.length} / {articles.length} bài viết
             </span>
           </div>
         )}
       </Card>
     </div>
   );
 }

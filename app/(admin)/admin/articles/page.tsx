 'use client';
 
 import React, { useState, useMemo, useEffect } from 'react';
 import Link from 'next/link';
import { Search, FileText, ExternalLink, Calendar } from 'lucide-react';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from '../components/ui';
import { SortableHeader, useSortableData } from '../components/TableUtilities';
 import { cn } from '@/lib/utils';
import { fetchArticleList, type ArticleListItem } from '@/lib/api/articles';
 
interface DisplayArticle extends ArticleListItem {}
 
 export default function ArticlesListPage() {
   const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
   const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'published_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
 
   useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          per_page: 20,
          page: currentPage,
        };
        
        if (searchTerm) params.q = searchTerm;

        const articlesRes = await fetchArticleList(params);
        setArticles(articlesRes.data);
        setTotalArticles(articlesRes.meta.pagination.total);
        setHasMore(articlesRes.meta.pagination.has_more);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentPage, searchTerm]);
 
   const handleSort = (key: string) => {
     setSortConfig(prev => ({ 
       key, 
       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
     }));
   };
 
  const sortedData = useSortableData(articles, sortConfig);
 
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
            Quản lý nội dung bài viết và tin tức ({totalArticles} bài viết)
           </p>
         </div>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
           <div className="relative max-w-xs">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <Input 
               placeholder="Tìm bài viết..." 
               className="pl-9 w-48" 
               value={searchTerm} 
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }} 
             />
           </div>
         </div>
 
         <Table>
           <TableHeader>
             <TableRow>
               <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead className="hidden lg:table-cell">Mô tả ngắn</TableHead>
              <SortableHeader label="Ngày xuất bản" sortKey="published_at" sortConfig={sortConfig} onSort={handleSort} />
               <TableHead className="text-right">Hành động</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedData.map(article => (
              <TableRow key={article.id}>
                 <TableCell>
                   <div className="flex items-center gap-3">
                    {article.cover_image_url ? (
                      <img 
                        src={article.cover_image_url} 
                        alt={article.title}
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
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                         <Calendar size={12} />
                        {formatDate(article.published_at)}
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
                  <span className="text-sm text-slate-500">{formatDate(article.published_at)}</span>
                 </TableCell>
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
                   </div>
                 </TableCell>
               </TableRow>
             ))}
             {sortedData.length === 0 && (
               <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  {searchTerm 
                     ? 'Không tìm thấy kết quả phù hợp' 
                     : 'Chưa có bài viết nào'}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
 
         {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <span className="text-sm text-slate-500">
              Hiển thị {sortedData.length} / {totalArticles} bài viết
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
     </div>
   );
 }

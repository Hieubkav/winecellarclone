 'use client';
 
import React, { useEffect, useState } from 'react';
 import { Package, FileText, FolderTree, Eye, TrendingUp, TrendingDown } from 'lucide-react';
 import { Card, Skeleton } from '../components/ui';
 import { cn } from '@/lib/utils';
import { fetchProductList, type ProductListItem } from '@/lib/api/products';
import { fetchArticleList, type ArticleListItem } from '@/lib/api/articles';
import { fetchProductFilters } from '@/lib/api/products';
import Link from 'next/link';
 
 interface StatCardProps {
   title: string;
   value: string | number;
   icon: React.ElementType;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   color: 'blue' | 'green' | 'amber' | 'purple';
   isLoading?: boolean;
 }
 
 const colorVariants = {
   blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
   green: 'bg-green-500/10 text-green-600 dark:text-green-400',
   amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
   purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
 };
 
 const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color, isLoading }) => {
   if (isLoading) {
     return (
       <Card className="p-6">
         <div className="flex items-start justify-between">
           <div className="space-y-3 flex-1">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-8 w-16" />
             <Skeleton className="h-4 w-20" />
           </div>
           <Skeleton className="h-12 w-12 rounded-lg" />
         </div>
       </Card>
     );
   }
 
   return (
     <Card className="p-6 hover:shadow-md transition-shadow duration-200">
       <div className="flex items-start justify-between">
         <div className="space-y-1">
           <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
           <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
           {trend && (
             <div className={cn(
               "flex items-center gap-1 text-sm font-medium",
               trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
             )}>
               {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
               <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
               <span className="text-slate-400 font-normal">vs tháng trước</span>
             </div>
           )}
         </div>
         <div className={cn("p-3 rounded-lg", colorVariants[color])}>
           <Icon size={24} />
         </div>
       </div>
     </Card>
   );
 };
 
 export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [recentArticles, setRecentArticles] = useState<ArticleListItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, articlesRes, filtersRes] = await Promise.all([
          fetchProductList({ per_page: 5, sort: '-created_at' }),
          fetchArticleList({ per_page: 5, sort: '-published_at' }),
          fetchProductFilters(),
        ]);

        setProductCount(productsRes.meta.total);
        setRecentProducts(productsRes.data);
        setArticleCount(articlesRes.meta.pagination.total);
        setRecentArticles(articlesRes.data);
        setCategoryCount(filtersRes.categories.length);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: productCount,
      icon: Package,
      color: 'blue' as const,
    },
    {
      title: 'Bài viết',
      value: articleCount,
      icon: FileText,
      color: 'green' as const,
    },
    {
      title: 'Danh mục',
      value: categoryCount,
      icon: FolderTree,
      color: 'amber' as const,
    },
    {
      title: 'Phân loại',
      value: '-',
      icon: Eye,
      color: 'purple' as const,
    },
  ];

  const formatPrice = (price: number | null) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };
 
   return (
     <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-1">Chào mừng trở lại, Admin!</p>
       </div>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
         {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
         ))}
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sản phẩm gần đây</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả</Link>
          </div>
           <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                 </div>
              ))
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                >
                  {product.main_image_url ? (
                    <img 
                      src={product.main_image_url} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.type?.name || product.category?.name || 'Không phân loại'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có sản phẩm nào</p>
            )}
           </div>
         </Card>
 
         <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bài viết gần đây</h2>
            <Link href="/admin/articles" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả</Link>
          </div>
           <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                 </div>
              ))
            ) : recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/admin/articles/${article.id}/edit`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                >
                  {article.cover_image_url ? (
                    <img 
                      src={article.cover_image_url} 
                      alt={article.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(article.published_at)}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Đã xuất bản
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có bài viết nào</p>
            )}
           </div>
         </Card>
       </div>
     </div>
   );
 }

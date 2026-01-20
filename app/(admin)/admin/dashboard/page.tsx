 'use client';
 
 import React from 'react';
 import { Package, FileText, FolderTree, Eye, TrendingUp, TrendingDown } from 'lucide-react';
 import { Card, Skeleton } from '../components/ui';
 import { cn } from '@/lib/utils';
 
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
   const stats = [
     {
       title: 'Tổng sản phẩm',
       value: 128,
       icon: Package,
       trend: { value: 12, isPositive: true },
       color: 'blue' as const,
     },
     {
       title: 'Bài viết',
       value: 24,
       icon: FileText,
       trend: { value: 8, isPositive: true },
       color: 'green' as const,
     },
     {
       title: 'Danh mục',
       value: 16,
       icon: FolderTree,
       color: 'amber' as const,
     },
     {
       title: 'Lượt xem hôm nay',
       value: '1.2K',
       icon: Eye,
       trend: { value: 5, isPositive: false },
       color: 'purple' as const,
     },
   ];
 
   return (
     <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-1">Chào mừng trở lại, Admin!</p>
       </div>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
         {stats.map((stat) => (
           <StatCard key={stat.title} {...stat} />
         ))}
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
           <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sản phẩm gần đây</h2>
           <div className="space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
                 <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                   <Package size={20} className="text-slate-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                     Rượu vang đỏ Pháp {i}
                   </p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">
                     Thêm 2 ngày trước
                   </p>
                 </div>
                 <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                   {(1500000 + i * 200000).toLocaleString('vi-VN')}đ
                 </p>
               </div>
             ))}
           </div>
         </Card>
 
         <Card className="p-6">
           <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Bài viết gần đây</h2>
           <div className="space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
                 <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                   <FileText size={20} className="text-slate-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                     Hướng dẫn chọn rượu vang {i}
                   </p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">
                     Xuất bản 3 ngày trước
                   </p>
                 </div>
                 <span className={cn(
                   "px-2 py-1 rounded-full text-xs font-medium",
                   i % 2 === 0 
                     ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                     : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                 )}>
                   {i % 2 === 0 ? 'Đã xuất bản' : 'Bản nháp'}
                 </span>
               </div>
             ))}
           </div>
         </Card>
       </div>
     </div>
   );
 }

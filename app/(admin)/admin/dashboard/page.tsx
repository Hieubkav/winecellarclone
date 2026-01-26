'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, FileText, Eye, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Card, Skeleton, Badge } from '../components/ui';
import { cn } from '@/lib/utils';
import { getProductImageUrl, getArticleImageUrl } from '@/lib/utils/image';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  useDashboardStats,
  useTrafficChart,
  useTopProducts,
  useTopArticles,
} from './useDashboardData';
import Link from 'next/link';

// Custom Tooltip cho Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {entry.value.toLocaleString('vi-VN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [chartDays, setChartDays] = useState(7);

  const { data: stats, isLoading: statsLoading, isPlaceholderData: statsPlaceholder } = useDashboardStats();
  const { data: trafficChart = [], isLoading: chartLoading, isPlaceholderData: chartPlaceholder } = useTrafficChart(chartDays);
  const { data: topProducts = [], isLoading: productsLoading, isPlaceholderData: productsPlaceholder } = useTopProducts(7, 5);
  const { data: topArticles = [], isLoading: articlesLoading, isPlaceholderData: articlesPlaceholder } = useTopArticles(7, 5);
  
  // Format số hiển thị
  const formatNumber = (num: number | string) => {
    // Force convert to number to handle any string inputs
    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(n)) return '0';
    return n.toLocaleString('vi-VN');
  };

  // Only show skeleton on initial load (no placeholder data available)
  const statsInitialLoading = statsLoading && !statsPlaceholder;
  const chartInitialLoading = chartLoading && !chartPlaceholder;
  const productsInitialLoading = productsLoading && !productsPlaceholder;
  const articlesInitialLoading = articlesLoading && !articlesPlaceholder;

  const statCards = [
    {
      title: 'Tổng sản phẩm',
      value: stats?.products.total ?? 0,
      icon: Package,
      color: 'blue' as const,
    },
    {
      title: 'Bài viết',
      value: stats?.articles.total ?? 0,
      icon: FileText,
      color: 'green' as const,
    },
    {
      title: 'Lượt xem hôm nay',
      value: stats?.traffic.today.page_views ?? 0,
      icon: Eye,
      trend: stats ? {
        value: stats.traffic.yesterday.page_views > 0 
          ? Math.round(((stats.traffic.today.page_views - stats.traffic.yesterday.page_views) / stats.traffic.yesterday.page_views) * 100)
          : 0,
        isPositive: stats.traffic.today.page_views >= stats.traffic.yesterday.page_views,
      } : undefined,
      color: 'amber' as const,
    },
    {
      title: 'Khách truy cập hôm nay',
      value: stats?.traffic.today.visitors ?? 0,
      icon: Users,
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
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={statsInitialLoading} />
         ))}
       </div>
 
      {/* Traffic Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Lượt truy cập</h2>
          <div className="flex gap-2">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setChartDays(days)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full transition-colors",
                  chartDays === days 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {days} ngày
              </button>
            ))}
          </div>
        </div>
        
        {chartInitialLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={trafficChart}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="label" 
                  className="text-xs"
                  tick={{ fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Area
                  type="monotone"
                  dataKey="page_views"
                  name="Lượt xem"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPageViews)"
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Khách truy cập"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#colorVisitors)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Stats summary */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(trafficChart.reduce((sum, d) => sum + Number(d.page_views || 0), 0))}
                </p>
                <p className="text-xs text-slate-500">Tổng lượt xem</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(trafficChart.reduce((sum, d) => sum + Number(d.visitors || 0), 0))}
                </p>
                <p className="text-xs text-slate-500">Khách truy cập</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(trafficChart.reduce((sum, d) => sum + Number(d.product_views || 0), 0))}
                </p>
                <p className="text-xs text-slate-500">Xem sản phẩm</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(trafficChart.reduce((sum, d) => sum + Number(d.cta_clicks || 0), 0))}
                </p>
                <p className="text-xs text-slate-500">Click liên hệ</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
         <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sản phẩm xem nhiều</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả</Link>
          </div>
           <div className="space-y-4">
            {productsInitialLoading ? (
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
            ) : topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/san-pham/${product.slug}`}
                  target="_blank"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                >
                  <span className="w-6 text-center text-sm font-bold text-slate-400">#{index + 1}</span>
                  {product.image_url ? (
                    <Image
                      src={getProductImageUrl(product.image_url)}
                      alt={product.name}
                      width={48}
                      height={48}
                      sizes="48px"
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
                  </div>
                  <Badge variant="info">{product.views} lượt xem</Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có sản phẩm nào</p>
            )}
           </div>
         </Card>
 
        {/* Recent Events */}
        {/* Top Articles */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bài viết xem nhiều</h2>
            <Link href="/admin/articles" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả</Link>
          </div>
          <div className="space-y-4">
            {articlesInitialLoading ? (
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
            ) : topArticles.length > 0 ? (
              topArticles.map((article, index) => (
                <Link 
                  key={article.id} 
                  href={`/bai-viet/${article.slug}`}
                  target="_blank"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                >
                  <span className="w-6 text-center text-sm font-bold text-slate-400">#{index + 1}</span>
                  {article.image_url ? (
                    <Image
                      src={getArticleImageUrl(article.image_url)}
                      alt={article.title}
                      width={48}
                      height={48}
                      sizes="48px"
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
                  </div>
                  <Badge variant="info">{article.views} lượt xem</Badge>
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

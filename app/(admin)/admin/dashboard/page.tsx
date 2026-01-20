'use client';

import React, { useState } from 'react';
import { Package, FileText, Eye, TrendingUp, TrendingDown, Users, MousePointerClick, Activity } from 'lucide-react';
import { Card, Skeleton, Badge } from '../components/ui';
import { cn } from '@/lib/utils';
import {
  useDashboardStats,
  useTrafficChart,
  useTopProducts,
  useRecentEvents,
} from './useDashboardData';
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
  const [chartDays, setChartDays] = useState(7);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trafficChart = [], isLoading: chartLoading } = useTrafficChart(chartDays);
  const { data: topProducts = [], isLoading: productsLoading } = useTopProducts(7, 5);
  const { data: recentEvents = [], isLoading: eventsLoading } = useRecentEvents(10);

  const isLoading = statsLoading || chartLoading || productsLoading || eventsLoading;
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

  const maxPageViews = Math.max(...trafficChart.map(d => d.page_views), 1);
 
   return (
     <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-1">Chào mừng trở lại, Admin!</p>
       </div>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
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
        
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="space-y-4">
            {/* Simple bar chart */}
            <div className="flex items-end gap-1 h-32">
              {trafficChart.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(day.page_views / maxPageViews) * 100}%`, minHeight: day.page_views > 0 ? '4px' : '0' }}
                    title={`${day.label}: ${day.page_views} lượt xem`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {trafficChart.map((day) => (
                <div key={day.date} className="flex-1 text-center">
                  <span className="text-[10px] text-slate-500">{day.label}</span>
                </div>
              ))}
            </div>
            
            {/* Stats summary */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {trafficChart.reduce((sum, d) => sum + d.page_views, 0)}
                </p>
                <p className="text-xs text-slate-500">Tổng lượt xem</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {trafficChart.reduce((sum, d) => sum + d.visitors, 0)}
                </p>
                <p className="text-xs text-slate-500">Khách truy cập</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {trafficChart.reduce((sum, d) => sum + d.product_views, 0)}
                </p>
                <p className="text-xs text-slate-500">Xem sản phẩm</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {trafficChart.reduce((sum, d) => sum + d.cta_clicks, 0)}
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
                    <img 
                      src={product.image_url} 
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
         <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hoạt động gần đây</h2>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto admin-scrollbar">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                 </div>
              ))
            ) : recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    event.event_type === 'product_view' && "bg-blue-100 dark:bg-blue-900/30",
                    event.event_type === 'article_view' && "bg-green-100 dark:bg-green-900/30",
                    event.event_type === 'cta_contact' && "bg-amber-100 dark:bg-amber-900/30",
                  )}>
                    {event.event_type === 'product_view' && <Package size={14} className="text-blue-600" />}
                    {event.event_type === 'article_view' && <FileText size={14} className="text-green-600" />}
                    {event.event_type === 'cta_contact' && <MousePointerClick size={14} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      <span className="font-medium">{event.event_label}</span>
                      {event.product && (
                        <Link href={`/san-pham/${event.product.slug}`} target="_blank" className="text-blue-600 hover:underline ml-1">
                          {event.product.name}
                        </Link>
                      )}
                      {event.article && (
                        <Link href={`/bai-viet/${event.article.slug}`} target="_blank" className="text-green-600 hover:underline ml-1">
                          {event.article.title}
                        </Link>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{event.time_ago}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">7 ngày qua</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats?.traffic.last_7_days.page_views ?? 0}
              </p>
              <p className="text-xs text-slate-400">lượt xem</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">7 ngày qua</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats?.traffic.last_7_days.visitors ?? 0}
              </p>
              <p className="text-xs text-slate-400">khách truy cập</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">30 ngày qua</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats?.traffic.last_30_days.page_views ?? 0}
              </p>
              <p className="text-xs text-slate-400">lượt xem</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <MousePointerClick size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Hôm nay</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats?.traffic.today.cta_clicks ?? 0}
              </p>
              <p className="text-xs text-slate-400">click liên hệ</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

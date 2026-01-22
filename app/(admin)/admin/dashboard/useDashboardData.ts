 import { useQuery, keepPreviousData } from '@tanstack/react-query';
 import {
   fetchDashboardStats,
   fetchTrafficChart,
   fetchTopProducts,
  fetchTopArticles,
   fetchRecentEvents,
   type DashboardStats,
   type TrafficChartData,
   type TopProduct,
  type TopArticle,
   type RecentEvent,
 } from '@/lib/api/admin';
 
 const REFETCH_INTERVAL = 30 * 1000; // 30 seconds
const STALE_TIME = 20 * 1000; // 20 seconds - data considered fresh
 
 export function useDashboardStats() {
   return useQuery<DashboardStats>({
     queryKey: ['dashboard', 'stats'],
     queryFn: fetchDashboardStats,
     refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
   });
 }
 
 export function useTrafficChart(days: number) {
   return useQuery<TrafficChartData[]>({
     queryKey: ['dashboard', 'traffic-chart', days],
     queryFn: () => fetchTrafficChart(days),
     refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
   });
 }
 
 export function useTopProducts(days: number = 7, limit: number = 5) {
   return useQuery<TopProduct[]>({
     queryKey: ['dashboard', 'top-products', days, limit],
     queryFn: () => fetchTopProducts(days, limit),
     refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
   });
 }
 
 export function useRecentEvents(limit: number = 10) {
   return useQuery<RecentEvent[]>({
     queryKey: ['dashboard', 'recent-events', limit],
     queryFn: () => fetchRecentEvents(limit),
     refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
   });
 }

export function useTopArticles(days: number = 7, limit: number = 5) {
  return useQuery<TopArticle[]>({
    queryKey: ['dashboard', 'top-articles', days, limit],
    queryFn: () => fetchTopArticles(days, limit),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

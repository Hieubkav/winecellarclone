 import { useQuery, keepPreviousData } from '@tanstack/react-query';
 import {
   fetchDashboardBootstrap,
   type DashboardBootstrap,
 } from '@/lib/api/admin';
 
const STALE_TIME = 5 * 60 * 1000;
 
 export function useDashboardBootstrap(days: number = 7, limit: number = 5) {
   return useQuery<DashboardBootstrap>({
     queryKey: ['dashboard', 'bootstrap', days, limit],
     queryFn: () => fetchDashboardBootstrap(days, limit),
     staleTime: STALE_TIME,
     placeholderData: keepPreviousData,
     retry: false,
   });
 }

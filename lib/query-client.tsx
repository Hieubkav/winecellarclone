'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to ensure fresh instance per request
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data remains fresh for 5 minutes before refetching
            staleTime: 5 * 60 * 1000, // 5 minutes
            
            // Data stays in cache for 10 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            
            // Don't refetch on window focus (reduces unnecessary requests)
            refetchOnWindowFocus: false,
            
            // Don't refetch on mount if data is still fresh
            refetchOnMount: false,
            
            // Retry failed queries once
            retry: 1,
            
            // Stale-while-revalidate: show cached data while fetching fresh data
            keepPreviousData: true,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

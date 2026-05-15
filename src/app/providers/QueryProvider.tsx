import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import i18next from 'i18next'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Eğer sorguya özel gizlilik istenmediyse tekilleştirilmiş toast göster
      if (query.meta?.silent !== true) {
        const serverMessage = error?.response?.data?.message
        toast.error(serverMessage || i18next.t('errors.fetchFailed'), {
          id: 'global-query-error', // Aynı ID'li toast'lar üst üste binmez
        })
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      if (mutation.meta?.silent !== true) {
        const serverMessage = error?.response?.data?.message
        toast.error(serverMessage || i18next.t('errors.actionFailed'), {
          id: 'global-mutation-error',
        })
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min
      gcTime: 1000 * 60 * 10,        // 10 min
      retry: (failureCount, error: any) => {
        // Kritik auth veya bulunamadı hatalarında boşa retry atıp ağı yorma
        if ([401, 403, 404].includes(error.response?.status)) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
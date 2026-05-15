import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import i18next from 'i18next'
import { isAxiosError } from 'axios'

function getErrorMessage(error: Error): string | undefined {
  if (isAxiosError(error)) return error.response?.data?.message
  return error.message
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent !== true) {
        const serverMessage = getErrorMessage(error)
        toast.error(serverMessage || i18next.t('errors.fetchFailed'), {
          id: 'global-query-error',
        })
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent !== true) {
        const serverMessage = getErrorMessage(error)
        toast.error(serverMessage || i18next.t('errors.actionFailed'), {
          id: 'global-mutation-error',
        })
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (isAxiosError(error) && [401, 403, 404].includes(error.response?.status ?? 0)) return false
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
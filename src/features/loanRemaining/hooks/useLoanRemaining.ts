import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanRemaining,
  deleteLoanRemaining,
  type LoanRemainingListParams,
} from '../api/loanRemainingApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanRemainingKeys = {
  all: ['loanRemaining'] as const,
  lists: () => [...loanRemainingKeys.all, 'list'] as const,
  list: (params: LoanRemainingListParams) => [...loanRemainingKeys.lists(), params] as const,
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useLoanRemaining(params: LoanRemainingListParams) {
  return useQuery({
    queryKey: loanRemainingKeys.list(params),
    queryFn: () => fetchLoanRemaining(params),
  })
}

export function useDeleteLoanRemaining() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteLoanRemaining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanRemainingKeys.lists() })
      toast.success(t('loanRemaining.deleteSuccess', 'Ýazgy üstünlikli pozuldy'))
    },
    onError: () => {
      toast.error(t('loanRemaining.deleteError', 'Pozmak başartmady, gaýtadan synanyşyň'))
    },
  })
}
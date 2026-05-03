import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanOrderMobiles,
  deleteLoanOrderMobile,
  type LoanOrderMobileListParams,
} from '../api/loanOrderMobilesApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanOrderMobileKeys = {
  all: ['loanOrderMobiles'] as const,
  lists: () => [...loanOrderMobileKeys.all, 'list'] as const,
  list: (params: LoanOrderMobileListParams) => [...loanOrderMobileKeys.lists(), params] as const,
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useLoanOrderMobiles(params: LoanOrderMobileListParams) {
  return useQuery({
    queryKey: loanOrderMobileKeys.list(params),
    queryFn: () => fetchLoanOrderMobiles(params),
  })
}

export function useDeleteLoanOrderMobile() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => deleteLoanOrderMobile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanOrderMobileKeys.lists() })
      toast.success(t('loanOrderMobiles.deleteSuccess', 'Sargyt üstünlikli pozuldy'))
    },
    onError: () => {
      toast.error(t('loanOrderMobiles.deleteError', 'Pozmak başartmady, gaýtadan synanyşyň'))
    },
  })
}
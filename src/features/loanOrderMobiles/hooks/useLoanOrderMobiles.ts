import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanOrderMobiles,
  deleteLoanOrderMobile,
  getLoanOrderMobileById,
  createLoanOrderMobile,
  updateLoanOrderMobile,
  type LoanOrderMobileListParams,
  type LoanOrderMobilePayload,
} from '../api/loanOrderMobilesApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanOrderMobileKeys = {
  all: ['loanOrderMobiles'] as const,
  lists: () => [...loanOrderMobileKeys.all, 'list'] as const,
  list: (params: LoanOrderMobileListParams) => [...loanOrderMobileKeys.lists(), params] as const,
  details: () => [...loanOrderMobileKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanOrderMobileKeys.details(), id] as const,
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
  })
}

export function useLoanOrderMobileById(id: string) {
  return useQuery({
    queryKey: loanOrderMobileKeys.detail(id),
    queryFn: () => getLoanOrderMobileById(id),
    enabled: !!id,
  })
}

export function useCreateLoanOrderMobile() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanOrderMobilePayload) => createLoanOrderMobile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanOrderMobileKeys.lists() })
      toast.success(t('loanOrderMobiles.createSuccess', 'Sargyt üstünlikli döredildi'))
    },
  })
}

export function useUpdateLoanOrderMobile() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LoanOrderMobilePayload> }) =>
      updateLoanOrderMobile(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: loanOrderMobileKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanOrderMobileKeys.detail(variables.id) })
      toast.success(t('loanOrderMobiles.updateSuccess', 'Sargyt üstünlikli üýtgedildi'))
    },
  })
}
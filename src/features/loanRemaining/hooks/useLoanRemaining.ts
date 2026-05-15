import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanRemaining,
  deleteLoanRemaining,
  fetchLoanRemainingById,
  createLoanRemaining,
  updateLoanRemaining,
  type LoanRemainingListParams,
  type LoanRemainingPayload,
} from '../api/loanRemainingApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanRemainingKeys = {
  all: ['loanRemaining'] as const,
  lists: () => [...loanRemainingKeys.all, 'list'] as const,
  list: (params: LoanRemainingListParams) => [...loanRemainingKeys.lists(), params] as const,
  details: () => [...loanRemainingKeys.all, 'detail'] as const,
  detail: (id: number) => [...loanRemainingKeys.details(), id] as const,
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
  })
}

export function useLoanRemainingById(id?: string) {
  return useQuery({
    queryKey: loanRemainingKeys.detail(Number(id)),
    queryFn: () => fetchLoanRemainingById(Number(id)),
    enabled: !!id,
  })
}

export function useCreateLoanRemaining() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanRemainingPayload) => createLoanRemaining(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanRemainingKeys.lists() })
      toast.success(t('loanRemaining.createSuccess', 'Üstünlikli döredildi'))
    },
  })
}

export function useUpdateLoanRemaining(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanRemainingPayload) => updateLoanRemaining(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanRemainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanRemainingKeys.detail(id) })
      toast.success(t('loanRemaining.updateSuccess', 'Üstünlikli üýtgedildi'))
    },
  })
}
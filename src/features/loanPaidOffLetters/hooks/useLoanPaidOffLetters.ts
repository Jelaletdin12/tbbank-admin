import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanPaidOffLetters,
  deleteLoanPaidOffLetter,
  fetchLoanPaidOffLetterById,
  createLoanPaidOffLetter,
  updateLoanPaidOffLetter,
  type LoanPaidOffLetterListParams,
  type LoanPaidOffLetterPayload,
} from '../api/loanPaidOffLettersApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanPaidOffLetterKeys = {
  all: ['loanPaidOffLetters'] as const,
  lists: () => [...loanPaidOffLetterKeys.all, 'list'] as const,
  list: (params: LoanPaidOffLetterListParams) =>
    [...loanPaidOffLetterKeys.lists(), params] as const,
  details: () => [...loanPaidOffLetterKeys.all, 'detail'] as const,
  detail: (id: number) => [...loanPaidOffLetterKeys.details(), id] as const,
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useLoanPaidOffLetters(params: LoanPaidOffLetterListParams) {
  return useQuery({
    queryKey: loanPaidOffLetterKeys.list(params),
    queryFn: () => fetchLoanPaidOffLetters(params),
  })
}

export function useDeleteLoanPaidOffLetter() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteLoanPaidOffLetter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanPaidOffLetterKeys.lists() })
      toast.success(t('loanPaidOffLetters.deleteSuccess', 'Güwanama üstünlikli pozuldy'))
    },
  })
}

export function useLoanPaidOffLetterById(id?: string) {
  return useQuery({
    queryKey: loanPaidOffLetterKeys.detail(Number(id)),
    queryFn: () => fetchLoanPaidOffLetterById(Number(id)),
    enabled: !!id,
  })
}

export function useCreateLoanPaidOffLetter() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanPaidOffLetterPayload) => createLoanPaidOffLetter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanPaidOffLetterKeys.lists() })
      toast.success(t('loanPaidOffLetters.createSuccess', 'Üstünlikli döredildi'))
    },
  })
}

export function useUpdateLoanPaidOffLetter(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanPaidOffLetterPayload) => updateLoanPaidOffLetter(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanPaidOffLetterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanPaidOffLetterKeys.detail(id) })
      toast.success(t('loanPaidOffLetters.updateSuccess', 'Üstünlikli üýtgedildi'))
    },
  })
}
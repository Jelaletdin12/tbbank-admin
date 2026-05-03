import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  fetchLoanPaidOffLetters,
  deleteLoanPaidOffLetter,
  type LoanPaidOffLetterListParams,
} from '../api/loanPaidOffLettersApi'

// ─── Query keys ────────────────────────────────────────────────────────────────

export const loanPaidOffLetterKeys = {
  all: ['loanPaidOffLetters'] as const,
  lists: () => [...loanPaidOffLetterKeys.all, 'list'] as const,
  list: (params: LoanPaidOffLetterListParams) =>
    [...loanPaidOffLetterKeys.lists(), params] as const,
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
    onError: () => {
      toast.error(t('loanPaidOffLetters.deleteError', 'Pozmak başartmady, gaýtadan synanyşyň'))
    },
  })
}
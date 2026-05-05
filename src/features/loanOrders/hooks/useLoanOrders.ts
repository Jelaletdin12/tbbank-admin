import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchLoanOrders,
  getLoanOrderById,
  createLoanOrder,
  updateLoanOrder,
  deleteLoanOrder,
  type LoanOrdersParams,
  type LoanOrderPayload,
} from '../api/loanOrdersApi'

const LOAN_ORDERS_KEY = 'loan-orders'

export function useLoanOrders(params: LoanOrdersParams) {
  return useQuery({
    queryKey: [LOAN_ORDERS_KEY, params],
    queryFn: () => fetchLoanOrders(params),
    placeholderData: (prev) => prev,
  })
}

export function useLoanOrderById(id: string) {
  return useQuery({
    queryKey: [LOAN_ORDERS_KEY, id],
    queryFn: () => getLoanOrderById(id),
    enabled: !!id,
  })
}

export function useCreateLoanOrder() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoanOrderPayload) => createLoanOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOAN_ORDERS_KEY] })
      toast.success(t('loanOrders.createSuccess', 'Karz sargyt üstünlikli döredildi'))
    },
    onError: () => {
      toast.error(t('loanOrders.createError', 'Karz sargyt döretmekde säwlik ýüze çykdy'))
    },
  })
}

export function useUpdateLoanOrder() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LoanOrderPayload> }) =>
      updateLoanOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOAN_ORDERS_KEY] })
      toast.success(t('loanOrders.updateSuccess', 'Karz sargyt üstünlikli üýtgedildi'))
    },
    onError: () => {
      toast.error(t('loanOrders.updateError', 'Karz sargyt üýtgetmekde säwlik ýüze çykdy'))
    },
  })
}

export function useDeleteLoanOrder() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLoanOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOAN_ORDERS_KEY] })
      toast.success(t('loanOrders.deleteSuccess', 'Karz sargyt üstünlikli pozuldy'))
    },
    onError: () => {
      toast.error(t('loanOrders.deleteError', 'Karz sargyt pozmakda säwlik ýüze çykdy'))
    },
  })
}
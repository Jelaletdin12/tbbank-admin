import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  intlPaymentApi,
  type IntlPaymentListParams,
  type IntlPaymentCreatePayload,
  type IntlPaymentUpdatePayload,
} from '../api/visaMasterPaymentsApi'

export const INTL_PAYMENT_KEYS = {
  all:    ['intl-payments-visa'] as const,
  lists:  () => [...INTL_PAYMENT_KEYS.all, 'list'] as const,
  list:   (p: IntlPaymentListParams) => [...INTL_PAYMENT_KEYS.lists(), p] as const,
  detail: (id: string) => [...INTL_PAYMENT_KEYS.all, 'detail', id] as const,
}

export function useIntlPayments(params: IntlPaymentListParams) {
  return useQuery({
    queryKey: INTL_PAYMENT_KEYS.list(params),
    queryFn:  () => intlPaymentApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useIntlPayment(id: string) {
  return useQuery({
    queryKey: INTL_PAYMENT_KEYS.detail(id),
    queryFn:  () => intlPaymentApi.getById(id),
    enabled:  !!id,
  })
}

export function useCreateIntlPayment() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: IntlPaymentCreatePayload) => intlPaymentApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTL_PAYMENT_KEYS.lists() })
      toast.success(t('intlPayment.createSuccess', 'Töleg döredildi'))
    },
  })
}

export function useUpdateIntlPayment(id: string) {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: IntlPaymentUpdatePayload) => intlPaymentApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTL_PAYMENT_KEYS.lists() })
      qc.invalidateQueries({ queryKey: INTL_PAYMENT_KEYS.detail(id) })
      toast.success(t('intlPayment.updateSuccess', 'Töleg üýtgedildi'))
    },
  })
}

export function useDeleteIntlPayment() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => intlPaymentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTL_PAYMENT_KEYS.lists() })
      toast.success(t('intlPayment.deleteSuccess', 'Töleg pozuldy'))
    },
  })
}

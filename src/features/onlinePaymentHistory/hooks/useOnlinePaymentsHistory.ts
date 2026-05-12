// features/onlinePaymentHistory/hooks/useOnlinePaymentHistory.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchOnlinePayments,
  fetchOnlinePaymentById,
  triggerPaymentCallback,
  type OnlinePaymentListParams,
} from '../api/onlinePaymentsHistoryApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const onlinePaymentKeys = {
  all:    ['onlinePayments']                                        as const,
  lists:  () => [...onlinePaymentKeys.all, 'list']                  as const,
  list:   (params: OnlinePaymentListParams) =>
            [...onlinePaymentKeys.lists(), params]                  as const,
  detail: (id: number) =>
            [...onlinePaymentKeys.all, 'detail', id]               as const,
}

// ─── useGetOnlinePayments ─────────────────────────────────────────────────────

export function useGetOnlinePayments(params: OnlinePaymentListParams = {}) {
  return useQuery({
    queryKey: onlinePaymentKeys.list(params),
    queryFn:  () => fetchOnlinePayments(params),
  })
}

// ─── useGetOnlinePaymentById ──────────────────────────────────────────────────

export function useGetOnlinePaymentById(id: number) {
  return useQuery({
    queryKey: onlinePaymentKeys.detail(id),
    queryFn:  () => fetchOnlinePaymentById(id),
    enabled:  !!id,
  })
}

// ─── useTriggerPaymentCallback ────────────────────────────────────────────────

export function useTriggerPaymentCallback() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => triggerPaymentCallback(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: onlinePaymentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: onlinePaymentKeys.lists() })
      toast.success(t('onlinePayments.toast.callbackTriggered', 'Callback ugradyldy'))
    },
    onError: () => {
      toast.error(t('onlinePayments.toast.callbackError', 'Callback ugratmak başartmady'))
    },
  })
}
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSberPaymentOrders,
  getSberPaymentOrderById,
  createSberPaymentOrder,
  updateSberPaymentOrder,
  deleteSberPaymentOrder,
  type CreateSberPaymentPayload,
  type UpdateSberPaymentPayload,
} from '../api/sberPaymentsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const sberPaymentKeys = {
  all: ['sber-payments'] as const,
  lists: () => [...sberPaymentKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...sberPaymentKeys.lists(), params] as const,
  details: () => [...sberPaymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...sberPaymentKeys.details(), id] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSberPaymentOrders(params: {
  page?: number
  perPage?: number
  search?: string
  welayat?: string
  sahamca?: string
  status?: string
}) {
  return useQuery({
    queryKey: sberPaymentKeys.list(params),
    queryFn: () => getSberPaymentOrders(params),
  })
}

export function useSberPaymentOrder(id: string) {
  return useQuery({
    queryKey: sberPaymentKeys.detail(id),
    queryFn: () => getSberPaymentOrderById(id),
    enabled: !!id,
  })
}

export function useCreateSberPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSberPaymentPayload) => createSberPaymentOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sberPaymentKeys.lists() })
    },
  })
}

export function useUpdateSberPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSberPaymentPayload) => updateSberPaymentOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sberPaymentKeys.lists() })
      queryClient.setQueryData(sberPaymentKeys.detail(data.id), data)
    },
  })
}

export function useDeleteSberPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSberPaymentOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sberPaymentKeys.lists() })
    },
  })
}

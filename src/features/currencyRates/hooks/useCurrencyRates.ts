// features/currencyRates/hooks/useCurrencyRates.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchCurrencyRates,
  fetchCurrencyRateById,
  createCurrencyRate,
  updateCurrencyRate,
  deleteCurrencyRate,
  type CurrencyRateListParams,
  type CreateCurrencyRatePayload,
  type UpdateCurrencyRatePayload,
} from '../api/currencyRatesApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const currencyRateKeys = {
  all:    ['currencyRates']                                    as const,
  lists:  () => [...currencyRateKeys.all, 'list']              as const,
  list:   (params: CurrencyRateListParams) =>
            [...currencyRateKeys.lists(), params]              as const,
  detail: (id: number) =>
            [...currencyRateKeys.all, 'detail', id]            as const,
}

// ─── useGetCurrencyRates ──────────────────────────────────────────────────────

export function useGetCurrencyRates(params: CurrencyRateListParams = {}) {
  return useQuery({
    queryKey: currencyRateKeys.list(params),
    queryFn:  () => fetchCurrencyRates(params),
  })
}

// ─── useGetCurrencyRateById ───────────────────────────────────────────────────

export function useGetCurrencyRateById(id: number) {
  return useQuery({
    queryKey: currencyRateKeys.detail(id),
    queryFn:  () => fetchCurrencyRateById(id),
    enabled:  !!id,
  })
}

// ─── useCreateCurrencyRate ────────────────────────────────────────────────────

export function useCreateCurrencyRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCurrencyRatePayload) => createCurrencyRate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() })
      toast.success(t('currencyRates.toast.created', 'Walýuta kursy döredildi'))
    },
  })
}

// ─── useUpdateCurrencyRate ────────────────────────────────────────────────────

export function useUpdateCurrencyRate(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCurrencyRatePayload) => updateCurrencyRate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.detail(id) })
      toast.success(t('currencyRates.toast.updated', 'Walýuta kursy üýtgedildi'))
    },
  })
}

// ─── useDeleteCurrencyRate ────────────────────────────────────────────────────

export function useDeleteCurrencyRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteCurrencyRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() })
      toast.success(t('currencyRates.toast.deleted', 'Walýuta kursy pozuldy'))
    },
  })
}
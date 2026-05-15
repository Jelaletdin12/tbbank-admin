import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  fetchCardOrders,
  fetchCardOrderById,
  createCardOrder,
  updateCardOrder,
  deleteCardOrder,
  fetchCardIssuanceReasons,
  fetchCardTypes,
  fetchProvinces,
  fetchBranches,
} from '../api/orderNewCardApi'
import type {
  CardOrderFilters,
  CreateCardOrderPayload,
  UpdateCardOrderPayload,
} from '../api/orderNewCardApi'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const cardOrderKeys = {
  all:     ['card-orders']                                           as const,
  lists:   () => [...cardOrderKeys.all, 'list']                     as const,
  list:    (f: CardOrderFilters) => [...cardOrderKeys.lists(), f]   as const,
  details: () => [...cardOrderKeys.all, 'detail']                   as const,
  detail:  (id: string) => [...cardOrderKeys.details(), id]        as const,
  reasons: ['card-order-reasons']                                   as const,
  types:   ['card-order-types']                                     as const,
  provinces: ['provinces']                                          as const,
  branches:  (provinceId?: number) => ['branches', provinceId]     as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCardOrders(filters: CardOrderFilters) {
  return useQuery({
    queryKey: cardOrderKeys.list(filters),
    queryFn:  () => fetchCardOrders(filters),
    placeholderData: (prev) => prev,
  })
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useCardOrderById(id: string) {
  return useQuery({
    queryKey: cardOrderKeys.detail(id),
    queryFn:  () => fetchCardOrderById(id),
    enabled:  Boolean(id),
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCardOrder() {
  const { t } = useTranslation()
  const qc    = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCardOrderPayload) => createCardOrder(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cardOrderKeys.lists() })
      toast.success(t('cardOrder.createSuccess', 'Kart sargyt üstünlikli döredildi'))
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateCardOrder(id: string) {
  const { t } = useTranslation()
  const qc    = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCardOrderPayload) => updateCardOrder(id, payload),

    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: cardOrderKeys.lists() })
      qc.setQueryData(cardOrderKeys.detail(id), updated)
      toast.success(t('cardOrder.updateSuccess', 'Kart sargyt üstünlikli täzelendi'))
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCardOrder() {
  const { t } = useTranslation()
  const qc    = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCardOrder(id),

    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: cardOrderKeys.lists() })
      qc.removeQueries({ queryKey: cardOrderKeys.detail(id) })
      toast.success(t('cardOrder.deleteSuccess', 'Kart sargyt üstünlikli pozuldy'))
    },
  })
}

// ─── Lookup hooks ─────────────────────────────────────────────────────────────

export function useCardIssuanceReasons() {
  return useQuery({
    queryKey: cardOrderKeys.reasons,
    queryFn:  fetchCardIssuanceReasons,
    staleTime: Infinity,
  })
}

export function useCardTypes() {
  return useQuery({
    queryKey: cardOrderKeys.types,
    queryFn:  fetchCardTypes,
    staleTime: Infinity,
  })
}

export function useProvinces() {
  return useQuery({
    queryKey: cardOrderKeys.provinces,
    queryFn:  fetchProvinces,
    staleTime: Infinity,
  })
}

export function useBranches(provinceId?: number) {
  return useQuery({
    queryKey: cardOrderKeys.branches(provinceId),
    queryFn:  () => fetchBranches(provinceId),
    enabled:  provinceId !== undefined && provinceId !== 0,
    staleTime: Infinity,
  })
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchCardReasons,
  fetchCardReasonById,
  createCardReason,
  updateCardReason,
  deleteCardReason,
  type CreateCardReasonPayload,
  type UpdateCardReasonPayload,
} from '../api/cardReasonsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const cardReasonKeys = {
  all: ['cardReasons'] as const,
  lists: () => [...cardReasonKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...cardReasonKeys.lists(), params] as const,
  detail: (id: number) => [...cardReasonKeys.all, 'detail', id] as const,
}

// ─── useCardReasons ────────────────────────────────────────────────────────────

export function useCardReasons(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}) {
  return useQuery({
    queryKey: cardReasonKeys.list(params),
    queryFn: () => fetchCardReasons(params),
  })
}

// ─── useCardReasonById ─────────────────────────────────────────────────────────

export function useCardReasonById(id: number) {
  return useQuery({
    queryKey: cardReasonKeys.detail(id),
    queryFn: () => fetchCardReasonById(id),
    enabled: !!id,
  })
}

// ─── useCreateCardReason ───────────────────────────────────────────────────────

export function useCreateCardReason() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCardReasonPayload) => createCardReason(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardReasonKeys.lists() })
      toast.success(t('CardReasons.toast.createSuccess', 'Kart ýagdaýy döredildi'))
    },
    onError: () => {
      toast.error(t('CardReasons.toast.createError', 'Döretmek başartmady'))
    },
  })
}

// ─── useUpdateCardReason ───────────────────────────────────────────────────────

export function useUpdateCardReason() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCardReasonPayload) => updateCardReason(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardReasonKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cardReasonKeys.detail(data.id) })
      toast.success(t('CardReasons.toast.updateSuccess', 'Kart ýagdaýy täzelendi'))
    },
    onError: () => {
      toast.error(t('CardReasons.toast.updateError', 'Täzelemek başartmady'))
    },
  })
}

// ─── useDeleteCardReason ───────────────────────────────────────────────────────

export function useDeleteCardReason() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteCardReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardReasonKeys.lists() })
      toast.success(t('CardReasons.toast.deleteSuccess', 'Kart ýagdaýy öçürildi'))
    },
    onError: () => {
      toast.error(t('CardReasons.toast.deleteError', 'Öçürmek başartmady'))
    },
  })
}
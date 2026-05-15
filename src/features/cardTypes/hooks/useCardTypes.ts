import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchCardTypes,
  fetchCardTypeById,
  createCardType,
  updateCardType,
  deleteCardType,
  type CreateCardTypePayload,
  type UpdateCardTypePayload,
} from '../api/cardTypesApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const cardTypeKeys = {
  all: ['cardTypes'] as const,
  lists: () => [...cardTypeKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...cardTypeKeys.lists(), params] as const,
  detail: (id: number) => [...cardTypeKeys.all, 'detail', id] as const,
}

// ─── useCardTypes ─────────────────────────────────────────────────────────────

export function useCardTypes(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}) {
  return useQuery({
    queryKey: cardTypeKeys.list(params),
    queryFn: () => fetchCardTypes(params),
  })
}

// ─── useCardTypeById ──────────────────────────────────────────────────────────

export function useCardTypeById(id: number) {
  return useQuery({
    queryKey: cardTypeKeys.detail(id),
    queryFn: () => fetchCardTypeById(id),
    enabled: !!id,
  })
}

// ─── useCreateCardType ────────────────────────────────────────────────────────

export function useCreateCardType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCardTypePayload) => createCardType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardTypeKeys.lists() })
      toast.success(t('cardTypes.toast.createSuccess', 'Kart görnüşi döredildi'))
    },
  })
}

// ─── useUpdateCardType ────────────────────────────────────────────────────────

export function useUpdateCardType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCardTypePayload) => updateCardType(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cardTypeKeys.detail(data.id) })
      toast.success(t('cardTypes.toast.updateSuccess', 'Kart görnüşi täzelendi'))
    },
  })
}

// ─── useDeleteCardType ────────────────────────────────────────────────────────

export function useDeleteCardType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteCardType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardTypeKeys.lists() })
      toast.success(t('cardTypes.toast.deleteSuccess', 'Kart görnüşi öçürildi'))
    },
  })
}
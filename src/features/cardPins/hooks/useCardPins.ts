import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cardPinApi, type CardPinListParams, type CardPinCreatePayload, type CardPinUpdatePayload } from '../api/cardPinApi'

export const CARD_PIN_KEYS = {
  all:    ['card-pins'] as const,
  lists:  () => [...CARD_PIN_KEYS.all, 'list'] as const,
  list:   (p: CardPinListParams) => [...CARD_PIN_KEYS.lists(), p] as const,
  detail: (id: string) => [...CARD_PIN_KEYS.all, 'detail', id] as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCardPins(params: CardPinListParams) {
  return useQuery({
    queryKey: CARD_PIN_KEYS.list(params),
    queryFn:  () => cardPinApi.list(params),
    placeholderData: (prev) => prev,
  })
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useCardPin(id: string) {
  return useQuery({
    queryKey: CARD_PIN_KEYS.detail(id),
    queryFn:  () => cardPinApi.getById(id),
    enabled:  !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCardPin() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CardPinCreatePayload) => cardPinApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CARD_PIN_KEYS.lists() })
      toast.success(t('cardPin.createSuccess', 'Kart pin bukja döredildi'))
    },
    onError: () => {
      toast.error(t('cardPin.createError', 'Döretmek başartmady'))
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateCardPin(id: string) {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CardPinUpdatePayload) => cardPinApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CARD_PIN_KEYS.lists() })
      qc.invalidateQueries({ queryKey: CARD_PIN_KEYS.detail(id) })
      toast.success(t('cardPin.updateSuccess', 'Kart pin bukja üýtgedildi'))
    },
    onError: () => {
      toast.error(t('cardPin.updateError', 'Üýtgetmek başartmady'))
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCardPin() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => cardPinApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CARD_PIN_KEYS.lists() })
      toast.success(t('cardPin.deleteSuccess', 'Kart pin bukja pozuldy'))
    },
    onError: () => {
      toast.error(t('cardPin.deleteError', 'Pozmak başartmady'))
    },
  })
}
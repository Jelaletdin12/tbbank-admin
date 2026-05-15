import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  cardTransactionsApi,
  type CardTransactionListParams,
  type CreateCardTransactionPayload,
  type UpdateCardTransactionPayload,
} from '../api/cardTransactionsApi'

const QUERY_KEY = 'card-transactions'

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCardTransactions(params?: CardTransactionListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => cardTransactionsApi.getAll(params),
  })
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useCardTransaction(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => cardTransactionsApi.getById(id),
    enabled: !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCardTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCardTransactionPayload) =>
      cardTransactionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card transaction created successfully', 'Kart herekedi üstünlikli döredildi'))
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateCardTransaction(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCardTransactionPayload) =>
      cardTransactionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card transaction updated successfully', 'Kart herekedi üstünlikli üýtgedildi'))
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCardTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => cardTransactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card transaction deleted successfully', 'Kart herekedi üstünlikli öçürildi'))
    },
  })
}

// ─── Download ─────────────────────────────────────────────────────────────────

export function useDownloadCardTransaction() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: number) => {
      const blob = await cardTransactionsApi.download(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-transaction-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success(t('Downloaded successfully', 'Üstünlikli ýüklenildi'))
    },
  })
}

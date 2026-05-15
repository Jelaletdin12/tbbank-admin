import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  cardBalancesApi,
  type CardBalanceListParams,
  type CreateCardBalancePayload,
  type UpdateCardBalancePayload,
} from '../api/cardBalanceApi'

const QUERY_KEY = 'card-balances'

export function useCardBalances(params?: CardBalanceListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => cardBalancesApi.getAll(params),
  })
}

export function useCardBalance(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => cardBalancesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCardBalance() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCardBalancePayload) => cardBalancesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card balance created successfully', 'Kart galyndysy üstünlikli döredildi'))
    },
  })
}

export function useUpdateCardBalance(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCardBalancePayload) => cardBalancesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card balance updated successfully', 'Kart galyndysy üstünlikli üýtgedildi'))
    },
  })
}

export function useDeleteCardBalance() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => cardBalancesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card balance deleted successfully', 'Kart galyndysy üstünlikli öçürildi'))
    },
  })
}

export function useDownloadCardBalance() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: number) => {
      const blob = await cardBalancesApi.download(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-balance-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success(t('Downloaded successfully', 'Üstünlikli ýüklenildi'))
    },
  })
}
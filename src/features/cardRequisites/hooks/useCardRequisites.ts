import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  cardRequisitesApi,
  type CardRequisiteListParams,
  type CreateCardRequisitePayload,
  type UpdateCardRequisitePayload,
} from '../api/cardRequisitesApi'

const QUERY_KEY = 'card-requisites'

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCardRequisites(params?: CardRequisiteListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => cardRequisitesApi.getAll(params),
  })
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useCardRequisite(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => cardRequisitesApi.getById(id),
    enabled: !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCardRequisite() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateCardRequisitePayload) => cardRequisitesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card requisite created successfully', 'Kart rekwiziti üstünlikli döredildi'))
    },
    onError: () => {
      toast.error(t('Failed to create card requisite', 'Kart rekwiziti döredilmedi'))
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateCardRequisite(id: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateCardRequisitePayload) => cardRequisitesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card requisite updated successfully', 'Kart rekwiziti üstünlikli üýtgedildi'))
    },
    onError: () => {
      toast.error(t('Failed to update card requisite', 'Kart rekwiziti üýtgedilmedi'))
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCardRequisite() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => cardRequisitesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(t('Card requisite deleted successfully', 'Kart rekwiziti üstünlikli öçürildi'))
    },
    onError: () => {
      toast.error(t('Failed to delete card requisite', 'Kart rekwiziti öçürilmedi'))
    },
  })
}

// ─── Download ─────────────────────────────────────────────────────────────────

export function useDownloadCardRequisite() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await cardRequisitesApi.download(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-requisite-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success(t('Downloaded successfully', 'Üstünlikli ýüklenildi'))
    },
    onError: () => {
      toast.error(t('Download failed', 'Ýüklemek başartmady'))
    },
  })
}

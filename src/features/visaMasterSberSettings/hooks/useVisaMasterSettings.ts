// features/visaMasterSettings/hooks/useVisaMasterSettings.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchVisaMasterSettings,
  fetchVisaMasterSettingById,
  createVisaMasterSetting,
  updateVisaMasterSetting,
  deleteVisaMasterSetting,
  type VisaMasterSettingListParams,
  type VisaMasterSettingPayload,
} from '../api/visaMasterSberSettingsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const visaMasterSettingKeys = {
  all:    ['visaMasterSettings']                                        as const,
  lists:  () => [...visaMasterSettingKeys.all, 'list']                  as const,
  list:   (params: VisaMasterSettingListParams) =>
            [...visaMasterSettingKeys.lists(), params]                  as const,
  detail: (id: number) =>
            [...visaMasterSettingKeys.all, 'detail', id]               as const,
}

// ─── useGetVisaMasterSettings ─────────────────────────────────────────────────

export function useGetVisaMasterSettings(params: VisaMasterSettingListParams = {}) {
  return useQuery({
    queryKey: visaMasterSettingKeys.list(params),
    queryFn:  () => fetchVisaMasterSettings(params),
  })
}

// ─── useGetVisaMasterSettingById ──────────────────────────────────────────────

export function useGetVisaMasterSettingById(id: number) {
  return useQuery({
    queryKey: visaMasterSettingKeys.detail(id),
    queryFn:  () => fetchVisaMasterSettingById(id),
    enabled:  !!id,
  })
}

// ─── useCreateVisaMasterSetting ───────────────────────────────────────────────

export function useCreateVisaMasterSetting() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: VisaMasterSettingPayload) => createVisaMasterSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visaMasterSettingKeys.lists() })
      toast.success(t('visaMasterSettings.toast.created', 'Sazlama döredildi'))
    },
  })
}

// ─── useUpdateVisaMasterSetting ───────────────────────────────────────────────

export function useUpdateVisaMasterSetting(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: VisaMasterSettingPayload) => updateVisaMasterSetting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visaMasterSettingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: visaMasterSettingKeys.detail(id) })
      toast.success(t('visaMasterSettings.toast.updated', 'Sazlama üýtgedildi'))
    },
  })
}

// ─── useDeleteVisaMasterSetting ───────────────────────────────────────────────

export function useDeleteVisaMasterSetting() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteVisaMasterSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visaMasterSettingKeys.lists() })
      toast.success(t('visaMasterSettings.toast.deleted', 'Sazlama pozuldy'))
    },
  })
}
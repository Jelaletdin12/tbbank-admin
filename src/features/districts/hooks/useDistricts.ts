import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchDistricts,
  fetchDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  type CreateDistrictPayload,
  type UpdateDistrictPayload,
} from '../api/districtsApi'

export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...districtKeys.lists(), params] as const,
  detail: (id: number) => [...districtKeys.all, 'detail', id] as const,
}

export function useDistricts(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
}) {
  return useQuery({
    queryKey: districtKeys.list(params),
    queryFn: () => fetchDistricts(params),
  })
}

export function useDistrictById(id: number) {
  return useQuery({
    queryKey: districtKeys.detail(id),
    queryFn: () => fetchDistrictById(id),
    enabled: !!id,
  })
}

export function useCreateDistrict() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateDistrictPayload) => createDistrict(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
      toast.success(t('districts.toast.createSuccess', 'Etrap döredildi'))
    },
    onError: () => {
      toast.error(t('districts.toast.createError', 'Döretmek başartmady'))
    },
  })
}

export function useUpdateDistrict() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateDistrictPayload) => updateDistrict(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(data.id) })
      toast.success(t('districts.toast.updateSuccess', 'Etrap täzelendi'))
    },
    onError: () => {
      toast.error(t('districts.toast.updateError', 'Täzelemek başartmady'))
    },
  })
}

export function useDeleteDistrict() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteDistrict(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
      toast.success(t('districts.toast.deleteSuccess', 'Etrap öçürildi'))
    },
    onError: () => {
      toast.error(t('districts.toast.deleteError', 'Öçürmek başartmady'))
    },
  })
}

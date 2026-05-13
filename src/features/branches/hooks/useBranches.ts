import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchBranches,
  fetchBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  type CreateBranchPayload,
  type UpdateBranchPayload,
} from '../api/branchesApi'

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...branchKeys.lists(), params] as const,
  detail: (id: number) => [...branchKeys.all, 'detail', id] as const,
}

export function useBranches(params: {
  page?: number
  perPage?: number
  search?: string
  isActive?: string
  districtId?: string
}) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => fetchBranches(params),
  })
}

export function useBranchById(id: number) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => fetchBranchById(id),
    enabled: !!id,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      toast.success(t('branches.toast.createSuccess', 'Şahamça döredildi'))
    },
    onError: () => {
      toast.error(t('branches.toast.createError', 'Döretmek başartmady'))
    },
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateBranchPayload) => updateBranch(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(data.id) })
      toast.success(t('branches.toast.updateSuccess', 'Şahamça täzelendi'))
    },
    onError: () => {
      toast.error(t('branches.toast.updateError', 'Täzelemek başartmady'))
    },
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      toast.success(t('branches.toast.deleteSuccess', 'Şahamça öçürildi'))
    },
    onError: () => {
      toast.error(t('branches.toast.deleteError', 'Öçürmek başartmady'))
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  permissionsApi,
  type PermissionPayload,
  type PermissionsListParams,
} from '../api/permissionsApi'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const permissionKeys = {
  all:    ['permissions'] as const,
  list:   (params: PermissionsListParams) => ['permissions', 'list', params] as const,
  detail: (id: number)                    => ['permissions', 'detail', id] as const,
}

// ─── usePermissions (list) ────────────────────────────────────────────────────

export function usePermissions(params: PermissionsListParams) {
  return useQuery({
    queryKey: permissionKeys.list(params),
    queryFn:  () => permissionsApi.getAll(params).then((r) => r.data),
  })
}

// ─── usePermission (single) ───────────────────────────────────────────────────

export function usePermission(id: number) {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn:  () => permissionsApi.getById(id).then((r) => r.data),
    enabled:  !!id,
  })
}

// ─── useCreatePermission ──────────────────────────────────────────────────────

export function useCreatePermission() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PermissionPayload) =>
      permissionsApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
      toast.success(t('permissions.toast.created', 'Rugsat üstünlikli döredildi!'))
    },
    onError: () => {
      toast.error(t('permissions.toast.createError', 'Rugsat döretmekde ýalňyşlyk ýüze çykdy.'))
    },
  })
}

// ─── useUpdatePermission ──────────────────────────────────────────────────────

export function useUpdatePermission(id: number) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PermissionPayload) =>
      permissionsApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
      queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) })
      toast.success(t('permissions.toast.updated', 'Rugsat üstünlikli üýtgedildi!'))
    },
    onError: () => {
      toast.error(t('permissions.toast.updateError', 'Rugsat üýtgetmekde ýalňyşlyk ýüze çykdy.'))
    },
  })
}

// ─── useDeletePermission ──────────────────────────────────────────────────────

export function useDeletePermission() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => permissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
      toast.success(t('permissions.toast.deleted', 'Rugsat üstünlikli pozuldy!'))
    },
    onError: () => {
      toast.error(t('permissions.toast.deleteError', 'Rugsat pozmakda ýalňyşlyk ýüze çykdy.'))
    },
  })
}
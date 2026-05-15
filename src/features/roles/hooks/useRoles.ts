import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { rolesApi, type RolePayload, type RolesListParams } from '../api/rolesApi'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const roleKeys = {
  all:    ['roles'] as const,
  list:   (params: RolesListParams) => ['roles', 'list', params] as const,
  detail: (id: number) => ['roles', 'detail', id] as const,
}

// ─── useRoles (list) ──────────────────────────────────────────────────────────

export function useRoles(params: RolesListParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => rolesApi.getAll(params).then((r) => r.data),
  })
}

// ─── useRole (single) ─────────────────────────────────────────────────────────

export function useRole(id: number) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })
}

// ─── useCreateRole ────────────────────────────────────────────────────────────

export function useCreateRole() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RolePayload) => rolesApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      toast.success(t('roles.toast.created', 'Rol üstünlikli döredildi!'))
    },
  })
}

// ─── useUpdateRole ────────────────────────────────────────────────────────────

export function useUpdateRole(id: number) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RolePayload) => rolesApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) })
      toast.success(t('roles.toast.updated', 'Rol üstünlikli üýtgedildi!'))
    },
  })
}

// ─── useDeleteRole ────────────────────────────────────────────────────────────

export function useDeleteRole() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      toast.success(t('roles.toast.deleted', 'Rol üstünlikli pozuldy!'))
    },
  })
}
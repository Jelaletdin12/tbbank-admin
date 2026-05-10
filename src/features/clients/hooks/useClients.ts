import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  clientsApi,
  type ClientsListParams,
  type CreateClientPayload,
  type UpdateClientPayload,
} from '../api/clientsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ClientsListParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
}

// ─── useClients ───────────────────────────────────────────────────────────────

export function useClients(params: ClientsListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.getAll(params),
    placeholderData: (prev) => prev,
  })
}

// ─── useClient ────────────────────────────────────────────────────────────────

export function useClient(id: number) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  })
}

// ─── useCreateClient ──────────────────────────────────────────────────────────

export function useCreateClient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success(t('clients.createSuccess', 'Müşderi üstünlikli döredildi'))
    },
    onError: () => {
      toast.error(t('clients.createError', 'Müşderi döretmekde ýalňyşlyk'))
    },
  })
}

// ─── useUpdateClient ──────────────────────────────────────────────────────────

export function useUpdateClient(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) })
      toast.success(t('clients.updateSuccess', 'Müşderi üstünlikli täzelendi'))
    },
    onError: () => {
      toast.error(t('clients.updateError', 'Müşderi täzelemekde ýalňyşlyk'))
    },
  })
}

// ─── useDeleteClient ──────────────────────────────────────────────────────────

export function useDeleteClient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success(t('clients.deleteSuccess', 'Müşderi üstünlikli pozuldy'))
    },
    onError: () => {
      toast.error(t('clients.deleteError', 'Müşderi pozmakda ýalňyşlyk'))
    },
  })
}

// ─── useAssignClientRole ──────────────────────────────────────────────────────

export function useAssignClientRole(clientId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (roleId: number) => clientsApi.assignRole(clientId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) })
      toast.success(t('clients.roleAssigned', 'Rol birikdirildi'))
    },
    onError: () => {
      toast.error(t('clients.roleAssignError', 'Rol birikdirmekde ýalňyşlyk'))
    },
  })
}

// ─── useRemoveClientRole ──────────────────────────────────────────────────────

export function useRemoveClientRole(clientId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (roleId: number) => clientsApi.removeRole(clientId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) })
      toast.success(t('clients.roleRemoved', 'Rol aýryldy'))
    },
    onError: () => {
      toast.error(t('clients.roleRemoveError', 'Rol aýyrmakda ýalňyşlyk'))
    },
  })
}

// ─── useAssignClientBranch ────────────────────────────────────────────────────

export function useAssignClientBranch(clientId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (branchId: number) => clientsApi.assignBranch(clientId, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) })
      toast.success(t('clients.branchAssigned', 'Şahamça birikdirildi'))
    },
    onError: () => {
      toast.error(t('clients.branchAssignError', 'Şahamça birikdirmekde ýalňyşlyk'))
    },
  })
}
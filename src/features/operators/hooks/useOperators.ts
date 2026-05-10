import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  operatorsApi,
  type OperatorsListParams,
  type CreateOperatorPayload,
  type UpdateOperatorPayload,
} from '../api/operatorsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const operatorKeys = {
  all: ['operators'] as const,
  lists: () => [...operatorKeys.all, 'list'] as const,
  list: (params: OperatorsListParams) => [...operatorKeys.lists(), params] as const,
  details: () => [...operatorKeys.all, 'detail'] as const,
  detail: (id: number) => [...operatorKeys.details(), id] as const,
}

// ─── useOperators ─────────────────────────────────────────────────────────────

export function useOperators(params: OperatorsListParams) {
  return useQuery({
    queryKey: operatorKeys.list(params),
    queryFn: () => operatorsApi.getAll(params),
    placeholderData: (prev) => prev,
  })
}

// ─── useOperator ──────────────────────────────────────────────────────────────

export function useOperator(id: number) {
  return useQuery({
    queryKey: operatorKeys.detail(id),
    queryFn: () => operatorsApi.getById(id),
    enabled: !!id,
  })
}

// ─── useCreateOperator ────────────────────────────────────────────────────────

export function useCreateOperator() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateOperatorPayload) => operatorsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operatorKeys.lists() })
      toast.success(t('operators.createSuccess', 'Operator üstünlikli döredildi'))
    },
    onError: () => {
      toast.error(t('operators.createError', 'Operator döretmekde ýalňyşlyk'))
    },
  })
}

// ─── useUpdateOperator ────────────────────────────────────────────────────────

export function useUpdateOperator(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateOperatorPayload) => operatorsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operatorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: operatorKeys.detail(id) })
      toast.success(t('operators.updateSuccess', 'Operator üstünlikli täzelendi'))
    },
    onError: () => {
      toast.error(t('operators.updateError', 'Operator täzelemekde ýalňyşlyk'))
    },
  })
}

// ─── useDeleteOperator ────────────────────────────────────────────────────────

export function useDeleteOperator() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => operatorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operatorKeys.lists() })
      toast.success(t('operators.deleteSuccess', 'Operator üstünlikli pozuldy'))
    },
    onError: () => {
      toast.error(t('operators.deleteError', 'Operator pozmakda ýalňyşlyk'))
    },
  })
}

// ─── useAssignRole ────────────────────────────────────────────────────────────

export function useAssignRole(operatorId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (roleId: number) => operatorsApi.assignRole(operatorId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operatorKeys.detail(operatorId) })
      toast.success(t('operators.roleAssigned', 'Rol birikdirildi'))
    },
    onError: () => {
      toast.error(t('operators.roleAssignError', 'Rol birikdirmekde ýalňyşlyk'))
    },
  })
}

// ─── useRemoveRole ────────────────────────────────────────────────────────────

export function useRemoveRole(operatorId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (roleId: number) => operatorsApi.removeRole(operatorId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operatorKeys.detail(operatorId) })
      toast.success(t('operators.roleRemoved', 'Rol aýryldy'))
    },
    onError: () => {
      toast.error(t('operators.roleRemoveError', 'Rol aýyrmakda ýalňyşlyk'))
    },
  })
}
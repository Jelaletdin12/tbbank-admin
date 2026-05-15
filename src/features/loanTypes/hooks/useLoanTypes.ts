// features/loanTypes/hooks/useLoanTypes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchLoanTypes,
  fetchLoanTypeById,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  type LoanTypeListParams,
  type CreateLoanTypePayload,
  type UpdateLoanTypePayload,
} from '../api/loanTypesApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const loanTypeKeys = {
  all:    () => ['loanTypes'] as const,
  list:   (params: LoanTypeListParams) => ['loanTypes', 'list', params] as const,
  detail: (id: number) => ['loanTypes', 'detail', id] as const,
}

// ─── useGetLoanTypes ──────────────────────────────────────────────────────────

export function useGetLoanTypes(params: LoanTypeListParams = {}) {
  return useQuery({
    queryKey: loanTypeKeys.list(params),
    queryFn:  () => fetchLoanTypes(params),
    placeholderData: (prev) => prev,
  })
}

// ─── useGetLoanTypeById ───────────────────────────────────────────────────────

export function useGetLoanTypeById(id: number | undefined) {
  return useQuery({
    queryKey: loanTypeKeys.detail(id!),
    queryFn:  () => fetchLoanTypeById(id!),
    enabled:  !!id,
  })
}

// ─── useCreateLoanType ────────────────────────────────────────────────────────

export function useCreateLoanType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: CreateLoanTypePayload) => createLoanType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanTypeKeys.all() })
      toast.success(t('loanTypes.toast.created', 'Karz görnüşi üstünlikli döredildi'))
    },
  })
}

// ─── useUpdateLoanType ────────────────────────────────────────────────────────

export function useUpdateLoanType(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: UpdateLoanTypePayload) => updateLoanType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanTypeKeys.all() })
      toast.success(t('loanTypes.toast.updated', 'Karz görnüşi üstünlikli täzelendi'))
    },
  })
}

// ─── useDeleteLoanType ────────────────────────────────────────────────────────

export function useDeleteLoanType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteLoanType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanTypeKeys.all() })
      toast.success(t('loanTypes.toast.deleted', 'Karz görnüşi üstünlikli pozuldy'))
    },
  })
}
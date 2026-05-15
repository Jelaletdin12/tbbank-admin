import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  fetchLoanDocuments,
  fetchLoanDocumentById,
  createLoanDocument,
  updateLoanDocument,
  deleteLoanDocument,
  type ListParams,
  type LoanDocumentPayload,
} from '../api/requiredDocumentsApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const requiredDocumentsKeys = {
  all: ['requiredDocuments'] as const,
  lists: () => [...requiredDocumentsKeys.all, 'list'] as const,
  list: (params: ListParams) => [...requiredDocumentsKeys.lists(), params] as const,
  details: () => [...requiredDocumentsKeys.all, 'detail'] as const,
  detail: (id: number) => [...requiredDocumentsKeys.details(), id] as const,
}

// ─── useGetLoanDocuments ──────────────────────────────────────────────────────

export function useGetRequiredDocuments(params: ListParams) {
  return useQuery({
    queryKey: requiredDocumentsKeys.list(params),
    queryFn: () => fetchLoanDocuments(params),
  })
}

// ─── useGetLoanDocumentById ───────────────────────────────────────────────────

export function useGetRequiredDocumentById(id: number) {
  return useQuery({
    queryKey: requiredDocumentsKeys.detail(id),
    queryFn: () => fetchLoanDocumentById(id),
    enabled: !!id,
  })
}

// ─── useCreateLoanDocument ────────────────────────────────────────────────────

export function useCreateRequiredDocument() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanDocumentPayload) => createLoanDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requiredDocumentsKeys.lists() })
      toast.success(t('loanDocuments.toast.created', 'Resminama üstünlikli döredildi!'))
    },
  })
}

// ─── useUpdateLoanDocument ────────────────────────────────────────────────────

export function useUpdateRequiredDocument(id: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: LoanDocumentPayload) => updateLoanDocument(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requiredDocumentsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: requiredDocumentsKeys.detail(id) })
      toast.success(t('loanDocuments.toast.updated', 'Resminama üstünlikli täzelendi!'))
    },
  })
}

// ─── useDeleteLoanDocument ────────────────────────────────────────────────────

export function useDeleteRequiredDocument() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number) => deleteLoanDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requiredDocumentsKeys.lists() })
      toast.success(t('loanDocuments.toast.deleted', 'Resminama üstünlikli öçürildi!'))
    },
  })
}
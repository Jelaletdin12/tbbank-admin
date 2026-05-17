import { z } from 'zod'
import type { CreateLoanTypePayload } from '../api/loanTypesApi'

export function createLoanTypeFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    notesTk: z.string().optional(),
    notesRu: z.string().optional(),
    notesEn: z.string().optional(),
    tax: z.string().refine(
      (v) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) > 0,
      t('validation.positiveNumber', 'validation.positiveNumber'),
    ),
    loanTerm: z.string().refine(
      (v) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) > 0,
      t('validation.positiveNumber', 'validation.positiveNumber'),
    ),
    isActive: z.boolean(),
  })
}

export type LoanTypeFormData = z.infer<ReturnType<typeof createLoanTypeFormSchema>>

export const DEFAULT_FORM_VALUES: LoanTypeFormData = {
  nameTk: '',
  nameRu: '',
  nameEn: '',
  notesTk: '',
  notesRu: '',
  notesEn: '',
  tax: '',
  loanTerm: '',
  isActive: true,
}

export function buildPayload(data: LoanTypeFormData): CreateLoanTypePayload {
  return {
    name: { tk: data.nameTk.trim(), ru: data.nameRu.trim(), en: data.nameEn.trim() },
    tax: Number(data.tax),
    loanTerm: Number(data.loanTerm),
    notes:
      (data.notesTk ?? '').trim() || (data.notesRu ?? '').trim() || (data.notesEn ?? '').trim()
        ? { tk: (data.notesTk ?? '').trim(), ru: (data.notesRu ?? '').trim(), en: (data.notesEn ?? '').trim() }
        : null,
    isActive: data.isActive,
  }
}

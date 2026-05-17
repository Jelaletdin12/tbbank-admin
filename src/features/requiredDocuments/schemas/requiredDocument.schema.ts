import { z } from 'zod'
import type { LoanDocument, LoanDocumentPayload } from '../api/requiredDocumentsApi'

export function createRequiredDocumentFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    descTk: z.string().min(1, t('validation.required', 'validation.required')),
    descRu: z.string().min(1, t('validation.required', 'validation.required')),
    descEn: z.string().min(1, t('validation.required', 'validation.required')),
  })
}

export type RequiredDocumentFormData = z.infer<ReturnType<typeof createRequiredDocumentFormSchema>>

export const DEFAULT_FORM_VALUES: RequiredDocumentFormData = {
  nameTk: '',
  nameRu: '',
  nameEn: '',
  descTk: '',
  descRu: '',
  descEn: '',
}

export function buildPayload(data: RequiredDocumentFormData): LoanDocumentPayload {
  return {
    name: { tk: data.nameTk.trim(), ru: data.nameRu.trim(), en: data.nameEn.trim() },
    description: { tk: data.descTk.trim(), ru: data.descRu.trim(), en: data.descEn.trim() },
  }
}

export function mapInitial(data: LoanDocument): RequiredDocumentFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    descTk: data.description.tk,
    descRu: data.description.ru,
    descEn: data.description.en,
  }
}

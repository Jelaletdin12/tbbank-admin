import { z } from 'zod'
import type { LoanDocument, LoanDocumentPayload } from '../api/requiredDocumentsApi'

export const requiredDocumentFormSchema = z.object({
  nameTk: z.string().min(1, 'Hökmany meýdan'),
  nameRu: z.string().min(1, 'Hökmany meýdan'),
  nameEn: z.string().min(1, 'Hökmany meýdan'),
  descTk: z.string().min(1, 'Hökmany meýdan'),
  descRu: z.string().min(1, 'Hökmany meýdan'),
  descEn: z.string().min(1, 'Hökmany meýdan'),
})

export type RequiredDocumentFormData = z.infer<typeof requiredDocumentFormSchema>

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

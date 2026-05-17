import { z } from 'zod'
import type { CreateCardReasonPayload } from '../api/cardReasonsApi'

export function createCardReasonFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    value: z.string().min(1, t('validation.invalidNumber', 'validation.invalidNumber')).refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      { message: t('validation.invalidNumber', 'Dogry san giriziň') },
    ),
    description: z.string().optional(),
    isActive: z.boolean(),
  })
}

export type CardReasonFormData = z.infer<ReturnType<typeof createCardReasonFormSchema>>

export const DEFAULT_FORM_VALUES: CardReasonFormData = {
  nameTk: '',
  nameRu: '',
  nameEn: '',
  value: '',
  description: '',
  isActive: true,
}

export function buildPayload(data: CardReasonFormData): CreateCardReasonPayload {
  return {
    name: { tk: data.nameTk, ru: data.nameRu, en: data.nameEn },
    value: Number(data.value),
    description: data.description?.trim() || null,
    isActive: data.isActive,
  }
}

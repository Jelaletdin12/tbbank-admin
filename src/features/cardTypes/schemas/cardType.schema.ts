import { z } from 'zod'
import type { CreateCardTypePayload } from '../api/cardTypesApi'

export function createCardTypeFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    value: z.string().refine(
      (v) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) >= 0,
      t('validation.invalidNumber', 'Dogry san giriziň'),
    ),
    description: z.string().optional(),
    isActive: z.boolean(),
  })
}

export type CardTypeFormData = z.infer<ReturnType<typeof createCardTypeFormSchema>>

export const DEFAULT_FORM_VALUES: CardTypeFormData = {
  nameTk: '',
  nameRu: '',
  nameEn: '',
  value: '',
  description: '',
  isActive: true,
}

export function buildPayload(data: CardTypeFormData): CreateCardTypePayload {
  return {
    name: { tk: data.nameTk, ru: data.nameRu, en: data.nameEn },
    value: Number(data.value),
    description: (data.description ?? '').trim() || null,
    isActive: data.isActive,
  }
}

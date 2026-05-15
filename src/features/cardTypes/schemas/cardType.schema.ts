import { z } from 'zod'
import i18next from 'i18next'
import type { CreateCardTypePayload } from '../api/cardTypesApi'

const t = i18next.t.bind(i18next)

export const cardTypeFormSchema = z.object({
  nameTk: z.string().min(1, t('validation.required', '')),
  nameRu: z.string().min(1, t('validation.required', '')),
  nameEn: z.string().min(1, t('validation.required', 'Hökmany meýdan')),
  value: z.string().refine(
    (v) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) >= 0,
    t('validation.invalidNumber', 'Dogry san giriziň'),
  ),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type CardTypeFormData = z.infer<typeof cardTypeFormSchema>

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

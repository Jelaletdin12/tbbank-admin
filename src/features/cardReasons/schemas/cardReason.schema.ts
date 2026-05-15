import { z } from 'zod'
import i18next from 'i18next'
import type { CreateCardReasonPayload } from '../api/cardReasonsApi'

const t = i18next.t.bind(i18next)

export const cardReasonFormSchema = z.object({
  nameTk: z.string().min(1, t('validation.required', '')),
  nameRu: z.string().min(1, t('validation.required', '')),
  nameEn: z.string().min(1, t('validation.required', '')),
  value: z.string().min(1, t('validation.invalidNumber', '')).refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0,
    { message: t('validation.invalidNumber', 'Dogry san giriziň') },
  ),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type CardReasonFormData = z.infer<typeof cardReasonFormSchema>

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

import { z } from 'zod'
import type { CreateCardTypePayload } from '../api/cardTypesApi'

export const cardTypeFormSchema = z.object({
  nameTk: z.string().min(1, 'Hökmany meýdan'),
  nameRu: z.string().min(1, 'Hökmany meýdan'),
  nameEn: z.string().min(1, 'Hökmany meýdan'),
  value: z.string().refine(
    (v) => v.trim() !== '' && !isNaN(Number(v)) && Number(v) >= 0,
    'Dogry san giriziň',
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

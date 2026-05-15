import { z } from 'zod'
import type { CreateCardReasonPayload } from '../api/cardReasonsApi'

export const cardReasonFormSchema = z.object({
  nameTk: z.string().min(1, 'Hökmany meýdan'),
  nameRu: z.string().min(1, 'Hökmany meýdan'),
  nameEn: z.string().min(1, 'Hökmany meýdan'),
  value: z.string().min(1, 'Dogry san giriziň').refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0,
    { message: 'Dogry san giriziň' },
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

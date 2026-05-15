import { z } from 'zod'
import i18next from 'i18next'
import type { CreateDistrictPayload } from '../api/districtsApi'

const t = i18next.t.bind(i18next)

export const districtFormSchema = z.object({
  nameTk: z.string().min(1, t('validation.required', '')),
  nameRu: z.string().min(1, t('validation.required', '')),
  nameEn: z.string().min(1, t('validation.required', '')),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type DistrictFormData = z.infer<typeof districtFormSchema>

export const DEFAULT_FORM_VALUES: DistrictFormData = {
  nameTk: '',
  nameRu: '',
  nameEn: '',
  description: '',
  isActive: true,
}

export function buildPayload(data: DistrictFormData): CreateDistrictPayload {
  return {
    name: { tk: data.nameTk, ru: data.nameRu, en: data.nameEn },
    description: data.description?.trim() || null,
    isActive: data.isActive,
  }
}

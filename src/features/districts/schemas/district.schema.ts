import { z } from 'zod'
import type { CreateDistrictPayload } from '../api/districtsApi'

export function createDistrictFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    description: z.string().optional(),
    isActive: z.boolean(),
  })
}

export type DistrictFormData = z.infer<ReturnType<typeof createDistrictFormSchema>>

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

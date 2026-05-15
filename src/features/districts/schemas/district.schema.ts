import { z } from 'zod'
import type { CreateDistrictPayload } from '../api/districtsApi'

export const districtFormSchema = z.object({
  nameTk: z.string().min(1, 'Hökmany meýdan'),
  nameRu: z.string().min(1, 'Hökmany meýdan'),
  nameEn: z.string().min(1, 'Hökmany meýdan'),
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

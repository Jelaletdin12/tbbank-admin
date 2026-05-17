import { z } from 'zod'
import type { PermissionPayload } from '../api/permissionsApi'

export function createPermissionFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    code: z.string().min(1, t('validation.required', 'validation.required')),
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    guard_name: z.string().min(1, t('validation.required', 'validation.required')),
  })
}

export type PermissionFormData = z.infer<ReturnType<typeof createPermissionFormSchema>>

export const DEFAULT_FORM_VALUES: PermissionFormData = {
  code: '',
  nameTk: '',
  nameRu: '',
  nameEn: '',
  guard_name: 'web',
}

export function buildPayload(data: PermissionFormData): PermissionPayload {
  return {
    code: data.code,
    name: {
      tk: data.nameTk,
      ru: data.nameRu,
      en: data.nameEn,
    },
    guard_name: data.guard_name,
  }
}

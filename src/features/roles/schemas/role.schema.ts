import { z } from 'zod'
import type { RolePayload } from '../api/rolesApi'

export function createRoleFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    code: z.string().min(1, t('validation.required', 'validation.required')),
    nameTk: z.string().min(1, t('validation.required', 'validation.required')),
    nameRu: z.string().min(1, t('validation.required', 'validation.required')),
    nameEn: z.string().min(1, t('validation.required', 'validation.required')),
    guard_name: z.string().min(1, t('validation.required', 'validation.required')),
  })
}

export type RoleFormData = z.infer<ReturnType<typeof createRoleFormSchema>>

export const DEFAULT_FORM_VALUES: RoleFormData = {
  code: '',
  nameTk: '',
  nameRu: '',
  nameEn: '',
  guard_name: 'web',
}

export function buildPayload(data: RoleFormData): RolePayload {
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

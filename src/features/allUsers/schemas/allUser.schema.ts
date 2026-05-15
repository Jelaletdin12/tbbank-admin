import { z } from 'zod'
import i18next from 'i18next'
import type { CreateUserPayload } from '../api/allUsersApi'

const t = i18next.t.bind(i18next)

const baseSchema = z.object({
  username: z.string()
    .min(1, t('validation.required', 'Ulanyjy ady hökmany'))
    .min(3, t('validation.minLength', 'Ulanyjy ady iň az 3 harp bolmaly')),
  name: z.string().min(1, t('validation.required', 'Ady hökmany')),
  phone: z.string()
    .min(1, t('validation.required', 'Telefon hökmany'))
    .regex(/^\d[\d\s-]{6,}$/, t('validation.invalidPhone', 'Nädogry telefon formaty')),
  email: z.string()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      t('validation.invalidEmail', 'Nädogry e-poçta formaty'),
    )
    .default(''),
  password: z.string(),
  phoneVerified: z.boolean(),
  isActive: z.boolean(),
})

export function allUserFormSchema(mode: 'create' | 'edit') {
  return mode === 'create'
    ? baseSchema.extend({
        password: z.string()
          .min(1, t('validation.required', 'Açar sözi hökmany'))
          .min(6, t('validation.minLength', 'Açar sözi iň az 6 harp bolmaly')),
      })
    : baseSchema
}

export type AllUserFormData = z.infer<typeof baseSchema>

export const DEFAULT_FORM_VALUES: AllUserFormData = {
  username: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  phoneVerified: false,
  isActive: true,
}

export function buildPayload(data: AllUserFormData): CreateUserPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim() || undefined,
    password: data.password,
    phoneVerified: data.phoneVerified,
    isActive: data.isActive,
  }
}

import { z } from 'zod'
import type { CreateUserPayload } from '../api/allUsersApi'

export function allUserFormSchema(
  mode: 'create' | 'edit',
  t: (key: string, fallback?: string) => string,
) {
  const baseSchema = z.object({
    username: z.string()
      .min(1, t('validation.required', 'validation.required'))
      .min(3, t('validation.minLength', 'validation.minLength')),
    name: z.string().min(1, t('validation.required', 'validation.required')),
    phone: z.string()
      .min(1, t('validation.required', 'validation.required'))
      .regex(/^\d[\d\s-]{6,}$/, t('validation.invalidPhone', 'validation.invalidPhone')),
    email: z.string()
      .refine(
        (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        t('validation.invalidEmail', 'validation.invalidEmail'),
      )
      .default(''),
    password: z.string(),
    phoneVerified: z.boolean(),
    isActive: z.boolean(),
  })

  return mode === 'create'
    ? baseSchema.extend({
        password: z.string()
          .min(1, t('validation.required', 'validation.required'))
          .min(6, t('validation.minLength', 'validation.minLength')),
      })
    : baseSchema
}

export type AllUserFormData = z.infer<ReturnType<typeof allUserFormSchema>>

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

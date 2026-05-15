import { z } from 'zod'
import type { CreateUserPayload } from '../api/allUsersApi'

const baseSchema = z.object({
  username: z.string()
    .min(1, 'Ulanyjy ady hökmany')
    .min(3, 'Ulanyjy ady iň az 3 harp bolmaly'),
  name: z.string().min(1, 'Ady hökmany'),
  phone: z.string()
    .min(1, 'Telefon hökmany')
    .regex(/^\d[\d\s-]{6,}$/, 'Nädogry telefon formaty'),
  email: z.string()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Nädogry e-poçta formaty',
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
          .min(1, 'Açar sözi hökmany')
          .min(6, 'Açar sözi iň az 6 harp bolmaly'),
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

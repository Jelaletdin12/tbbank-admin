import { z } from 'zod'
import type { CreateOperatorPayload } from '../api/operatorsApi'

export function operatorFormSchema(
  mode: 'create' | 'edit',
  t: (key: string, fallback?: string) => string,
) {
  const baseSchema = z.object({
    username: z.string().min(1, t('validation.required', 'validation.required')),
    name: z.string().min(1, t('validation.required', 'validation.required')),
    phone: z.string().default(''),
    email: z.string().default(''),
    password: z.string(),
    isActive: z.boolean(),
  })

  return mode === 'create'
    ? baseSchema.extend({
        password: z.string().min(1, t('validation.required', 'validation.required')),
      })
    : baseSchema
}

export type OperatorFormData = z.infer<ReturnType<typeof operatorFormSchema>>

export const DEFAULT_FORM_VALUES: OperatorFormData = {
  username: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  isActive: true,
}

export function buildPayload(data: OperatorFormData): CreateOperatorPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim() || undefined,
    email: data.email.trim() || undefined,
    password: data.password,
    isActive: data.isActive,
  }
}

import { z } from 'zod'
import i18next from 'i18next'
import type { CreateClientPayload } from '../api/clientsApi'

const t = i18next.t.bind(i18next)

const baseSchema = z.object({
  username: z.string().min(1, t('validation.required', '')),
  name: z.string().min(1, t('validation.required', '')),
  phone: z.string().min(1, t('validation.required', '')),
  email: z.string().default(''),
  password: z.string(),
  isActive: z.boolean(),
})

export function clientFormSchema(mode: 'create' | 'edit') {
  return mode === 'create'
    ? baseSchema.extend({
        password: z.string().min(1, t('validation.required', '')),
      })
    : baseSchema
}

export type ClientFormData = z.infer<typeof baseSchema>

export const DEFAULT_FORM_VALUES: ClientFormData = {
  username: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  isActive: true,
}

export function buildPayload(data: ClientFormData): CreateClientPayload {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim() || undefined,
    password: data.password,
    isActive: data.isActive,
  }
}

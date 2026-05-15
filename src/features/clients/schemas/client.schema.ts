import { z } from 'zod'
import type { CreateClientPayload } from '../api/clientsApi'

const baseSchema = z.object({
  username: z.string().min(1, 'Ulanyjy ady hökmany'),
  name: z.string().min(1, 'Ady hökmany'),
  phone: z.string().min(1, 'Telefon hökmany'),
  email: z.string().default(''),
  password: z.string(),
  isActive: z.boolean(),
})

export function clientFormSchema(mode: 'create' | 'edit') {
  return mode === 'create'
    ? baseSchema.extend({
        password: z.string().min(1, 'Açar sözi hökmany'),
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

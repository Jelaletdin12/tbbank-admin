import { z } from 'zod'
import type { VisaMasterSettingPayload } from '../api/visaMasterSberSettingsApi'

export function createVisaMasterSettingFormSchema(
  t: (key: string, fallback?: string) => string,
) {
  return z.object({
    kod:   z.string().min(1, t('validation.required', 'validation.required')),
    ady:   z.string().min(1, t('validation.required', 'validation.required')),
    yazgy: z.string().min(1, t('validation.required', 'validation.required')),
  })
}

export type VisaMasterSettingFormData = z.infer<ReturnType<typeof createVisaMasterSettingFormSchema>>

export const DEFAULT_FORM_VALUES: VisaMasterSettingFormData = {
  kod: '',
  ady: '',
  yazgy: '',
}

export function buildPayload(data: VisaMasterSettingFormData): VisaMasterSettingPayload {
  return {
    kod: data.kod.trim(),
    ady: data.ady.trim(),
    yazgy: data.yazgy.trim(),
  }
}

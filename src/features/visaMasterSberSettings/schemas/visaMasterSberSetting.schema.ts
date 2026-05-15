import { z } from 'zod'
import i18next from 'i18next'
import type { VisaMasterSettingPayload } from '../api/visaMasterSberSettingsApi'

const t = i18next.t.bind(i18next)

export const visaMasterSettingFormSchema = z.object({
  kod: z.string().min(1, t('validation.required', '')),
  ady: z.string().min(1, t('validation.required', '')),
  yazgy: z.string().min(1, t('validation.required', '')),
})

export type VisaMasterSettingFormData = z.infer<typeof visaMasterSettingFormSchema>

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

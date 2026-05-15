import { z } from 'zod'
import type { VisaMasterSettingPayload } from '../api/visaMasterSberSettingsApi'

export const visaMasterSettingFormSchema = z.object({
  kod: z.string().min(1, 'Hökmany meýdan'),
  ady: z.string().min(1, 'Hökmany meýdan'),
  yazgy: z.string().min(1, 'Hökmany meýdan'),
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

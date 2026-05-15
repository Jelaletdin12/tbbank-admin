import { z } from 'zod'
import i18next from 'i18next'
import type { CreateCurrencyRatePayload, CurrencyCode } from '../api/currencyRatesApi'

const t = i18next.t.bind(i18next)

export const currencyRateFormSchema = z.object({
  currencyFrom: z.string().min(1, t('validation.required', 'Hökmany meýdan')),
  currencyTo: z.string().min(1, t('validation.required', 'Hökmany meýdan')),
  value: z
    .string()
    .min(1, t('validation.required', 'Hökmany meýdan'))
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('validation.valuePositive', 'Baha 0-dan uly bolmaly')),
})

export type CurrencyRateFormData = z.infer<typeof currencyRateFormSchema>

export const DEFAULT_FORM_VALUES: CurrencyRateFormData = {
  currencyFrom: '',
  currencyTo: '',
  value: '',
}

export function buildPayload(data: CurrencyRateFormData): CreateCurrencyRatePayload {
  return {
    currencyFrom: data.currencyFrom as CurrencyCode,
    currencyTo: data.currencyTo as CurrencyCode,
    value: Number(data.value),
  }
}

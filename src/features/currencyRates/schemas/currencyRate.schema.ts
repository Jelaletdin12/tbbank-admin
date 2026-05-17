import { z } from 'zod'
import type { CreateCurrencyRatePayload, CurrencyCode } from '../api/currencyRatesApi'

export function createCurrencyRateFormSchema(t: (key: string, fallback?: string) => string) {
  return z.object({
    currencyFrom: z.string().min(1, t('validation.required', 'validation.required')),
    currencyTo: z.string().min(1, t('validation.required', 'validation.required')),
    value: z
      .string()
      .min(1, t('validation.required', 'validation.required'))
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('validation.valuePositive', 'validation.valuePositive')),
  })
}

export type CurrencyRateFormData = z.infer<ReturnType<typeof createCurrencyRateFormSchema>>

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

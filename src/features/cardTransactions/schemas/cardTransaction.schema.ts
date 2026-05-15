import { z } from 'zod'
import i18next from 'i18next'
import type { CreateCardTransactionPayload } from '../api/cardTransactionsApi'

const t = i18next.t.bind(i18next)

export const cardTransactionFormSchema = z.object({
  passport_series: z.string().min(1, t('validation.required', '')),
  passport_number: z.string().min(1, t('validation.required', '')),
  card_number: z.string().min(1, t('validation.required', '')),
  card_expiry_month: z.string().min(1, t('validation.required', '')),
  card_expiry_year: z.string().min(1, t('validation.required', '')),
})

export type CardTransactionFormData = z.infer<typeof cardTransactionFormSchema>

export const DEFAULT_FORM_VALUES: CardTransactionFormData = {
  passport_series: '',
  passport_number: '',
  card_number: '',
  card_expiry_month: '',
  card_expiry_year: '',
}

export function buildPayload(data: CardTransactionFormData): CreateCardTransactionPayload {
  return {
    passport_series: data.passport_series,
    passport_number: data.passport_number,
    card_number: data.card_number,
    card_expiry_month: data.card_expiry_month,
    card_expiry_year: data.card_expiry_year,
  }
}

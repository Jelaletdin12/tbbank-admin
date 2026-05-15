import { z } from 'zod'
import type { CreateCardTransactionPayload } from '../api/cardTransactionsApi'

export const cardTransactionFormSchema = z.object({
  passport_series: z.string().min(1, 'Passport series is required'),
  passport_number: z.string().min(1, 'Passport number is required'),
  card_number: z.string().min(1, 'Card number is required'),
  card_expiry_month: z.string().min(1, 'Expiry month is required'),
  card_expiry_year: z.string().min(1, 'Expiry year is required'),
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

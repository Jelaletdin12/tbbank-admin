import { z } from 'zod'
import type { CreateCardBalancePayload } from '../api/cardBalanceApi'

export const cardBalanceFormSchema = z.object({
  passport_series: z.string().min(1, 'Pasport seriýasy hökmanydyr'),
  passport_number: z.string().min(1, 'Pasport belgisi hökmanydyr'),
  card_number: z.string().min(1, 'Kart belgisi hökmanydyr'),
  card_expiry_month: z.string().min(1, 'Möhleti (aý) hökmanydyr'),
  card_expiry_year: z.string().min(1, 'Möhleti (ýyl) hökmanydyr'),
})

export type CardBalanceFormData = z.infer<typeof cardBalanceFormSchema>

export const DEFAULT_FORM_VALUES: CardBalanceFormData = {
  passport_series: '',
  passport_number: '',
  card_number: '',
  card_expiry_month: '',
  card_expiry_year: '',
}

export function buildPayload(data: CardBalanceFormData): CreateCardBalancePayload {
  return {
    passport_series: data.passport_series,
    passport_number: data.passport_number,
    card_number: data.card_number,
    card_expiry_month: data.card_expiry_month,
    card_expiry_year: data.card_expiry_year,
  }
}

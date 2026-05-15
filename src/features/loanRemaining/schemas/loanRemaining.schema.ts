import { z } from 'zod'
import i18next from 'i18next'

const t = i18next.t.bind(i18next)

export const loanRemainingFormSchema = z.object({
  passportSeries: z.string().min(1, t('validation.required', '')),
  passportNumber: z.string().min(1, t('validation.required', '')),
  loanAccount: z.string().min(1, t('validation.required', '')),
})

export type LoanRemainingFormData = z.infer<typeof loanRemainingFormSchema>

export const DEFAULT_FORM_VALUES: LoanRemainingFormData = {
  passportSeries: '',
  passportNumber: '',
  loanAccount: '',
}

export function buildPayload(
  data: LoanRemainingFormData,
): { passportSeries: string; passportNumber: string; loanAccount: string } {
  return {
    passportSeries: data.passportSeries,
    passportNumber: data.passportNumber,
    loanAccount: data.loanAccount,
  }
}

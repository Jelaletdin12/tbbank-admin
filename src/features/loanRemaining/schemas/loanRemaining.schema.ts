import { z } from 'zod'

export const loanRemainingFormSchema = z.object({
  passportSeries: z.string().min(1, 'Hökman doldurylmaly'),
  passportNumber: z.string().min(1, 'Hökman doldurylmaly'),
  loanAccount: z.string().min(1, 'Hökman doldurylmaly'),
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

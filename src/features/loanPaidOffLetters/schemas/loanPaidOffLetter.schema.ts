import { z } from 'zod'

export const loanPaidOffLetterFormSchema = z.object({
  passportSeries: z.string().min(1, 'validation.required'),
  passportNumber: z.string().min(1, 'validation.required'),
  loanAccount: z.string().min(1, 'validation.required'),
  issuedAt: z.string().min(1, 'validation.required'),
})

export type LoanPaidOffLetterFormData = z.infer<typeof loanPaidOffLetterFormSchema>

export const DEFAULT_FORM_VALUES: LoanPaidOffLetterFormData = {
  passportSeries: '',
  passportNumber: '',
  loanAccount: '',
  issuedAt: '',
}

export function buildPayload(
  data: LoanPaidOffLetterFormData,
): { passportSeries: string; passportNumber: string; loanAccount: string; issuedAt: string } {
  return {
    passportSeries: data.passportSeries,
    passportNumber: data.passportNumber,
    loanAccount: data.loanAccount,
    issuedAt: data.issuedAt,
  }
}

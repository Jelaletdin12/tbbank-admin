import { z } from 'zod'
import type { IntlPaymentCreatePayload, IntlPaymentStatus, CurrencyType } from '../api/visaMasterPaymentsApi'

const fileField = z.custom<File | null>().nullable()

export const visaMasterPaymentFormSchema = z.object({
  client_id: z.string().min(1, 'Ulanyjy hökmany'),
  status: z.string().min(1, 'Status hökmany'),
  note: z.string().optional().default(''),
  currency_type: z.string().min(1, 'Ýüztumanyň görnüşi hökmany'),
  province: z.string().min(1, 'Welaýat hökmany'),
  branch: z.string().min(1, 'Şahamça hökmany'),
  passport_first_name: z.string().min(1, 'Ady hökmany'),
  passport_last_name: z.string().min(1, 'Familiýasy hökmany'),
  phone: z.string().min(1, 'Telefon hökmany'),
  email: z.string().optional().default(''),
  home_address: z.string().optional().default(''),
  passport_series: z.string().min(1, 'Pasport seriýasy hökmany'),
  passport_number: z.string().min(1, 'Pasport nomeri hökmany'),
  payer_full_name: z.string().min(1, 'Doly ady hökmany'),
  payer_account_number: z.string().min(1, 'Goşun hasaby hökmany'),
  receiver_info: z.string().min(1, 'Kabul edijiniň maglumatlary hökmany'),
  doc_sberbank_account: fileField,
  doc_school_enrollment: fileField,
  doc_summons: fileField,
  doc_passport_tm: fileField,
  doc_foreign_passport: fileField,
  doc_foreign_passport_copy: fileField,
  doc_exit_permission: fileField,
  doc_school_foreign_info: fileField,
  doc_school_departure_info: fileField,
  upd_doc_passport_tm: fileField,
  upd_doc_foreign_passport: fileField,
  upd_doc_visa: fileField,
  upd_doc_acceptance_letter: fileField,
  upd_doc_passport_biometric: fileField,
  upd_doc_passport_old: fileField,
})

export type IntlPaymentFormData = z.infer<typeof visaMasterPaymentFormSchema>

export const stepSchemas: Record<number, z.ZodType<Partial<IntlPaymentFormData>>> = {
  0: visaMasterPaymentFormSchema.pick({ client_id: true, status: true, currency_type: true }),
  1: visaMasterPaymentFormSchema.pick({ province: true, branch: true }),
  2: visaMasterPaymentFormSchema.pick({ passport_first_name: true, passport_last_name: true, phone: true }),
  3: visaMasterPaymentFormSchema.pick({
    passport_series: true, passport_number: true,
    payer_full_name: true, payer_account_number: true, receiver_info: true,
  }),
  4: z.object({}),
}

export function validateStep(
  stepIndex: number,
  form: IntlPaymentFormData,
  mode: 'create' | 'edit',
): Partial<Record<keyof IntlPaymentFormData, string>> {
  void mode
  const schema = stepSchemas[stepIndex]
  const result = schema.safeParse(form)
  if (result.success) return {}
  const errors: Partial<Record<keyof IntlPaymentFormData, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof IntlPaymentFormData
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export const DEFAULT_FORM_VALUES: IntlPaymentFormData = {
  client_id: '', status: 'pending', note: '', currency_type: '',
  province: '', branch: '',
  passport_first_name: '', passport_last_name: '', phone: '',
  email: '', home_address: '',
  passport_series: '', passport_number: '',
  payer_full_name: '', payer_account_number: '', receiver_info: '',
  doc_sberbank_account: null, doc_school_enrollment: null,
  doc_summons: null, doc_passport_tm: null,
  doc_foreign_passport: null, doc_foreign_passport_copy: null,
  doc_exit_permission: null, doc_school_foreign_info: null,
  doc_school_departure_info: null,
  upd_doc_passport_tm: null, upd_doc_foreign_passport: null,
  upd_doc_visa: null, upd_doc_acceptance_letter: null,
  upd_doc_passport_biometric: null, upd_doc_passport_old: null,
}

export function buildPayload(data: IntlPaymentFormData): IntlPaymentCreatePayload {
  return {
    ...data,
    status: data.status as IntlPaymentStatus,
    currency_type: data.currency_type as CurrencyType,
  }
}

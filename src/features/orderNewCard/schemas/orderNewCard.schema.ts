import { z } from 'zod'
import type { CardOrderStatus } from '../api/orderNewCardApi'

const fileRequired = z.custom<File>((val) => val instanceof File, 'Faýl hökmany')

export const orderNewCardFormSchema = z.object({
  isPaid: z.boolean(),
  status: z.string().min(1, 'Status — hökmany'),
  note: z.string().optional(),
  issuanceReasonId: z.string().min(1, 'Kartyň çykarylmagynyň sebäbi — hökmany'),
  cardTypeId: z.string().min(1, 'Kart görnüşi — hökmany'),
  provinceId: z.string().min(1, 'Welaýat — hökmany'),
  branchId: z.string().min(1, 'Şahamça — hökmany'),
  firstName: z.string().min(1, 'Ady — hökmany'),
  lastName: z.string().min(1, 'Familiýasy — hökmany'),
  middleName: z.string().optional(),
  formerLastName: z.string().optional(),
  birthDate: z.string().min(1, 'Doglan güni — hökmany'),
  phone: z.string().min(1, 'Telefon — hökmany'),
  phoneExtra: z.string().optional(),
  citizenship: z.string().min(1, 'Raýatlyk — hökmany'),
  registeredAddress: z.string().min(1, 'Ýazgy edilen salgy — hökmany'),
  currentAddress: z.string().min(1, 'Häzirki ýaşaýyş ýeri — hökmany'),
  workplace: z.string().min(1, 'Işleýän ýeri — hökmany'),
  passportSeriesId: z.string().min(1, 'Pasport seriýasy — hökmany'),
  passportNumber: z.string().min(1, 'Pasport belgisi — hökmany'),
  passportIssueDate: z.string().min(1, 'Pasport berlen senesi — hökmany'),
  passportIssuedBy: z.string().min(1, 'Kim tarapyndan berildi — hökmany'),
  passportBirthPlace: z.string().min(1, 'Doglan ýeri — hökmany'),
  passportPage1: z.custom<File | null>().nullable(),
  passportPage23: z.custom<File | null>().nullable(),
  passportPage89: z.custom<File | null>().nullable(),
  passportPage32: z.custom<File | null>().nullable(),
  termsAccepted: z.boolean(),
})

export type OrderNewCardFormData = z.infer<typeof orderNewCardFormSchema>

export const stepSchemas: Record<number, z.ZodType<Partial<OrderNewCardFormData>>> = {
  0: orderNewCardFormSchema.pick({
    status: true, issuanceReasonId: true, cardTypeId: true, provinceId: true, branchId: true,
  }),
  1: orderNewCardFormSchema.pick({
    firstName: true, lastName: true, birthDate: true, phone: true, citizenship: true,
    registeredAddress: true, currentAddress: true, workplace: true,
  }),
  2: orderNewCardFormSchema.pick({
    passportSeriesId: true, passportNumber: true, passportIssueDate: true,
    passportIssuedBy: true, passportBirthPlace: true,
  }),
  3: z.object({
    passportPage1: fileRequired,
    passportPage23: fileRequired,
    passportPage89: fileRequired,
    passportPage32: fileRequired,
    termsAccepted: z.literal(true, { message: 'Şertnama bilen razylaşmaly' }),
  }),
}

export function validateStep(
  stepIndex: number,
  form: OrderNewCardFormData,
  mode: 'create' | 'edit',
): Partial<Record<keyof OrderNewCardFormData, string>> {
  if (stepIndex === 3 && mode === 'edit') return {}
  const schema = stepSchemas[stepIndex]
  const result = schema.safeParse(form)
  if (result.success) return {}
  const errors: Partial<Record<keyof OrderNewCardFormData, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof OrderNewCardFormData
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export const DEFAULT_FORM_VALUES: OrderNewCardFormData = {
  isPaid: false,
  status: '',
  note: '',
  issuanceReasonId: '',
  cardTypeId: '',
  provinceId: '',
  branchId: '',
  firstName: '',
  lastName: '',
  middleName: '',
  formerLastName: '',
  birthDate: '',
  phone: '',
  phoneExtra: '',
  citizenship: 'Turkmenistan',
  registeredAddress: '',
  currentAddress: '',
  workplace: '',
  passportSeriesId: '',
  passportNumber: '',
  passportIssueDate: '',
  passportIssuedBy: '',
  passportBirthPlace: '',
  passportPage1: null,
  passportPage23: null,
  passportPage89: null,
  passportPage32: null,
  termsAccepted: false,
}

export function buildPayload(data: OrderNewCardFormData) {
  return {
    isPaid: data.isPaid,
    status: data.status as CardOrderStatus,
    note: data.note || null,
    issuanceReasonId: Number(data.issuanceReasonId),
    cardTypeId: Number(data.cardTypeId),
    provinceId: Number(data.provinceId),
    branchId: Number(data.branchId),
    firstName: data.firstName,
    lastName: data.lastName,
    middleName: data.middleName || null,
    formerLastName: data.formerLastName || null,
    birthDate: data.birthDate,
    phone: data.phone,
    phoneExtra: data.phoneExtra || null,
    citizenship: data.citizenship,
    registeredAddress: data.registeredAddress,
    currentAddress: data.currentAddress,
    workplace: data.workplace,
    passportSeriesId: Number(data.passportSeriesId),
    passportNumber: data.passportNumber,
    passportIssueDate: data.passportIssueDate,
    passportIssuedBy: data.passportIssuedBy,
    passportBirthPlace: data.passportBirthPlace,
    ...(data.passportPage1  && { passportPage1:  data.passportPage1  }),
    ...(data.passportPage23 && { passportPage23: data.passportPage23 }),
    ...(data.passportPage89 && { passportPage89: data.passportPage89 }),
    ...(data.passportPage32 && { passportPage32: data.passportPage32 }),
  }
}

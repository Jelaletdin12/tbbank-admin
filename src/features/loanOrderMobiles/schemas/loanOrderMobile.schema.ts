import { z } from 'zod'

const fileRequired = z.custom<File>((val) => val instanceof File, 'Faýl hökmany')

export const loanOrderMobileFormSchema = z.object({
  status: z.string().min(1, 'Status — hökmany'),
  loanType: z.string().min(1, 'Karz görnüşi — hökmany'),
  region: z.string().min(1, 'Welaýat — hökmany'),
  branch: z.string().min(1, 'Şahamça — hökmany'),
  firstName: z.string().min(1, 'Ady — hökmany'),
  lastName: z.string().min(1, 'Familiýasy — hökmany'),
  patronicName: z.string().optional(),
  education: z.string().min(1, 'Bilimi — hökmany'),
  marriageStatus: z.string().min(1, 'Maşgala ýagdaýy — hökmany'),
  dateOfBirth: z.string().min(1, 'Doglan güni — hökmany'),
  residence: z.string().min(1, 'Ýazgy edilen salgy — hökmany'),
  currentResidence: z.string().optional(),
  passportSerie: z.string().min(1, 'Pasport seriýasy — hökmany'),
  passportNumber: z.string().min(1, 'Pasport belgisi — hökmany'),
  passportDateOfIssue: z.string().min(1, 'Pasport berlen senesi — hökmany'),
  passportGivenBy: z.string().min(1, 'Kim tarapyndan berildi — hökmany'),
  bornPlace: z.string().optional(),
  email: z.string().optional(),
  phone: z.string()
    .min(1, 'Telefon — hökmany')
    .refine((val) => val.replace(/\D/g, '').length >= 8, { message: 'Telefon belgisi nädogry' }),
  phoneAdditional: z.string().optional(),
  homePhone: z.string().optional(),
  workCompany: z.string().min(1, 'Kärhananyň ady — hökmany'),
  workHrPhone: z.string().optional(),
  workRegion: z.string().optional(),
  workProvince: z.string().optional(),
  position: z.string().min(1, 'Wezipe — hökmany'),
  salary: z.string().min(1, 'Zähmet haky — hökmany'),
  workStartedAt: z.string().min(1, 'Işe başlan wagty — hökmany'),
  passportPage1: z.custom<File | null>().nullable(),
  passportPage23: z.custom<File | null>().nullable(),
  passportPage89: z.custom<File | null>().nullable(),
  passportPage32: z.custom<File | null>().nullable(),
  note: z.string().optional(),
  loanAmount: z.string().min(1, 'Karz möçberi — hökmany'),
  loanHistory: z.string().optional(),
  cardNumber: z.string().min(1, 'Kart belgisi — hökmany'),
  cardName: z.string().min(1, 'Kartdaky ady — hökmany'),
  cardExpMonth: z.string().min(1, 'Kart möhleti (aý) — hökmany'),
  cardExpYear: z.string().min(1, 'Kart möhleti (ýyl) — hökmany'),
  guarantor1Name: z.string().min(1, 'Zamunyň ady — hökmany'),
  guarantor1Surname: z.string().min(1, 'Zamunyň familiýasy — hökmany'),
  guarantor1Patronic: z.string().optional(),
  guarantor1PassportSerie: z.string().min(1, 'Pasport seriýasy — hökmany'),
  guarantor1PassportNumber: z.string().min(1, 'Pasport belgisi — hökmany'),
  guarantor1CardNumber: z.string().min(1, 'Kart belgisi — hökmany'),
  guarantor1CardName: z.string().min(1, 'Kartdaky ady — hökmany'),
  guarantor1CardExpMonth: z.string().min(1, 'Möhleti (aý) — hökmany'),
  guarantor1CardExpYear: z.string().min(1, 'Möhleti (ýyl) — hökmany'),
  guarantor1Salary: z.string().min(1, 'Ortaca zähmet haky — hökmany'),
})

export type LoanOrderMobileFormData = z.infer<typeof loanOrderMobileFormSchema>

export const stepSchemas: Record<number, z.ZodType<Partial<LoanOrderMobileFormData>>> = {
  0: loanOrderMobileFormSchema.pick({ loanType: true, loanAmount: true, region: true, branch: true }),
  1: loanOrderMobileFormSchema.pick({
    firstName: true, lastName: true, education: true,
    marriageStatus: true, dateOfBirth: true, residence: true,
    passportSerie: true, passportNumber: true,
    passportDateOfIssue: true, passportGivenBy: true,
  }),
  2: loanOrderMobileFormSchema.pick({
    phone: true, workCompany: true, position: true, salary: true, workStartedAt: true,
  }),
  3: loanOrderMobileFormSchema.pick({
    cardNumber: true, cardName: true, cardExpMonth: true, cardExpYear: true,
    guarantor1Name: true, guarantor1Surname: true,
    guarantor1PassportSerie: true, guarantor1PassportNumber: true,
    guarantor1CardNumber: true, guarantor1CardName: true,
    guarantor1CardExpMonth: true, guarantor1CardExpYear: true,
    guarantor1Salary: true,
  }),
  4: z.object({
    passportPage1: fileRequired,
    passportPage23: fileRequired,
  }),
}

export function validateStep(stepIndex: number, form: LoanOrderMobileFormData, mode: 'create' | 'edit'): Partial<Record<keyof LoanOrderMobileFormData, string>> {
  if (stepIndex === 4 && mode === 'edit') return {}
  const schema = stepSchemas[stepIndex]
  const result = schema.safeParse(form)
  if (result.success) return {}
  const errors: Partial<Record<keyof LoanOrderMobileFormData, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof LoanOrderMobileFormData
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export const DEFAULT_FORM_VALUES: LoanOrderMobileFormData = {
  status: 'GARAŞYLÝAR', loanType: '', region: 'Aşgabat', branch: '',
  firstName: '', lastName: '', patronicName: '', education: '',
  marriageStatus: '', dateOfBirth: '', residence: '', currentResidence: '',
  passportSerie: '', passportNumber: '', passportDateOfIssue: '',
  passportGivenBy: '', bornPlace: '', email: '', phone: '',
  phoneAdditional: '', homePhone: '', workCompany: '', workHrPhone: '',
  workRegion: 'Aşgabat', workProvince: '', position: '', salary: '',
  workStartedAt: '', passportPage1: null, passportPage23: null,
  passportPage89: null, passportPage32: null, note: '', loanAmount: '',
  loanHistory: '', cardNumber: '', cardName: '', cardExpMonth: '', cardExpYear: '',
  guarantor1Name: '', guarantor1Surname: '', guarantor1Patronic: '',
  guarantor1PassportSerie: '', guarantor1PassportNumber: '',
  guarantor1CardNumber: '', guarantor1CardName: '',
  guarantor1CardExpMonth: '', guarantor1CardExpYear: '', guarantor1Salary: '',
}

export function buildPayload(data: LoanOrderMobileFormData) {
  return {
    status:              data.status,
    loanType:            data.loanType,
    region:              data.region,
    branch:              data.branch,
    firstName:           data.firstName,
    lastName:            data.lastName,
    patronicName:        data.patronicName        || undefined,
    education:           data.education,
    marriageStatus:      data.marriageStatus,
    dateOfBirth:         data.dateOfBirth,
    residence:           data.residence,
    currentResidence:    data.currentResidence    || undefined,
    passportSerie:       data.passportSerie,
    passportNumber:      data.passportNumber,
    passportDateOfIssue: data.passportDateOfIssue,
    passportGivenBy:     data.passportGivenBy,
    bornPlace:           data.bornPlace           || undefined,
    email:               data.email               || undefined,
    phone:               data.phone,
    phoneAdditional:     data.phoneAdditional     || undefined,
    homePhone:           data.homePhone           || undefined,
    workCompany:         data.workCompany,
    workHrPhone:         data.workHrPhone         || undefined,
    workRegion:          data.workRegion          || undefined,
    workProvince:        data.workProvince        || undefined,
    position:            data.position,
    salary:              Number(data.salary),
    workStartedAt:       data.workStartedAt,
    note:                data.note                || undefined,
    loanAmount:          Number(data.loanAmount)  || undefined,
    loanHistory:         data.loanHistory         || undefined,
    cardNumber:          data.cardNumber          || undefined,
    cardName:            data.cardName            || undefined,
    cardExpMonth:        data.cardExpMonth        || undefined,
    cardExpYear:         data.cardExpYear         || undefined,
    guarantor1Name:           data.guarantor1Name           || undefined,
    guarantor1Surname:        data.guarantor1Surname        || undefined,
    guarantor1Patronic:       data.guarantor1Patronic       || undefined,
    guarantor1PassportSerie:  data.guarantor1PassportSerie  || undefined,
    guarantor1PassportNumber: data.guarantor1PassportNumber || undefined,
    guarantor1CardNumber:     data.guarantor1CardNumber     || undefined,
    guarantor1CardName:       data.guarantor1CardName       || undefined,
    guarantor1CardExpMonth:   data.guarantor1CardExpMonth   || undefined,
    guarantor1CardExpYear:    data.guarantor1CardExpYear    || undefined,
    guarantor1Salary:         Number(data.guarantor1Salary) || undefined,
  }
}

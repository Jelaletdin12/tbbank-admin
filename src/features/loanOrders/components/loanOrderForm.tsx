import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCreateLoanOrder, useUpdateLoanOrder } from '@/features/loanOrders/hooks/useLoanOrders'
import type { LoanOrder, LoanOrderPayload } from '@/features/loanOrders/api/loanOrdersApi'

// ─── Static options ───────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: 'Aşgabat', label: 'Aşgabat' },
  { value: 'Ahal',    label: 'Ahal'    },
  { value: 'Balkan',  label: 'Balkan'  },
  { value: 'Daşoguz', label: 'Daşoguz' },
  { value: 'Lebap',   label: 'Lebap'   },
  { value: 'Mary',    label: 'Mary'    },
  { value: 'Arkadag', label: 'Arkadag' },
]

const EDUCATION_OPTIONS = [
  { value: 'high',            label: 'Ýokary bilim'              },
  { value: 'unfinished_high', label: 'Gutarylmadyk ýokary bilim' },
  { value: 'masters',         label: 'Magistr'                   },
  { value: 'phd',             label: 'Ylymlaryň doktory'         },
  { value: 'middle',          label: 'Orta mekdep'               },
  { value: 'school',          label: 'Orta bilim'                },
  { value: 'school_dropout',  label: 'Gutarylmadyk orta bilim'   },
]

const MARRIAGE_OPTIONS = [
  { value: 'MARRIED',  label: 'Öýlenen / Durmuşa çykan'        },
  { value: 'SINGLE',   label: 'Öýlenmedik / Durmuşa çykmadyk'  },
  { value: 'DIVORCED', label: 'Aýrylşan'                       },
  { value: 'WIDOW',    label: 'Adamsy ýa-da aýaly aradan çykan' },
  { value: 'LEGAL',    label: 'Raýat nika'                     },
]

const STATUS_OPTIONS = [
  { value: 'GARAŞYLÝAR',        label: 'Garaşylýar'        },
  { value: 'IŞLENÝÄR',          label: 'Işlenýär'          },
  { value: 'KANAGATLANDYRYLAN', label: 'Kanagatlandyrylan' },
  { value: 'RED_EDILDI',        label: 'Red edildi'        },
]

const LOAN_TYPE_OPTIONS = [
  { value: 'consumer', label: 'Sarp ediş karzy' },
  { value: 'mortgage', label: 'Ipoteka'          },
  { value: 'car',      label: 'Awtoulag karzy'   },
  { value: 'student',  label: 'Talyplar üçin'    },
  { value: 'business', label: 'Işewürlik karzy'  },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',  label: 'I'  },
  { value: 'II', label: 'II' },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1).padStart(2, '0'),
}))

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  value: String(new Date().getFullYear() + i),
  label: String(new Date().getFullYear() + i),
}))

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  status: string
  loanType: string
  region: string
  branch: string
  firstName: string
  lastName: string
  patronicName: string
  education: string
  marriageStatus: string
  dateOfBirth: string
  residence: string
  currentResidence: string
  passportSerie: string
  passportNumber: string
  passportDateOfIssue: string
  passportGivenBy: string
  bornPlace: string
  email: string
  phone: string
  phoneAdditional: string
  homePhone: string
  workCompany: string
  workHrPhone: string
  workRegion: string
  workProvince: string
  position: string
  salary: string
  workStartedAt: string
  passportPage1: File | null
  passportPage23: File | null
  passportPage89: File | null
  passportPage32: File | null
  note: string
  loanAmount: string
  loanHistory: string
  cardNumber: string
  cardName: string
  cardExpMonth: string
  cardExpYear: string
  guarantor1Name: string
  guarantor1Surname: string
  guarantor1Patronic: string
  guarantor1PassportSerie: string
  guarantor1PassportNumber: string
  guarantor1CardNumber: string
  guarantor1CardName: string
  guarantor1CardExpMonth: string
  guarantor1CardExpYear: string
  guarantor1Salary: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  status: 'GARAŞYLÝAR',
  loanType: '',
  region: 'Aşgabat',
  branch: '',
  firstName: '',
  lastName: '',
  patronicName: '',
  education: '',
  marriageStatus: '',
  dateOfBirth: '',
  residence: '',
  currentResidence: '',
  passportSerie: '',
  passportNumber: '',
  passportDateOfIssue: '',
  passportGivenBy: '',
  bornPlace: '',
  email: '',
  phone: '',
  phoneAdditional: '',
  homePhone: '',
  workCompany: '',
  workHrPhone: '',
  workRegion: 'Aşgabat',
  workProvince: '',
  position: '',
  salary: '',
  workStartedAt: '',
  passportPage1: null,
  passportPage23: null,
  passportPage89: null,
  passportPage32: null,
  note: '',
  loanAmount: '',
  loanHistory: '',
  cardNumber: '',
  cardName: '',
  cardExpMonth: '',
  cardExpYear: '',
  guarantor1Name: '',
  guarantor1Surname: '',
  guarantor1Patronic: '',
  guarantor1PassportSerie: '',
  guarantor1PassportNumber: '',
  guarantor1CardNumber: '',
  guarantor1CardName: '',
  guarantor1CardExpMonth: '',
  guarantor1CardExpYear: '',
  guarantor1Salary: '',
}

function mapToFormState(order: LoanOrder): FormState {
  return {
    status:              order.status              ?? 'GARAŞYLÝAR',
    loanType:            order.loanType            ?? '',
    region:              order.region              ?? 'Aşgabat',
    branch:              order.branch              ?? '',
    firstName:           order.firstName           ?? '',
    lastName:            order.lastName            ?? '',
    patronicName:        order.patronicName        ?? '',
    education:           order.education           ?? '',
    marriageStatus:      order.marriageStatus      ?? '',
    dateOfBirth:         order.dateOfBirth         ?? '',
    residence:           order.residence           ?? '',
    currentResidence:    order.currentResidence    ?? '',
    passportSerie:       order.passportSerie       ?? '',
    passportNumber:      order.passportNumber      ?? '',
    passportDateOfIssue: order.passportDateOfIssue ?? '',
    passportGivenBy:     order.passportGivenBy     ?? '',
    bornPlace:           order.bornPlace           ?? '',
    email:               order.email               ?? '',
    phone:               order.phone               ?? '',
    phoneAdditional:     order.phoneAdditional     ?? '',
    homePhone:           order.homePhone           ?? '',
    workCompany:         order.workCompany         ?? '',
    workHrPhone:         order.workHrPhone         ?? '',
    workRegion:          order.workRegion          ?? 'Aşgabat',
    workProvince:        order.workProvince        ?? '',
    position:            order.position            ?? '',
    salary:              order.salary != null ? String(order.salary) : '',
    workStartedAt:       order.workStartedAt       ?? '',
    passportPage1:  null,
    passportPage23: null,
    passportPage89: null,
    passportPage32: null,
    note:         order.note      ?? '',
    loanAmount:   order.loanAmount != null ? String(order.loanAmount) : '',
    loanHistory:  order.loanHistory ?? '',
    cardNumber:   order.cardNumber   ?? '',
    cardName:     order.cardName     ?? '',
    cardExpMonth: order.cardExpMonth ?? '',
    cardExpYear:  order.cardExpYear  ?? '',
    guarantor1Name:           order.guarantor1Name           ?? '',
    guarantor1Surname:        order.guarantor1Surname        ?? '',
    guarantor1Patronic:       order.guarantor1Patronic       ?? '',
    guarantor1PassportSerie:  order.guarantor1PassportSerie  ?? '',
    guarantor1PassportNumber: order.guarantor1PassportNumber ?? '',
    guarantor1CardNumber:     order.guarantor1CardNumber     ?? '',
    guarantor1CardName:       order.guarantor1CardName       ?? '',
    guarantor1CardExpMonth:   order.guarantor1CardExpMonth   ?? '',
    guarantor1CardExpYear:    order.guarantor1CardExpYear    ?? '',
    guarantor1Salary: order.guarantor1Salary != null ? String(order.guarantor1Salary) : '',
  }
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  /** Returns error keys relevant to this step */
  validate: (form: FormState, mode: 'create' | 'edit') => FormErrors
}

const STEPS: StepDef[] = [
  {
    id: 'status',
    titleKey: 'Status',
    titleFallback: 'Status',
    validate: () => ({}),
  },
  {
    id: 'loan',
    titleKey: 'Loan',
    titleFallback: 'Karz',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.loanType) e.loanType = 'Karz görnüşi — hökmany'
      if (!form.loanAmount) e.loanAmount = 'Karz möçberi — hökmany'
      return e
    },
  },
  {
    id: 'location',
    titleKey: 'Location',
    titleFallback: 'Lokasiýa',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.region) e.region = 'Welaýat — hökmany'
      if (!form.branch) e.branch = 'Şahamça — hökmany'
      return e
    },
  },
  {
    id: 'personal',
    titleKey: 'Personal data',
    titleFallback: 'Şahsy maglumatlar',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.firstName)      e.firstName      = 'Ady — hökmany'
      if (!form.lastName)       e.lastName       = 'Familiýasy — hökmany'
      if (!form.education)      e.education      = 'Bilimi — hökmany'
      if (!form.marriageStatus) e.marriageStatus = 'Maşgala ýagdaýy — hökmany'
      if (!form.dateOfBirth)    e.dateOfBirth    = 'Doglan güni — hökmany'
      if (!form.residence)      e.residence      = 'Ýazgy edilen salgy — hökmany'
      return e
    },
  },
  {
    id: 'card',
    titleKey: 'Card (Salary)',
    titleFallback: 'Kart (Zähmet haky)',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.cardNumber)   e.cardNumber   = 'Kart belgisi — hökmany'
      if (!form.cardName)     e.cardName     = 'Kartdaky ady — hökmany'
      if (!form.cardExpMonth) e.cardExpMonth = 'Kart möhleti (aý) — hökmany'
      if (!form.cardExpYear)  e.cardExpYear  = 'Kart möhleti (ýyl) — hökmany'
      return e
    },
  },
  {
    id: 'passport',
    titleKey: 'Passport',
    titleFallback: 'Pasport',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.passportSerie)       e.passportSerie       = 'Pasport seriýasy — hökmany'
      if (!form.passportNumber)      e.passportNumber      = 'Pasport belgisi — hökmany'
      if (!form.passportDateOfIssue) e.passportDateOfIssue = 'Pasport berlen senesi — hökmany'
      if (!form.passportGivenBy)     e.passportGivenBy     = 'Kim tarapyndan berildi — hökmany'
      return e
    },
  },
  {
    id: 'contact',
    titleKey: 'Contact data',
    titleFallback: 'Habarlaşmak',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.phone) {
        e.phone = 'Telefon — hökmany'
      } else if (form.phone.replace(/\D/g, '').length < 8) {
        e.phone = 'Telefon belgisi nädogry'
      }
      return e
    },
  },
  {
    id: 'job',
    titleKey: 'Job',
    titleFallback: 'Iş',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.workCompany)   e.workCompany   = 'Kärhananyň ady — hökmany'
      if (!form.position)      e.position      = 'Wezipe — hökmany'
      if (!form.salary)        e.salary        = 'Zähmet haky — hökmany'
      if (!form.workStartedAt) e.workStartedAt = 'Işe başlan wagty — hökmany'
      return e
    },
  },
  {
    id: 'files',
    titleKey: 'Passport files',
    titleFallback: 'Pasport faýllar',
    validate: (form, mode) => {
      const e: FormErrors = {}
      if (mode === 'create') {
        if (!form.passportPage1)  e.passportPage1  = 'Pasport (sahypa 1) hökmany'
        if (!form.passportPage23) e.passportPage23 = 'Pasport (sahypa 2-3) hökmany'
      }
      return e
    },
  },
  {
    id: 'guarantor',
    titleKey: '1. Guarantor',
    titleFallback: '1. Zamun',
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.guarantor1Name)           e.guarantor1Name           = 'Zamunyň ady — hökmany'
      if (!form.guarantor1Surname)        e.guarantor1Surname        = 'Zamunyň familiýasy — hökmany'
      if (!form.guarantor1PassportSerie)  e.guarantor1PassportSerie  = 'Pasport seriýasy — hökmany'
      if (!form.guarantor1PassportNumber) e.guarantor1PassportNumber = 'Pasport belgisi — hökmany'
      if (!form.guarantor1CardNumber)     e.guarantor1CardNumber     = 'Kart belgisi — hökmany'
      if (!form.guarantor1CardName)       e.guarantor1CardName       = 'Kartdaky ady — hökmany'
      if (!form.guarantor1CardExpMonth)   e.guarantor1CardExpMonth   = 'Möhleti (aý) — hökmany'
      if (!form.guarantor1CardExpYear)    e.guarantor1CardExpYear    = 'Möhleti (ýyl) — hökmany'
      if (!form.guarantor1Salary)         e.guarantor1Salary         = 'Ortaca zähmet haky — hökmany'
      return e
    },
  },
]

// ─── Step Sidebar ─────────────────────────────────────────────────────────────

function StepSidebar({
  steps,
  current,
  completed,
  onGoTo,
}: {
  steps: StepDef[]
  current: number
  completed: Set<number>
  onGoTo: (i: number) => void
}) {
  return (
    <nav className="bg-card border border-border rounded-xl py-2 sticky top-4 overflow-hidden">
      {steps.map((step, i) => {
        const isDone      = completed.has(i)
        const isActive    = i === current
        const isReachable = i === 0 || completed.has(i - 1) || isDone

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isReachable && onGoTo(i)}
            disabled={!isReachable}
            className={cn(
              'relative w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors duration-150',
              'disabled:cursor-not-allowed',
              isActive  && 'bg-muted',
              !isActive && isReachable && 'hover:bg-muted/50',
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
            )}

            {/* Dot */}
            <span
              className={cn(
                'flex items-center justify-center w-[22px] h-[22px] rounded-full shrink-0 text-[11px] font-semibold border transition-all duration-200',
                isActive  && 'bg-primary border-primary text-primary-foreground',
                isDone && !isActive && 'bg-primary/10 border-primary/30 text-primary',
                !isDone && !isActive && 'bg-background border-border text-muted-foreground',
              )}
            >
              {isDone && !isActive
                ? <CheckCircle2 className="w-3 h-3" />
                : i + 1
              }
            </span>

            {/* Label */}
            <span
              className={cn(
                'text-[13px] leading-snug transition-colors duration-150',
                isActive  && 'text-foreground font-medium',
                isDone && !isActive && 'text-muted-foreground',
                !isDone && !isActive && 'text-muted-foreground',
              )}
            >
              {step.titleFallback}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Step content renderers ───────────────────────────────────────────────────

function StepStatus({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-md">
        <FormInput
          type="select"
          label="Status"
          required
          value={form.status}
          onChange={(v) => set('status', v)}
          options={STATUS_OPTIONS}
          error={errors.status}
          placeholder="Saýlaň"
        />
      </div>
      <FormInput
        type="text"
        label="Bellik"
        value={form.note}
        onChange={(v) => set('note', v)}
        placeholder="Bellik"
      />
    </div>
  )
}

function StepLoan({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FormInput
        type="searchable-select"
        label="Karz görnüşi"
        required
        value={form.loanType}
        onChange={(v) => set('loanType', v)}
        options={LOAN_TYPE_OPTIONS}
        placeholder="Saýlamak üçin basyň"
        error={errors.loanType}
      />
      <FormInput
        type="number"
        label="Karz möçberi"
        required
        value={form.loanAmount}
        onChange={(v) => set('loanAmount', v)}
        placeholder="Karz möçberi"
        error={errors.loanAmount}
      />
    </div>
  )
}

function StepLocation({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FormInput
        type="searchable-select"
        label="Welaýat"
        required
        value={form.region}
        onChange={(v) => set('region', v)}
        options={REGION_OPTIONS}
        placeholder="Saýlamak üçin basyň"
        error={errors.region}
      />
      <FormInput
        type="searchable-select"
        label="Şahamça"
        required
        value={form.branch}
        onChange={(v) => set('branch', v)}
        options={[]}
        placeholder="Saýlamak üçin basyň"
        error={errors.branch}
      />
    </div>
  )
}

function StepPersonal({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput type="text"  label="Ady"            required value={form.firstName}      onChange={(v) => set('firstName', v)}      placeholder="Ady"            error={errors.firstName}      />
        <FormInput type="text"  label="Familiýasy"     required value={form.lastName}       onChange={(v) => set('lastName', v)}       placeholder="Familiýasy"     error={errors.lastName}       />
        <FormInput type="text"  label="Atasynyň ady"            value={form.patronicName}   onChange={(v) => set('patronicName', v)}   placeholder="Atasynyň ady"                                 />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput type="select" label="Bilimi"          required value={form.education}      onChange={(v) => set('education', v)}      options={EDUCATION_OPTIONS}  placeholder="Saýlaň"          error={errors.education}      />
        <FormInput type="select" label="Maşgala ýagdaýy" required value={form.marriageStatus} onChange={(v) => set('marriageStatus', v)} options={MARRIAGE_OPTIONS}   placeholder="Saýlaň"          error={errors.marriageStatus} />
        <FormInput type="date"  label="Doglan güni"     required value={form.dateOfBirth}    onChange={(v) => set('dateOfBirth', v)}    error={errors.dateOfBirth}    />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="text"  label="Ýazgy edilen salgyňyz"  required value={form.residence}       onChange={(v) => set('residence', v)}       placeholder="Ýazgy edilen salgy" error={errors.residence}  />
        <FormInput type="text"  label="Häzirki ýaşaýyş ýeri"            value={form.currentResidence} onChange={(v) => set('currentResidence', v)} placeholder="Häzirki ýaşaýyş ýeri" />
      </div>
      <div className="max-w-md">
        <FormInput
          type="searchable-select"
          label="Karz taryhy"
          value={form.loanHistory}
          onChange={(v) => set('loanHistory', v)}
          options={[]}
          placeholder="Saýlamak üçin basyň"
        />
      </div>
    </div>
  )
}

function StepCard({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormInput type="text"             label="Kart belgisi"      required value={form.cardNumber}   onChange={(v) => set('cardNumber', v)}   placeholder="Kart belgisi"          error={errors.cardNumber}   />
      <FormInput type="text"             label="Kartdaky ady"      required value={form.cardName}     onChange={(v) => set('cardName', v)}     placeholder="Kartdaky ady"          error={errors.cardName}     />
      <FormInput type="searchable-select" label="Kart Möhleti (aý)" required value={form.cardExpMonth} onChange={(v) => set('cardExpMonth', v)} options={MONTH_OPTIONS}             placeholder="Saýlamak üçin basyň" error={errors.cardExpMonth} />
      <FormInput type="searchable-select" label="Kart Möhleti (ýyl)" required value={form.cardExpYear}  onChange={(v) => set('cardExpYear', v)}  options={YEAR_OPTIONS}              placeholder="Saýlamak üçin basyň" error={errors.cardExpYear}  />
    </div>
  )
}

function StepPassport({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput type="searchable-select" label="Pasport seriýasy"    required value={form.passportSerie}       onChange={(v) => set('passportSerie', v)}       options={PASSPORT_SERIES_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.passportSerie}       />
        <FormInput type="text"             label="Pasport belgisi"      required value={form.passportNumber}      onChange={(v) => set('passportNumber', v)}      placeholder="Pasport belgisi"           error={errors.passportNumber}      />
        <FormInput type="date"             label="Pasport berlen senesi" required value={form.passportDateOfIssue} onChange={(v) => set('passportDateOfIssue', v)} error={errors.passportDateOfIssue} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="text" label="Kim tarapyndan berildi" required value={form.passportGivenBy} onChange={(v) => set('passportGivenBy', v)} placeholder="Kim tarapyndan berildi" error={errors.passportGivenBy} />
        <FormInput type="text" label="Doglan ýeri (pasport)"            value={form.bornPlace}       onChange={(v) => set('bornPlace', v)}       placeholder="Doglan ýeri (pasport)"  />
      </div>
    </div>
  )
}

function StepContact({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <FormInput type="email" label="E-poçta"        value={form.email}           onChange={(v) => set('email', v)}           placeholder="E-poçta"    />
      <FormInput type="phone" label="Telefon"         required value={form.phone}           onChange={(v) => set('phone', v)}           placeholder="61 097 651" error={errors.phone}           />
      <FormInput type="phone" label="Telefon goşmaça"          value={form.phoneAdditional} onChange={(v) => set('phoneAdditional', v)} placeholder="61 097 651" />
      <FormInput type="phone" label="Öý telefony"              value={form.homePhone}       onChange={(v) => set('homePhone', v)}       placeholder="61 097 651" />
    </div>
  )
}

function StepJob({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="text"  label="Işleýän edaranyň/kärhananyň ady" required value={form.workCompany} onChange={(v) => set('workCompany', v)} placeholder="Kärhananyň ady" error={errors.workCompany} />
        <FormInput type="phone" label="Işgärler bölüminiň iş belgisi"            value={form.workHrPhone}  onChange={(v) => set('workHrPhone', v)}  placeholder="61 097 651"     />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="searchable-select" label="Işleýän welaýatyňyz" value={form.workRegion}   onChange={(v) => set('workRegion', v)}   options={REGION_OPTIONS} placeholder="Saýlamak üçin basyň" />
        <FormInput type="searchable-select" label="Işleýän etrabyňyz"   value={form.workProvince} onChange={(v) => set('workProvince', v)} options={[]}             placeholder="Saýlamak üçin basyň" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput type="text"   label="Wezipe"          required value={form.position}      onChange={(v) => set('position', v)}      placeholder="Wezipe"          error={errors.position}      />
        <FormInput type="number" label="Zähmet haky"     required value={form.salary}        onChange={(v) => set('salary', v)}        placeholder="Zähmet haky"     error={errors.salary}        />
        <FormInput type="date"   label="Işe başlan wagtyňyz" required value={form.workStartedAt} onChange={(v) => set('workStartedAt', v)} error={errors.workStartedAt} />
      </div>
    </div>
  )
}

function StepFiles({
  form, errors, set, mode, initialData,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  mode: 'create' | 'edit'
  initialData?: LoanOrder
}) {
  return (
    <div className="flex flex-col gap-6">
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(
            [
              { url: initialData.passportPage1Url,  label: 'Pasport (sahypa 1)' },
              { url: initialData.passportPage23Url, label: 'Pasport (2-3-nji sahypa)' },
              { url: initialData.passportPage89Url, label: 'Pasport (8-9 sahypa)' },
              { url: initialData.passportPage32Url, label: 'Pasport (32-nji sahypa)' },
            ] as { url?: string; label: string }[]
          ).map(({ url, label }) =>
            url ? (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{label} — häzirki</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate">
                  Faýly gör
                </a>
              </div>
            ) : null
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput
          type="file"
          label={mode === 'edit' ? 'Pasport (sahypa 1) (çalyşmak)' : 'Pasport (sahypa 1)'}
          required={mode === 'create'}
          accept="image/*"
          fileValue={form.passportPage1}
          onFileChange={(f) => set('passportPage1', f)}
          placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
          error={errors.passportPage1}
        />
        <FormInput
          type="file"
          label={mode === 'edit' ? 'Pasport (2-3-nji sahypa) (çalyşmak)' : 'Pasport (2-3-nji sahypa)'}
          required={mode === 'create'}
          accept="image/*"
          fileValue={form.passportPage23}
          onFileChange={(f) => set('passportPage23', f)}
          placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
          error={errors.passportPage23}
        />
        <FormInput
          type="file"
          label="Pasport (8-9 sahypa)"
          accept="image/*"
          fileValue={form.passportPage89}
          onFileChange={(f) => set('passportPage89', f)}
          placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
        />
        <FormInput
          type="file"
          label="Pasport (32-nji sahypa)"
          accept="image/*"
          fileValue={form.passportPage32}
          onFileChange={(f) => set('passportPage32', f)}
          placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
        />
      </div>
    </div>
  )
}

function StepGuarantor({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput type="text" label="Zamunyň ady"        required value={form.guarantor1Name}    onChange={(v) => set('guarantor1Name', v)}    placeholder="Zamunyň ady"        error={errors.guarantor1Name}    />
        <FormInput type="text" label="Zamunyň familiýasy" required value={form.guarantor1Surname}  onChange={(v) => set('guarantor1Surname', v)}  placeholder="Zamunyň familiýasy" error={errors.guarantor1Surname}  />
        <FormInput type="text" label="Zamunyň atasynyň ady"        value={form.guarantor1Patronic} onChange={(v) => set('guarantor1Patronic', v)} placeholder="Zamunyň atasynyň ady" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="searchable-select" label="Pasport seriýasy" required value={form.guarantor1PassportSerie}  onChange={(v) => set('guarantor1PassportSerie', v)}  options={PASSPORT_SERIES_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.guarantor1PassportSerie}  />
        <FormInput type="text"             label="Pasport belgisi"   required value={form.guarantor1PassportNumber} onChange={(v) => set('guarantor1PassportNumber', v)} placeholder="Pasport belgisi"           error={errors.guarantor1PassportNumber} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormInput type="text"             label="Kart belgisi"      required value={form.guarantor1CardNumber}   onChange={(v) => set('guarantor1CardNumber', v)}   placeholder="Kart belgisi"          error={errors.guarantor1CardNumber}   />
        <FormInput type="text"             label="Kartdaky ady"      required value={form.guarantor1CardName}     onChange={(v) => set('guarantor1CardName', v)}     placeholder="Kartdaky ady"          error={errors.guarantor1CardName}     />
        <FormInput type="searchable-select" label="Möhleti (aý)"     required value={form.guarantor1CardExpMonth} onChange={(v) => set('guarantor1CardExpMonth', v)} options={MONTH_OPTIONS}             placeholder="Saýlamak üçin basyň"    error={errors.guarantor1CardExpMonth} />
        <FormInput type="searchable-select" label="Möhleti (ýyl)"    required value={form.guarantor1CardExpYear}  onChange={(v) => set('guarantor1CardExpYear', v)}  options={YEAR_OPTIONS}              placeholder="Saýlamak üçin basyň"    error={errors.guarantor1CardExpYear}  />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput type="number" label="Ortaca zähmet haky" required value={form.guarantor1Salary} onChange={(v) => set('guarantor1Salary', v)} placeholder="Ortaca zähmet haky" error={errors.guarantor1Salary} />
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoanOrderFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanOrder
  loanOrderId?: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoanOrderForm({ mode, initialData, loanOrderId }: LoanOrderFormProps) {
  const { t }      = useTranslation()
  const navigate   = useNavigate()

  const createMutation = useCreateLoanOrder()
  const updateMutation = useUpdateLoanOrder()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [form, setForm]           = useState<FormState>(() => initialData ? mapToFormState(initialData) : INITIAL_STATE)
  const [errors, setErrors]       = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(
    // In edit mode, mark all steps as reachable from the start
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>()
  )

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    },
    []
  )

  const stepProps = useMemo(() => ({ form, errors, set }), [form, errors, set])

  // Validate current step and advance
  const handleNext = () => {
    const stepDef = STEPS[currentStep]
    const errs    = stepDef.validate(form, mode)

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Dogry maglumat girizmegiňizi haýyş edýäris.')
      return
    }

    setErrors({})
    setCompleted((prev) => new Set([...prev, currentStep]))

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setErrors({})
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGoTo = (i: number) => {
    setErrors({})
    setCurrentStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final submit — validate all steps at once
  const handleSubmit = () => {
    const allErrors: FormErrors = {}
    for (const step of STEPS) {
      Object.assign(allErrors, step.validate(form, mode))
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      toast.error('Käbir hökmany meýdanlar doldurylan däldir.')
      // Find which step has the first error and jump there
      for (let i = 0; i < STEPS.length; i++) {
        const stepErrs = STEPS[i].validate(form, mode)
        if (Object.keys(stepErrs).length > 0) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    const payload: LoanOrderPayload = {
      status:              form.status,
      loanType:            form.loanType,
      region:              form.region,
      branch:              form.branch,
      firstName:           form.firstName,
      lastName:            form.lastName,
      patronicName:        form.patronicName   || undefined,
      education:           form.education,
      marriageStatus:      form.marriageStatus,
      dateOfBirth:         form.dateOfBirth,
      residence:           form.residence,
      currentResidence:    form.currentResidence || undefined,
      passportSerie:       form.passportSerie,
      passportNumber:      form.passportNumber,
      passportDateOfIssue: form.passportDateOfIssue,
      passportGivenBy:     form.passportGivenBy,
      bornPlace:           form.bornPlace       || undefined,
      email:               form.email           || undefined,
      phone:               form.phone,
      phoneAdditional:     form.phoneAdditional || undefined,
      homePhone:           form.homePhone       || undefined,
      workCompany:         form.workCompany,
      workHrPhone:         form.workHrPhone     || undefined,
      workRegion:          form.workRegion      || undefined,
      workProvince:        form.workProvince    || undefined,
      position:            form.position,
      salary:              Number(form.salary),
      workStartedAt:       form.workStartedAt,
      note:                form.note            || undefined,
      loanAmount:          Number(form.loanAmount) || undefined,
      loanHistory:         form.loanHistory     || undefined,
      cardNumber:          form.cardNumber      || undefined,
      cardName:            form.cardName        || undefined,
      cardExpMonth:        form.cardExpMonth    || undefined,
      cardExpYear:         form.cardExpYear     || undefined,
      guarantor1Name:           form.guarantor1Name           || undefined,
      guarantor1Surname:        form.guarantor1Surname        || undefined,
      guarantor1Patronic:       form.guarantor1Patronic       || undefined,
      guarantor1PassportSerie:  form.guarantor1PassportSerie  || undefined,
      guarantor1PassportNumber: form.guarantor1PassportNumber || undefined,
      guarantor1CardNumber:     form.guarantor1CardNumber     || undefined,
      guarantor1CardName:       form.guarantor1CardName       || undefined,
      guarantor1CardExpMonth:   form.guarantor1CardExpMonth   || undefined,
      guarantor1CardExpYear:    form.guarantor1CardExpYear    || undefined,
      guarantor1Salary:         Number(form.guarantor1Salary) || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/loan-orders'),
      })
    } else {
      updateMutation.mutate(
        { id: loanOrderId!, payload },
        { onSuccess: () => navigate('/loan-orders') }
      )
    }
  }

  const isLastStep = currentStep === STEPS.length - 1

  // Completed step count for progress bar
  const completedCount = completed.size

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'create'
            ? (t('Loan order create') || 'Karz sargyt döredüň')
            : (t('Loan order edit')   || 'Karz sargydy üýtget')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('Fill in all sections step by step') || 'Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.'}
        </p>
      </div>

      {/* ── Thin progress bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[3px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {completedCount} / {STEPS.length}
        </span>
      </div>

      {/* ── Sidebar + content layout ── */}
      <div className="grid grid-cols-[200px_1fr] gap-5 items-start">
        {/* Sidebar */}
        <StepSidebar
          steps={STEPS}
          current={currentStep}
          completed={completed}
          onGoTo={handleGoTo}
        />

        {/* Step card */}
        <div className="flex flex-col gap-0 bg-card border border-border rounded-xl overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tabular-nums">
              {currentStep + 1} / {STEPS.length}
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              {t(STEPS[currentStep].titleKey) || STEPS[currentStep].titleFallback}
            </h2>
          </div>

          {/* Card body */}
          <div className="p-5">
            {currentStep === 0 && <StepStatus    {...stepProps} />}
            {currentStep === 1 && <StepLoan      {...stepProps} />}
            {currentStep === 2 && <StepLocation  {...stepProps} />}
            {currentStep === 3 && <StepPersonal  {...stepProps} />}
            {currentStep === 4 && <StepCard      {...stepProps} />}
            {currentStep === 5 && <StepPassport  {...stepProps} />}
            {currentStep === 6 && <StepContact   {...stepProps} />}
            {currentStep === 7 && <StepJob       {...stepProps} />}
            {currentStep === 8 && <StepFiles     {...stepProps} mode={mode} initialData={initialData} />}
            {currentStep === 9 && <StepGuarantor {...stepProps} />}
          </div>

          {/* Card footer with navigation */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={currentStep === 0 ? () => navigate(-1) : handleBack}
              disabled={isPending}
            >
              {currentStep === 0 ? (
                t('Cancel') || 'Ýatyr'
              ) : (
                <span className="flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {t('Back') || 'Yza'}
                </span>
              )}
            </Button>

            {isLastStep ? (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={isPending}
                className="min-w-[150px]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('Loading') || 'Ýüklenilýär...'}
                  </span>
                ) : mode === 'create'
                    ? (t('loanOrderMobiles.createButton') || 'Karz sargyt döredüň')
                    : (t('loanOrders.saveButton')         || 'Ýatda sakla')
                }
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={isPending}
                className="min-w-[120px]"
              >
                <span className="flex items-center gap-1.5">
                  {t('Next') || 'Indiki'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CreditCard, User, FileText, Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import type { SelectOption } from '@/components/formInput'
import type {
  CardOrder,
  CardOrderStatus,
  CreateCardOrderPayload,
} from '../api/orderNewCardApi'
import {
  useCardIssuanceReasons,
  useCardTypes,
  useProvinces,
  useBranches,
  useCreateCardOrder,
  useUpdateCardOrder,
} from '../hooks/useOrderNewCard'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardOrderFormProps {
  mode: 'create' | 'edit'
  initialData?: CardOrder
  cardOrderId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormState {
  isPaid: boolean
  status: CardOrderStatus | ''
  note: string
  issuanceReasonId: string
  cardTypeId: string
  provinceId: string
  branchId: string
  firstName: string
  lastName: string
  middleName: string
  formerLastName: string
  birthDate: string
  phone: string
  phoneExtra: string
  citizenship: string
  registeredAddress: string
  currentAddress: string
  workplace: string
  passportSeriesId: string
  passportNumber: string
  passportIssueDate: string
  passportIssuedBy: string
  passportBirthPlace: string
  passportPage1: File | null
  passportPage23: File | null
  passportPage89: File | null
  passportPage32: File | null
  termsAccepted: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Initial state ────────────────────────────────────────────────────────────

function getInitialState(data?: CardOrder): FormState {
  return {
    isPaid:             data?.isPaid             ?? false,
    status:             data?.status             ?? '',
    note:               data?.note               ?? '',
    issuanceReasonId:   data?.issuanceReasonId   ? String(data.issuanceReasonId) : '',
    cardTypeId:         data?.cardTypeId         ? String(data.cardTypeId)        : '',
    provinceId:         data?.provinceId         ? String(data.provinceId)        : '',
    branchId:           data?.branchId           ? String(data.branchId)          : '',
    firstName:          data?.firstName          ?? '',
    lastName:           data?.lastName           ?? '',
    middleName:         data?.middleName         ?? '',
    formerLastName:     data?.formerLastName      ?? '',
    birthDate:          data?.birthDate          ?? '',
    phone:              data?.phone              ?? '',
    phoneExtra:         data?.phoneExtra         ?? '',
    citizenship:        data?.citizenship        ?? 'Turkmenistan',
    registeredAddress:  data?.registeredAddress  ?? '',
    currentAddress:     data?.currentAddress     ?? '',
    workplace:          data?.workplace          ?? '',
    passportSeriesId:   data?.passportSeriesId   ? String(data.passportSeriesId) : '',
    passportNumber:     data?.passportNumber     ?? '',
    passportIssueDate:  data?.passportIssueDate  ?? '',
    passportIssuedBy:   data?.passportIssuedBy   ?? '',
    passportBirthPlace: data?.passportBirthPlace ?? '',
    passportPage1:  null,
    passportPage23: null,
    passportPage89: null,
    passportPage32: null,
    termsAccepted: false,
  }
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  subtitle: string
  icon: LucideIcon
  validate: (form: FormState, mode: 'create' | 'edit') => FormErrors
}

const STEPS: StepDef[] = [
  {
    id: 'card',
    titleKey: 'cardOrder.step.card',
    titleFallback: 'Kart',
    subtitle: 'Görnüş & lokasiýa',
    icon: CreditCard,
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.status)           e.status           = 'Status — hökmany'
      if (!form.issuanceReasonId) e.issuanceReasonId = 'Kartyň çykarylmagynyň sebäbi — hökmany'
      if (!form.cardTypeId)       e.cardTypeId       = 'Kart görnüşi — hökmany'
      if (!form.provinceId)       e.provinceId       = 'Welaýat — hökmany'
      if (!form.branchId)         e.branchId         = 'Şahamça — hökmany'
      return e
    },
  },
  {
    id: 'personal',
    titleKey: 'cardOrder.step.personal',
    titleFallback: 'Şahsy',
    subtitle: 'Maglumatlar',
    icon: User,
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.firstName)         e.firstName         = 'Ady — hökmany'
      if (!form.lastName)          e.lastName          = 'Familiýasy — hökmany'
      if (!form.birthDate)         e.birthDate         = 'Doglan güni — hökmany'
      if (!form.phone)             e.phone             = 'Telefon — hökmany'
      if (!form.citizenship)       e.citizenship       = 'Raýatlyk — hökmany'
      if (!form.registeredAddress) e.registeredAddress = 'Ýazgy edilen salgy — hökmany'
      if (!form.currentAddress)    e.currentAddress    = 'Häzirki ýaşaýyş ýeri — hökmany'
      if (!form.workplace)         e.workplace         = 'Işleýän ýeri — hökmany'
      return e
    },
  },
  {
    id: 'passport',
    titleKey: 'cardOrder.step.passport',
    titleFallback: 'Pasport',
    subtitle: 'Resmi maglumat',
    icon: FileText,
    validate: (form) => {
      const e: FormErrors = {}
      if (!form.passportSeriesId)   e.passportSeriesId   = 'Pasport seriýasy — hökmany'
      if (!form.passportNumber)     e.passportNumber     = 'Pasport belgisi — hökmany'
      if (!form.passportIssueDate)  e.passportIssueDate  = 'Pasport berlen senesi — hökmany'
      if (!form.passportIssuedBy)   e.passportIssuedBy   = 'Kim tarapyndan berildi — hökmany'
      if (!form.passportBirthPlace) e.passportBirthPlace = 'Doglan ýeri — hökmany'
      return e
    },
  },
  {
    id: 'files',
    titleKey: 'cardOrder.step.files',
    titleFallback: 'Faýllar',
    subtitle: 'Ýüklemek & Tassyklamak',
    icon: Upload,
    validate: (form, mode) => {
      const e: FormErrors = {}
      if (mode === 'create') {
        if (!form.passportPage1)  e.passportPage1  = 'Pasport (sahypa 1) — hökmany'
        if (!form.passportPage23) e.passportPage23 = 'Pasport (2-3-nji sahypa) — hökmany'
        if (!form.passportPage89) e.passportPage89 = 'Pasport (8-9 sahypa) — hökmany'
        if (!form.passportPage32) e.passportPage32 = 'Pasport (32-nji sahypa) — hökmany'
        if (!form.termsAccepted)  e.termsAccepted  = 'Şertnama bilen razylaşmaly'
      }
      return e
    },
  },
]

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3 | 4
  children: React.ReactNode
}) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full' | 2 | 3
  children: React.ReactNode
}) {
  const spanClass =
    span === 'full' ? 'sm:col-span-full' :
    span === 2      ? 'sm:col-span-2'    :
    span === 3      ? 'sm:col-span-3'    : ''

  return (
    <div className={`bg-card border border-border rounded-xl p-5 space-y-4 ${spanClass}`}>
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Shared step content props ────────────────────────────────────────────────

interface StepContentProps {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepCard({
  form, errors, set,
  statusOptions, issuanceReasonOptions, cardTypeOptions, provinceOptions, branchOptions,
}: StepContentProps & {
  statusOptions: SelectOption[]
  issuanceReasonOptions: SelectOption[]
  cardTypeOptions: SelectOption[]
  provinceOptions: SelectOption[]
  branchOptions: SelectOption[]
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label="Status"
            required
            value={form.status}
            onChange={(v) => set('status', v as CardOrderStatus)}
            options={statusOptions}
            placeholder="Saýlaň"
            error={errors.status}
          />
          <FormInput
            type="textarea"
            label="Bellik"
            value={form.note}
            onChange={(v) => set('note', v)}
            placeholder="Bellik..."
            rows={3}
          />
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-2">
            <input
              id="isPaid"
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => set('isPaid', e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <label
              htmlFor="isPaid"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
            >
              Tölenen
            </label>
          </div>
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label="Kartyň çykarylmagynyň sebäbi"
            required
            value={form.issuanceReasonId}
            onChange={(v) => set('issuanceReasonId', v)}
            options={issuanceReasonOptions}
            placeholder="Saýlamak üçin basyň"
            error={errors.issuanceReasonId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label="Kart görnüşi"
            required
            value={form.cardTypeId}
            onChange={(v) => set('cardTypeId', v)}
            options={cardTypeOptions}
            placeholder="Saýlamak üçin basyň"
            error={errors.cardTypeId}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label="Welaýat"
            required
            value={form.provinceId}
            onChange={(v) => { set('provinceId', v); set('branchId', '') }}
            options={provinceOptions}
            placeholder="Saýlaň"
            error={errors.provinceId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label="Şahamça"
            required
            value={form.branchId}
            onChange={(v) => set('branchId', v)}
            options={branchOptions}
            disabled={!form.provinceId}
            placeholder="Saýlamak üçin basyň"
            error={errors.branchId}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPersonal({ form, errors, set, citizenshipOptions }: StepContentProps & {
  citizenshipOptions: SelectOption[]
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="text" label="Ady" required
            value={form.firstName} onChange={(v) => set('firstName', v)}
            placeholder="Ady" error={errors.firstName}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Familiýasy" required
            value={form.lastName} onChange={(v) => set('lastName', v)}
            placeholder="Familiýasy" error={errors.lastName}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Atasynyň ady"
            value={form.middleName} onChange={(v) => set('middleName', v)}
            placeholder="Atasynyň ady"
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text" label="Köne familiýaňyz (eger üýtgän bolsa)"
            value={form.formerLastName} onChange={(v) => set('formerLastName', v)}
            placeholder="Köne familiýaňyz"
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="date" label="Doglan güni" required
            value={form.birthDate} onChange={(v) => set('birthDate', v)}
            error={errors.birthDate}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="phone" label="Telefon" required
            value={form.phone} onChange={(v) => set('phone', v)}
            error={errors.phone}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone" label="Telefon goşmaça"
            value={form.phoneExtra} onChange={(v) => set('phoneExtra', v)}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="select" label="Raýatlyk" required
            value={form.citizenship} onChange={(v) => set('citizenship', v)}
            options={citizenshipOptions}
            error={errors.citizenship}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text" label="Ýazgy edilen salgyňyz" required
            value={form.registeredAddress} onChange={(v) => set('registeredAddress', v)}
            placeholder="Ýazgy edilen salgyňyz"
            error={errors.registeredAddress}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Häzirki ýaşaýyş ýeri" required
            value={form.currentAddress} onChange={(v) => set('currentAddress', v)}
            placeholder="Häzirki ýaşaýyş ýeri"
            error={errors.currentAddress}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={1}>
        <BentoCard>
          <FormInput
            type="text" label="Işleýän ýeriňiz we wezipäňiz" required
            value={form.workplace} onChange={(v) => set('workplace', v)}
            placeholder="Işleýän ýeriňiz we wezipäňiz"
            error={errors.workplace}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPassport({ form, errors, set, passportSeriesOptions }: StepContentProps & {
  passportSeriesOptions: SelectOption[]
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="select" label="Pasport seriýasy" required
            value={form.passportSeriesId} onChange={(v) => set('passportSeriesId', v)}
            options={passportSeriesOptions}
            placeholder="Saýlaň"
            error={errors.passportSeriesId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Pasport belgisi" required
            value={form.passportNumber} onChange={(v) => set('passportNumber', v)}
            placeholder="Pasport belgisi"
            error={errors.passportNumber}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="date" label="Pasport berlen senesi" required
            value={form.passportIssueDate} onChange={(v) => set('passportIssueDate', v)}
            error={errors.passportIssueDate}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text" label="Kim tarapyndan berildi" required
            value={form.passportIssuedBy} onChange={(v) => set('passportIssuedBy', v)}
            placeholder="Kim tarapyndan berildi"
            error={errors.passportIssuedBy}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Doglan ýeri (pasport)" required
            value={form.passportBirthPlace} onChange={(v) => set('passportBirthPlace', v)}
            placeholder="Doglan ýeri (pasport)"
            error={errors.passportBirthPlace}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepFiles({
  form, errors, set, mode, initialData,
}: StepContentProps & { mode: 'create' | 'edit'; initialData?: CardOrder }) {
  const existingFiles =
    mode === 'edit' && initialData
      ? [
          { url: initialData.passportFiles.page1,  label: 'Pasport (sahypa 1)'       },
          { url: initialData.passportFiles.page23, label: 'Pasport (2-3-nji sahypa)' },
          { url: initialData.passportFiles.page89, label: 'Pasport (8-9 sahypa)'     },
          { url: initialData.passportFiles.page32, label: 'Pasport (32-nji sahypa)'  },
        ].filter((f): f is { url: string; label: string } => !!f.url)
      : []

  return (
    <div className="space-y-4">
      {existingFiles.length > 0 && (
        <BentoGrid cols={4}>
          {existingFiles.map(({ url, label }) => (
            <BentoCard key={label} title={label}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline truncate block"
              >
                Faýly gör
              </a>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (sahypa 1) (çalyşmak)' : 'Pasport (sahypa 1)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passportPage1}
            onFileChange={(f) => set('passportPage1', f)}
            error={errors.passportPage1}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (2-3-nji sahypa) (çalyşmak)' : 'Pasport (2-3-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passportPage23}
            onFileChange={(f) => set('passportPage23', f)}
            error={errors.passportPage23}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label="Pasport (8-9 sahypa)"
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passportPage89}
            onFileChange={(f) => set('passportPage89', f)}
            error={errors.passportPage89}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label="Pasport (32-nji sahypa)"
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passportPage32}
            onFileChange={(f) => set('passportPage32', f)}
            error={errors.passportPage32}
          />
        </BentoCard>
      </BentoGrid>

      {mode === 'create' && (
        <BentoGrid cols={1}>
          <BentoCard>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${errors.termsAccepted
                  ? 'bg-destructive/10 border border-destructive/30'
                  : 'bg-primary/5 border border-primary/20'
                }`}
              onClick={() => set('termsAccepted', !form.termsAccepted)}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors
                  ${form.termsAccepted
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background'
                  }`}
              >
                {form.termsAccepted && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm font-medium ${errors.termsAccepted ? 'text-destructive' : 'text-primary'}`}
              >
                Şertnama bilen razylaşýaryn (Okamak üçin bas)
              </span>
            </div>
          </BentoCard>
        </BentoGrid>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardOrderForm({
  mode,
  initialData,
  cardOrderId,
  onSuccess,
  onCancel,
}: CardOrderFormProps) {
  const { t } = useTranslation()

  const createMutation = useCreateCardOrder()
  const updateMutation = useUpdateCardOrder(cardOrderId ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const [form, setForm]   = useState<FormState>(() => getInitialState(initialData))
  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )

  useEffect(() => {
    if (initialData) setForm(getInitialState(initialData))
  }, [initialData])

  // ── Lookup data ────────────────────────────────────────────────────────────

  const { data: reasons   = [] } = useCardIssuanceReasons()
  const { data: cardTypes = [] } = useCardTypes()
  const { data: provinces = [] } = useProvinces()
  const { data: branches  = [] } = useBranches(
    form.provinceId ? Number(form.provinceId) : undefined,
  )

  const toOptions = (arr: { id: number; name: string }[]): SelectOption[] =>
    arr.map((x) => ({ value: String(x.id), label: x.name }))

  const statusOptions: SelectOption[] = [
    { value: 'PENDING',  label: t('cardOrder.status.pending',  'Garaşylýar')  },
    { value: 'APPROVED', label: t('cardOrder.status.approved', 'Tassyklandy') },
    { value: 'REJECTED', label: t('cardOrder.status.rejected', 'Ýatyryldy')   },
  ]

  const citizenshipOptions: SelectOption[] = [
    { value: 'Turkmenistan', label: t('citizenship.tm',    'Turkmenistan') },
    { value: 'Russia',       label: t('citizenship.ru',    'Russiýa')      },
    { value: 'Other',        label: t('citizenship.other', 'Beýlekiler')   },
  ]

  const passportSeriesOptions: SelectOption[] = [
    { value: '1', label: 'I'   },
    { value: '2', label: 'II'  },
    { value: '3', label: 'III' },
  ]

  // ── Computed step error state ──────────────────────────────────────────────

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited])

  // ── set helper ─────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const stepProps = useMemo(() => ({ form, errors, set }), [form, errors, set])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]))

  const handleNext = () => {
    markVisited(currentStep)
    const errs = STEPS[currentStep].validate(form, mode)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error(t('validation.fixErrors', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }
    setErrors({})
    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    markVisited(currentStep)
    setErrors({})
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoTo = (i: number) => {
    markVisited(currentStep)
    setErrors({})
    setCurrentStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setVisited(new Set(STEPS.map((_, i) => i)))

    const allErrors: FormErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode))

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      toast.error(t('validation.fixErrors', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    const payload = {
      isPaid:             form.isPaid,
      status:             form.status as CardOrderStatus,
      note:               form.note               || null,
      issuanceReasonId:   Number(form.issuanceReasonId),
      cardTypeId:         Number(form.cardTypeId),
      provinceId:         Number(form.provinceId),
      branchId:           Number(form.branchId),
      firstName:          form.firstName,
      lastName:           form.lastName,
      middleName:         form.middleName         || null,
      formerLastName:     form.formerLastName      || null,
      birthDate:          form.birthDate,
      phone:              form.phone,
      phoneExtra:         form.phoneExtra          || null,
      citizenship:        form.citizenship,
      registeredAddress:  form.registeredAddress,
      currentAddress:     form.currentAddress,
      workplace:          form.workplace,
      passportSeriesId:   Number(form.passportSeriesId),
      passportNumber:     form.passportNumber,
      passportIssueDate:  form.passportIssueDate,
      passportIssuedBy:   form.passportIssuedBy,
      passportBirthPlace: form.passportBirthPlace,
      ...(form.passportPage1  && { passportPage1:  form.passportPage1  }),
      ...(form.passportPage23 && { passportPage23: form.passportPage23 }),
      ...(form.passportPage89 && { passportPage89: form.passportPage89 }),
      ...(form.passportPage32 && { passportPage32: form.passportPage32 }),
    }

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload as CreateCardOrderPayload)
      }
      onSuccess?.()
    } catch {
      // errors handled in hooks via toast
    }
  }

  // ── StepBar items ───────────────────────────────────────────────────────────

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive  = i === currentStep
    const hasErrors = stepsWithErrors.has(i)
    const isDone    = visited.has(i) && !hasErrors
    return {
      id:       s.id,
      title:    t(s.titleKey) || s.titleFallback,
      subtitle: s.subtitle,
      icon:     s.icon,
      status: isActive ? 'active' : hasErrors ? 'error' : isDone ? 'done' : 'idle',
    }
  })

  const isLastStep = currentStep === STEPS.length - 1

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
    

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <StepCard
          {...stepProps}
          statusOptions={statusOptions}
          issuanceReasonOptions={toOptions(reasons)}
          cardTypeOptions={toOptions(cardTypes)}
          provinceOptions={toOptions(provinces)}
          branchOptions={toOptions(branches)}
        />
      )}
      {currentStep === 1 && (
        <StepPersonal {...stepProps} citizenshipOptions={citizenshipOptions} />
      )}
      {currentStep === 2 && (
        <StepPassport {...stepProps} passportSeriesOptions={passportSeriesOptions} />
      )}
      {currentStep === 3 && (
        <StepFiles {...stepProps} mode={mode} initialData={initialData} />
      )}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={currentStep === 0 ? onCancel : undefined}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleSubmit : undefined}
        submitLabel={
          mode === 'create'
            ? (t('cardOrder.submit') || 'Kart sargyt dörediň')
            : (t('common.save')     || 'Ýatda sakla')
        }
        loadingLabel={t('common.saving') || 'Ýüklenilýär...'}
        cancelLabel={t('common.cancel')  || 'Ýatyr'}
        prevLabel={t('common.prev')      || 'Yza'}
        nextLabel={t('common.next')      || 'Indiki'}
      />
    </div>
  )
}
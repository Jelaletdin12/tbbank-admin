import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import {
  User, MapPin, IdCard, CreditCard, Files,
} from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components//stepBarV2'
import type { StepStatus } from '@/components/stepBar'
import type {
  IntlPaymentItem,
  IntlPaymentCreatePayload,
  IntlPaymentStatus,
  CurrencyType,
} from '../api/visaMasterPaymentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntlPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: IntlPaymentItem
  onSubmit: (payload: IntlPaymentCreatePayload) => void
  isSubmitting: boolean
}

type FileKey =
  | 'doc_sberbank_account' | 'doc_school_enrollment' | 'doc_summons'
  | 'doc_passport_tm' | 'doc_foreign_passport' | 'doc_foreign_passport_copy'
  | 'doc_exit_permission' | 'doc_school_foreign_info' | 'doc_school_departure_info'
  | 'upd_doc_passport_tm' | 'upd_doc_foreign_passport' | 'upd_doc_visa'
  | 'upd_doc_acceptance_letter' | 'upd_doc_passport_biometric' | 'upd_doc_passport_old'

interface FormState {
  client_id: string
  status: string
  note: string
  currency_type: string
  province: string
  branch: string
  passport_first_name: string
  passport_last_name: string
  phone: string
  email: string
  home_address: string
  passport_series: string
  passport_number: string
  payer_full_name: string
  payer_account_number: string
  receiver_info: string
  doc_sberbank_account: File | null
  doc_school_enrollment: File | null
  doc_summons: File | null
  doc_passport_tm: File | null
  doc_foreign_passport: File | null
  doc_foreign_passport_copy: File | null
  doc_exit_permission: File | null
  doc_school_foreign_info: File | null
  doc_school_departure_info: File | null
  upd_doc_passport_tm: File | null
  upd_doc_foreign_passport: File | null
  upd_doc_visa: File | null
  upd_doc_acceptance_letter: File | null
  upd_doc_passport_biometric: File | null
  upd_doc_passport_old: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklandy' },
  { value: 'rejected', label: 'Ret edildi' },
]

const CURRENCY_OPTIONS = [
  { value: 'visa',       label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',     label: 'I' },
  { value: 'II',    label: 'II' },
  { value: 'I-MR',  label: 'I-MR' },
  { value: 'II-MR', label: 'II-MR' },
]

const PROVINCE_OPTIONS = [
  { value: 'ashgabat', label: 'Aşgabat' },
  { value: 'ahal',     label: 'Ahal' },
  { value: 'mary',     label: 'Mary' },
  { value: 'dasoguz',  label: 'Daşoguz' },
  { value: 'lebap',    label: 'Lebap' },
  { value: 'balkan',   label: 'Balkan' },
]

const KABUL_DOCS: { key: FileKey; label: string }[] = [
  { key: 'doc_sberbank_account',      label: 'Talypyň SBERBANK kartynyň rekwizitleri' },
  { key: 'doc_school_enrollment',     label: 'Daşary ýurt ÝOM-da okaýandygy barada güwänamasy' },
  { key: 'doc_summons',               label: 'Çagyrylma hatynyn göçürmesi' },
  { key: 'doc_passport_tm',           label: 'TM içki pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'doc_foreign_passport',      label: 'Daşary ýurt pasportynyň göçürmesi' },
  { key: 'doc_foreign_passport_copy', label: 'Bakýan döwlet sahypasynyň göçürmesi' },
  { key: 'doc_exit_permission',       label: 'Çykyş-giriş rugsat bellikli sahypa göçürmesi' },
  { key: 'doc_school_foreign_info',   label: 'ÝOM-dan hat (okuw dilinde)' },
  { key: 'doc_school_departure_info', label: 'ÝOM-dan hat (döwlet dilinde)' },
]

const UPGRAD_DOCS: { key: FileKey; label: string }[] = [
  { key: 'upd_doc_passport_tm',        label: 'TM içki pasportynyň asyl görnüşi (upd)' },
  { key: 'upd_doc_foreign_passport',   label: 'Daşary ýurt pasportynyň göçürmesi (upd)' },
  { key: 'upd_doc_visa',               label: 'Wiza bellenen sahypasynyň göçürmesi' },
  { key: 'upd_doc_acceptance_letter',  label: 'Kabul haty we beýleki resminamalar' },
  { key: 'upd_doc_passport_biometric', label: 'Täze (2015+) pasport seriýasy maglumatlary' },
  { key: 'upd_doc_passport_old',       label: 'Könelräk pasport seriýasy maglumatlary' },
]

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId = 'general' | 'location' | 'personal' | 'payment' | 'docs'

interface Step {
  id: StepId
  titleKey: string
  titleFallback: string
  subtitleKey: string
  subtitleFallback: string
}

const STEPS: Step[] = [
  { id: 'general',  titleKey: 'intlPaymentForm.steps.general.title',  titleFallback: 'Esasy',      subtitleKey: 'intlPaymentForm.steps.general.subtitle',  subtitleFallback: 'Status, müşderi'      },
  { id: 'location', titleKey: 'intlPaymentForm.steps.location.title',  titleFallback: 'Lokasiýa',   subtitleKey: 'intlPaymentForm.steps.location.subtitle', subtitleFallback: 'Welaýat, şahamça'     },
  { id: 'personal', titleKey: 'intlPaymentForm.steps.personal.title', titleFallback: 'Şahsy',      subtitleKey: 'intlPaymentForm.steps.personal.subtitle', subtitleFallback: 'Pasport, kontakt'     },
  { id: 'payment',  titleKey: 'intlPaymentForm.steps.payment.title',  titleFallback: 'Töleg',      subtitleKey: 'intlPaymentForm.steps.payment.subtitle',  subtitleFallback: 'Töleýji, kabul ediji' },
  { id: 'docs',     titleKey: 'intlPaymentForm.steps.docs.title',     titleFallback: 'Resminamalar', subtitleKey: 'intlPaymentForm.steps.docs.subtitle',    subtitleFallback: '15 resminama'       },
]

// Per-step required fields for incremental validation
const STEP_REQUIRED_FIELDS: Partial<Record<StepId, (keyof FormState)[]>> = {
  general:  ['client_id', 'status', 'currency_type'],
  location: ['province', 'branch'],
  personal: ['passport_first_name', 'passport_last_name', 'phone'],
  payment:  ['passport_series', 'passport_number', 'payer_full_name', 'payer_account_number', 'receiver_info'],
}

const STEP_ERROR_LABELS: Partial<Record<keyof FormState, string>> = {
  client_id:            'validation.required',
  status:               'validation.required',
  currency_type:        'validation.required',
  province:             'validation.required',
  branch:               'validation.required',
  passport_first_name:  'validation.required',
  passport_last_name:   'validation.required',
  phone:                'validation.required',
  passport_series:      'validation.required',
  passport_number:      'validation.required',
  payer_full_name:      'validation.required',
  payer_account_number: 'validation.required',
  receiver_info:        'validation.required',
}

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: FormState = {
  client_id: '', status: 'pending', note: '',
  currency_type: '', province: '', branch: '',
  passport_first_name: '', passport_last_name: '',
  phone: '', email: '', home_address: '',
  passport_series: '', passport_number: '',
  payer_full_name: '', payer_account_number: '',
  receiver_info: '',
  doc_sberbank_account: null, doc_school_enrollment: null,
  doc_summons: null, doc_passport_tm: null,
  doc_foreign_passport: null, doc_foreign_passport_copy: null,
  doc_exit_permission: null, doc_school_foreign_info: null,
  doc_school_departure_info: null,
  upd_doc_passport_tm: null, upd_doc_foreign_passport: null,
  upd_doc_visa: null, upd_doc_acceptance_letter: null,
  upd_doc_passport_biometric: null, upd_doc_passport_old: null,
}

// ─── Full validation (final submit) ──────────────────────────────────────────

function validateAll(form: FormState): FormErrors {
  const errors: FormErrors = {}
  Object.entries(STEP_ERROR_LABELS).forEach(([key, msg]) => {
    if (!form[key as keyof FormState]) errors[key as keyof FormState] = msg
  })
  return errors
}

function validateStep(form: FormState, stepId: StepId): FormErrors {
  const fields = STEP_REQUIRED_FIELDS[stepId] ?? []
  const errors: FormErrors = {}
  fields.forEach((f) => {
    if (!form[f]) errors[f] = STEP_ERROR_LABELS[f] ?? 'Hökmany'
  })
  return errors
}

// ─── Bento layout primitive ───────────────────────────────────────────────────

function BentoGrid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3
  children: React.ReactNode
}) {
  const colClass = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' }[cols]
  return (
    <div className={`grid ${colClass} gap-4`}>
      {children}
    </div>
  )
}

function BentoCard({
  title,
  children,
  span,
}: {
  title?: string
  children: React.ReactNode
  span?: 'full'
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 space-y-4${span === 'full' ? ' sm:col-span-2' : ''}`}
    >
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Step content panels ──────────────────────────────────────────────────────

function StepGeneral({
  form, errors, set, t,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  t: TFunction
}) {
  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg

  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('intlPaymentForm.titles.general.client') || 'Müşderi'}>
        <FormInput
          type="searchable-select"
          label={t('User') || 'Ulanyjy'}
          value={form.client_id}
          onChange={(v) => set('client_id', v)}
          options={[]}
          placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
          error={errMsg(errors.client_id)}
          required
        />
      </BentoCard>

      <BentoCard title={t('loanOrderForm.labels.status') || 'Status'}>
        <FormInput
          type="select"
          label={t('loanOrderForm.labels.status') || 'Status'}
          value={form.status}
          onChange={(v) => set('status', v)}
          options={STATUS_OPTIONS}
          error={errMsg(errors.status)}
          required
        />
      </BentoCard>

      <BentoCard title={t('Card type') || 'Kart görnüşi'} span="full">
        <FormInput
          type="select"
          label={t('Application type') || 'Ýüztumanyň görnüşi'}
          value={form.currency_type}
          onChange={(v) => set('currency_type', v)}
          options={CURRENCY_OPTIONS}
          error={errMsg(errors.currency_type)}
          required
        />
      </BentoCard>

      <BentoCard title={t('Note') || 'Bellik'} span="full">
        <FormInput
          type="textarea"
          label={t('Note') || 'Bellik'}
          value={form.note}
          onChange={(v) => set('note', v)}
          placeholder={t('loanOrderForm.placeholders.note') || 'Bellik...'}
          rows={2}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepLocation({
  form, errors, set, t,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  t: TFunction
}) {
  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg

  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('Region') || 'Welaýat'}>
        <FormInput
          type="searchable-select"
          label={t('Region') || 'Welaýat'}
          value={form.province}
          onChange={(v) => { set('province', v); set('branch', '') }}
          options={PROVINCE_OPTIONS}
          error={errMsg(errors.province)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t('intlPaymentForm.hints.selectRegion') || 'Welaýaty saýlasaňyz şahamçalar güncellenar.'}
        </p>
      </BentoCard>

      <BentoCard title={t('Branch') || 'Şahamça'}>
        <FormInput
          type="searchable-select"
          label={t('Branch') || 'Şahamça'}
          value={form.branch}
          onChange={(v) => set('branch', v)}
          options={[]}
          placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
          error={errMsg(errors.branch)}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPersonal({
  form, errors, set, t,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  t: TFunction
}) {
  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg

  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('intlPaymentForm.titles.personal.name') || 'At-familýa'}>
        <FormInput
          type="text"
          label={t('Passport surname') || 'Pasportdaky familiýa'}
          value={form.passport_last_name}
          onChange={(v) => set('passport_last_name', v)}
          placeholder="NURYYEW"
          error={errMsg(errors.passport_last_name)}
          required
        />
        <FormInput
          type="text"
          label={t('Passport name') || 'Pasportdaky ady'}
          value={form.passport_first_name}
          onChange={(v) => set('passport_first_name', v)}
          placeholder="HAÝDAR"
          error={errMsg(errors.passport_first_name)}
          required
        />
      </BentoCard>

      <BentoCard title={t('Contact data') || 'Kontakt'}>
        <FormInput
          type="phone"
          label={t('Phone') || 'Telefon'}
          value={form.phone}
          onChange={(v) => set('phone', v)}
          error={errMsg(errors.phone)}
          required
        />
        <FormInput
          type="email"
          label={t('Email') || 'E-poçta'}
          value={form.email}
          onChange={(v) => set('email', v)}
          placeholder="email@example.com"
        />
      </BentoCard>

      <BentoCard title={t('Current Residence') || 'Häzirki ýaşaýyş ýeri'} span="full">
        <FormInput
          type="text"
          label={t('Current Residence') || 'Häzirki ýaşaýyş ýeri'}
          value={form.home_address}
          onChange={(v) => set('home_address', v)}
          placeholder={t('intlPaymentForm.placeholders.address') || 'Köçe, jaý belgisi...'}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPayment({
  form, errors, set, t,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  t: TFunction
}) {
  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg

  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('Passport') || 'Pasport maglumatlary'}>
        <FormInput
          type="select"
          label={t('Passport serie') || 'Pasport seriýasy'}
          value={form.passport_series}
          onChange={(v) => set('passport_series', v)}
          options={PASSPORT_SERIES_OPTIONS}
          error={errMsg(errors.passport_series)}
          required
        />
        <FormInput
          type="text"
          label={t('Passport id') || 'Pasport belgisi'}
          value={form.passport_number}
          onChange={(v) => set('passport_number', v)}
          placeholder="A123456"
          error={errMsg(errors.passport_number)}
          required
        />
      </BentoCard>

      <BentoCard title={t('intlPaymentForm.titles.payment.payer') || 'Töleýji'}>
        <FormInput
          type="text"
          label={t('intlPaymentForm.labels.payerFullName') || 'Ady Familiýasy Atasynyň ady'}
          value={form.payer_full_name}
          onChange={(v) => set('payer_full_name', v)}
          placeholder={t('intlPaymentForm.placeholders.payerFullName') || 'Doly ady...'}
          error={errMsg(errors.payer_full_name)}
          required
        />
        <FormInput
          type="text"
          label={t('intlPaymentForm.labels.payerAccount') || 'Goşun hasaby'}
          value={form.payer_account_number}
          onChange={(v) => set('payer_account_number', v)}
          placeholder={t('intlPaymentForm.placeholders.payerAccount') || '1234 5678 ...'}
          error={errMsg(errors.payer_account_number)}
          required
        />
      </BentoCard>

      <BentoCard title={t('Payee information') || 'Kabul edijiniň maglumatlary'} span="full">
        <FormInput
          type="textarea"
          label={t('intlPaymentForm.labels.receiverInfo') || 'Töleg kabul edijiniň maglumatlary'}
          value={form.receiver_info}
          onChange={(v) => set('receiver_info', v)}
          placeholder={t('intlPaymentForm.placeholders.receiverInfo') || 'Kabul ediji bank, hasap, Swift...'}
          rows={3}
          error={errMsg(errors.receiver_info)}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepDocs({
  form, set, t,
}: {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  t: TFunction
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('intlPaymentForm.titles.docs.kabul') || 'Kabul ediji talyp — 9 resminama'}>
        <div className="space-y-3">
          {KABUL_DOCS.map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f)}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </BentoCard>

      <BentoCard title={t('intlPaymentForm.titles.docs.upgrad') || 'Upgradyý — 6 resminama'}>
        <div className="space-y-3">
          {UPGRAD_DOCS.map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f)}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </BentoCard>
    </BentoGrid>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IntlPaymentForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: IntlPaymentFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    STEPS.map((_, i) => (i === 0 ? 'active' : 'idle')),
  )

  // ── Populate in edit mode ──
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        client_id:            initialData.client_id,
        status:               initialData.status,
        note:                 initialData.note ?? '',
        currency_type:        initialData.currency_type,
        province:             initialData.province,
        branch:               initialData.branch,
        passport_first_name:  initialData.passport_first_name,
        passport_last_name:   initialData.passport_last_name,
        phone:                initialData.phone,
        email:                initialData.email ?? '',
        home_address:         initialData.home_address ?? '',
        passport_series:      initialData.passport_series,
        passport_number:      initialData.passport_number,
        payer_full_name:      initialData.payer_full_name,
        payer_account_number: initialData.payer_account_number,
        receiver_info:        initialData.receiver_info,
        doc_sberbank_account: null, doc_school_enrollment: null,
        doc_summons: null, doc_passport_tm: null,
        doc_foreign_passport: null, doc_foreign_passport_copy: null,
        doc_exit_permission: null, doc_school_foreign_info: null,
        doc_school_departure_info: null,
        upd_doc_passport_tm: null, upd_doc_foreign_passport: null,
        upd_doc_visa: null, upd_doc_acceptance_letter: null,
        upd_doc_passport_biometric: null, upd_doc_passport_old: null,
      })
      // Mark all non-doc steps done in edit mode so the user can jump freely
      setStepStatuses(STEPS.map((_, i) => (i === 0 ? 'active' : i < 4 ? 'done' : 'idle')))
    }
  }, [mode, initialData])

  // ── Field setter ──
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Step navigation ──
  const goStep = (idx: number) => {
    if (idx < 0 || idx >= STEPS.length) return
    setStepStatuses((prev) => {
      const next = [...prev]
      // going forward: mark current done
      if (idx > currentStep) next[currentStep] = 'done'
      next[idx] = 'active'
      // going back: reset steps after target to idle (only those not yet done)
      if (idx < currentStep) {
        for (let i = idx + 1; i <= currentStep; i++) {
          if (next[i] !== 'done') next[i] = 'idle'
        }
      }
      return next
    })
    setErrors({})
    setCurrentStep(idx)
  }

  const handleNext = () => {
    const stepId = STEPS[currentStep].id
    const stepErrors = validateStep(form, stepId)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      toast.error(t('common.errors.fillRequiredCorrectly', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      setStepStatuses((prev) => {
        const next = [...prev]
        next[currentStep] = 'error'
        return next
      })
      return
    }
    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      goStep(currentStep + 1)
    }
  }

  const handleSubmit = () => {
    const allErrors = validateAll(form)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      toast.error(t('common.errors.requiredFieldsMissing', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      return
    }
    onSubmit({
      ...form,
      status:        form.status as IntlPaymentStatus,
      currency_type: form.currency_type as CurrencyType,
    })
  }

  // ── StepBarCards data ──
  const stepCardItems: StepCardItem[] = STEPS.map((s, i) => ({
    id:       s.id,
    title:    t(s.titleKey) || s.titleFallback,
    subtitle: t(s.subtitleKey) || s.subtitleFallback,
    status:   stepStatuses[i],
    icon:     [User, MapPin, IdCard, CreditCard, Files][i],
  }))

  const isLastStep = currentStep === STEPS.length - 1

  const title = mode === 'create'
    ? t('intlPayment.createTitle', 'Visa/Master tölegler (talyplar üçin) dörediň')
    : t('intlPayment.editTitle',   'Visa/Master tölegler (talyplar üçin) redaktirläň')

  const submitLabel = isLastStep
    ? (mode === 'create'
        ? t('intlPayment.createBtn', 'Dörediň')
        : t('intlPayment.editBtn',   'Redaktirläň'))
    : undefined // not used on non-last steps

  return (
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      {/* ── Step bar ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards
          steps={stepCardItems}
          onGoTo={(i) => {
            // Allow jumping only to done/active steps
            if (stepStatuses[i] !== 'idle') goStep(i)
          }}
        />
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      {STEPS[currentStep].id === 'general'  && <StepGeneral  form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === 'location' && <StepLocation form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === 'personal' && <StepPersonal form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === 'payment'  && <StepPayment  form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === 'docs'     && <StepDocs     form={form} set={set} t={t} />}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <FormActions
        isPending={isSubmitting}
        onCancel={() => navigate('/intl-payments/visa-master')}
        onPrev={currentStep > 0 ? () => goStep(currentStep - 1) : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleNext : undefined}
        submitLabel={submitLabel}
      />
    </div>
  )
}
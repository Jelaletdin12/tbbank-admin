import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  User, MapPin, IdCard, CreditCard, Files,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import { BentoGrid, BentoCard } from '@/components/bento'
import type { IntlPaymentItem, IntlPaymentCreatePayload } from '../api/visaMasterPaymentsApi'
import { useCreateIntlPayment, useUpdateIntlPayment } from '../hooks/useVisaMasterPayments'
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/visaMasterPayment.schema'
import type { IntlPaymentFormData } from '../schemas/visaMasterPayment.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntlPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: IntlPaymentItem
}

type FlatErrors = Partial<Record<keyof IntlPaymentFormData, string>>

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

const KABUL_DOCS: { key: keyof IntlPaymentFormData; label: string }[] = [
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

const UPGRAD_DOCS: { key: keyof IntlPaymentFormData; label: string }[] = [
  { key: 'upd_doc_passport_tm',        label: 'TM içki pasportynyň asyl görnüşi (upd)' },
  { key: 'upd_doc_foreign_passport',   label: 'Daşary ýurt pasportynyň göçürmesi (upd)' },
  { key: 'upd_doc_visa',               label: 'Wiza bellenen sahypasynyň göçürmesi' },
  { key: 'upd_doc_acceptance_letter',  label: 'Kabul haty we beýleki resminamalar' },
  { key: 'upd_doc_passport_biometric', label: 'Täze (2015+) pasport seriýasy maglumatlary' },
  { key: 'upd_doc_passport_old',       label: 'Könelräk pasport seriýasy maglumatlary' },
]

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId = 'general' | 'location' | 'personal' | 'payment' | 'docs'

interface StepDef {
  id: StepId
  titleKey: string
  titleFallback: string
  subtitleKey: string
  subtitleFallback: string
  icon: LucideIcon
  validate: (form: IntlPaymentFormData, mode: 'create' | 'edit') => FlatErrors
}

const STEPS: StepDef[] = [
  { id: 'general',  titleKey: 'intlPaymentForm.steps.general.title',  titleFallback: 'Esasy',      subtitleKey: 'intlPaymentForm.steps.general.subtitle',  subtitleFallback: 'Status, müşderi',      icon: User,       validate: (f, m) => validateStep(0, f, m) },
  { id: 'location', titleKey: 'intlPaymentForm.steps.location.title',  titleFallback: 'Lokasiýa',   subtitleKey: 'intlPaymentForm.steps.location.subtitle', subtitleFallback: 'Welaýat, şahamça',     icon: MapPin,     validate: (f, m) => validateStep(1, f, m) },
  { id: 'personal', titleKey: 'intlPaymentForm.steps.personal.title', titleFallback: 'Şahsy',      subtitleKey: 'intlPaymentForm.steps.personal.subtitle', subtitleFallback: 'Pasport, kontakt',     icon: IdCard,     validate: (f, m) => validateStep(2, f, m) },
  { id: 'payment',  titleKey: 'intlPaymentForm.steps.payment.title',  titleFallback: 'Töleg',      subtitleKey: 'intlPaymentForm.steps.payment.subtitle',  subtitleFallback: 'Töleýji, kabul ediji', icon: CreditCard, validate: (f, m) => validateStep(3, f, m) },
  { id: 'docs',     titleKey: 'intlPaymentForm.steps.docs.title',     titleFallback: 'Resminamalar', subtitleKey: 'intlPaymentForm.steps.docs.subtitle',    subtitleFallback: '15 resminama',        icon: Files,      validate: () => ({}) },
]

// ─── Form errors helper ──────────────────────────────────────────────────────

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof IntlPaymentFormData] = msg
  }
  return result
}

// ─── Step content components ──────────────────────────────────────────────────

interface StepContentProps {
  form: IntlPaymentFormData
  errors: FlatErrors
  set: <K extends keyof IntlPaymentFormData>(k: K, v: IntlPaymentFormData[K]) => void
  t: TFunction
}

function StepGeneral({ form, errors, set, t }: StepContentProps) {
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
          error={errors.client_id}
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
          error={errors.status}
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
          error={errors.currency_type}
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

function StepLocation({ form, errors, set, t }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('Region') || 'Welaýat'}>
        <FormInput
          type="searchable-select"
          label={t('Region') || 'Welaýat'}
          value={form.province}
          onChange={(v) => { set('province', v); set('branch', '') }}
          options={PROVINCE_OPTIONS}
          error={errors.province}
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
          error={errors.branch}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPersonal({ form, errors, set, t }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('intlPaymentForm.titles.personal.name') || 'At-familýa'}>
        <FormInput
          type="text"
          label={t('Passport surname') || 'Pasportdaky familiýa'}
          value={form.passport_last_name}
          onChange={(v) => set('passport_last_name', v)}
          placeholder="NURYYEW"
          error={errors.passport_last_name}
          required
        />
        <FormInput
          type="text"
          label={t('Passport name') || 'Pasportdaky ady'}
          value={form.passport_first_name}
          onChange={(v) => set('passport_first_name', v)}
          placeholder="HAÝDAR"
          error={errors.passport_first_name}
          required
        />
      </BentoCard>

      <BentoCard title={t('Contact data') || 'Kontakt'}>
        <FormInput
          type="phone"
          label={t('Phone') || 'Telefon'}
          value={form.phone}
          onChange={(v) => set('phone', v)}
          error={errors.phone}
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

function StepPayment({ form, errors, set, t }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('Passport') || 'Pasport maglumatlary'}>
        <FormInput
          type="select"
          label={t('Passport serie') || 'Pasport seriýasy'}
          value={form.passport_series}
          onChange={(v) => set('passport_series', v)}
          options={PASSPORT_SERIES_OPTIONS}
          error={errors.passport_series}
          required
        />
        <FormInput
          type="text"
          label={t('Passport id') || 'Pasport belgisi'}
          value={form.passport_number}
          onChange={(v) => set('passport_number', v)}
          placeholder="A123456"
          error={errors.passport_number}
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
          error={errors.payer_full_name}
          required
        />
        <FormInput
          type="text"
          label={t('intlPaymentForm.labels.payerAccount') || 'Goşun hasaby'}
          value={form.payer_account_number}
          onChange={(v) => set('payer_account_number', v)}
          placeholder={t('intlPaymentForm.placeholders.payerAccount') || '1234 5678 ...'}
          error={errors.payer_account_number}
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
          error={errors.receiver_info}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepDocs({ form, set, t }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('intlPaymentForm.titles.docs.kabul') || 'Kabul ediji talyp — 9 resminama'}>
        <div className="space-y-3">
          {KABUL_DOCS.map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f as IntlPaymentFormData[typeof key])}
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
              onFileChange={(f) => set(key, f as IntlPaymentFormData[typeof key])}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </BentoCard>
    </BentoGrid>
  )
}

// ─── Initial data mapper ──────────────────────────────────────────────────────

function mapInitial(data: IntlPaymentItem): Partial<IntlPaymentFormData> {
  return {
    client_id:            data.client_id,
    status:               data.status,
    note:                 data.note ?? '',
    currency_type:        data.currency_type,
    province:             data.province,
    branch:               data.branch,
    passport_first_name:  data.passport_first_name,
    passport_last_name:   data.passport_last_name,
    phone:                data.phone,
    email:                data.email ?? '',
    home_address:         data.home_address ?? '',
    passport_series:      data.passport_series,
    passport_number:      data.passport_number,
    payer_full_name:      data.payer_full_name,
    payer_account_number: data.payer_account_number,
    receiver_info:        data.receiver_info,
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IntlPaymentForm({ mode, initialData }: IntlPaymentFormProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateIntlPayment()
  const updateMutation = useUpdateIntlPayment(initialData?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, setError,
  } = useForm<IntlPaymentFormData>({
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set())

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited, i18n.language])

  const set = useCallback(<K extends keyof IntlPaymentFormData>(key: K, value: IntlPaymentFormData[K]) => {
    (setValue as (name: K, val: IntlPaymentFormData[K]) => void)(key, value)
    clearErrors(key)
  }, [setValue, clearErrors])

  const allSubmittedErrors = useMemo(() => {
    const result: FlatErrors = {}
    for (const stepIdx of submittedSteps) {
      Object.assign(result, STEPS[stepIdx].validate(form, mode))
    }
    return result
  }, [form, mode, submittedSteps, i18n.language])

  const errors = useMemo(() => {
    const fromRHF = flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>)
    return { ...fromRHF, ...allSubmittedErrors }
  }, [rhfErrors, allSubmittedErrors])

  const stepProps = useMemo(() => ({ form, errors, set, t }), [form, errors, set, t])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]))

  const markSubmitted = (i: number) =>
    setSubmittedSteps((prev) => new Set([...prev, i]))

  const handleNext = () => {
    markVisited(currentStep)
    markSubmitted(currentStep)
    const errs = STEPS[currentStep].validate(form, mode)
    if (Object.keys(errs).length > 0) {
      Object.entries(errs).forEach(([key, msg]) => {
        setError(key as keyof IntlPaymentFormData, { type: 'manual', message: msg })
      })
      toast.error(t('common.errors.fillRequiredCorrectly', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      markVisited(currentStep)
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGoTo = (i: number) => {
    markVisited(currentStep)
    setCurrentStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const doSubmit = () => {
    setVisited(new Set(STEPS.map((_, i) => i)))
    setSubmittedSteps(new Set(STEPS.map((_, i) => i)))

    const allErrors: FlatErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode))

    if (Object.keys(allErrors).length > 0) {
      Object.entries(allErrors).forEach(([key, msg]) => {
        setError(key as keyof IntlPaymentFormData, { type: 'manual', message: msg })
      })
      toast.error(t('common.errors.requiredFieldsMissing', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i); break
        }
      }
      return
    }

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      createMutation.mutate(payload as IntlPaymentCreatePayload, {
        onSuccess: (data) => navigate(`/intl-payments/visa-master/${data.id}`),
      })
    } else if (initialData) {
      updateMutation.mutate(payload as IntlPaymentCreatePayload, {
        onSuccess: () => navigate(`/intl-payments/visa-master/${initialData.id}`),
      })
    }
  }

  // ── StepBar items ──────────────────────────────────────────────────────────

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive  = i === currentStep
    const hasErrors = stepsWithErrors.has(i)
    const isDone    = visited.has(i) && !hasErrors
    return {
      id:       s.id,
      title:    t(s.titleKey) || s.titleFallback,
      subtitle: t(s.subtitleKey) || s.subtitleFallback,
      icon:     s.icon,
      status: isActive ? 'active' : hasErrors ? 'error' : isDone ? 'done' : 'idle',
    }
  })

  const isLastStep = currentStep === STEPS.length - 1

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {mode === 'create'
          ? t('intlPayment.createTitle', 'Visa/Master tölegler (talyplar üçin) dörediň')
          : t('intlPayment.editTitle', 'Visa/Master tölegler (talyplar üçin) redaktirläň')}
      </h1>

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {STEPS[currentStep].id === 'general'  && <StepGeneral  {...stepProps} />}
      {STEPS[currentStep].id === 'location' && <StepLocation {...stepProps} />}
      {STEPS[currentStep].id === 'personal' && <StepPersonal {...stepProps} />}
      {STEPS[currentStep].id === 'payment'  && <StepPayment  {...stepProps} />}
      {STEPS[currentStep].id === 'docs'     && <StepDocs     {...stepProps} />}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={() => navigate('/intl-payments/visa-master')}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? doSubmit : undefined}
        submitLabel={
          mode === 'create'
            ? t('intlPayment.createBtn', 'Dörediň')
            : t('intlPayment.editBtn', 'Redaktirläň')
        }
      />
    </div>
  )
}

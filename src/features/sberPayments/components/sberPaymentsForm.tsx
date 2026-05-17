import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { User, MapPin, IdCard, CreditCard, Files } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import type { StepStatus } from '@/components/stepBar'
import {
  useCreateSberPayment,
  useUpdateSberPayment,
} from '@/features/sberPayments/hooks/useSberPayments'
import {
  WELAYATLAR,
  SAHAMCALAR,
  STATUSES,
  type SberPaymentOrder,
  type PaymentStatus,
} from '@/features/sberPayments/api/sberPaymentsApi'
import {
  validateStep,
  DEFAULT_FORM_VALUES,
  buildPayload,
  type SberPaymentFormData,
} from '@/features/sberPayments/schemas/sberPayment.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SberPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: SberPaymentOrder | null
  orderId?: string
}

type FlatErrors = Partial<Record<keyof SberPaymentFormData, string>>

// ─── Flatten RHF errors ──────────────────────────────────────────────────────

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof SberPaymentFormData] = msg
  }
  return result
}

// ─── Document lists ───────────────────────────────────────────────────────────

type AcceptedDocKey =
  | 'acc_sberbank_card' | 'acc_enrollment' | 'acc_summons'
  | 'acc_passport_tm' | 'acc_zagran_passport' | 'acc_visa_page'
  | 'acc_entry_stamp' | 'acc_school_letter'

type SentDocKey =
  | 'snt_passport_tm' | 'snt_zagran_passport' | 'snt_entry_stamp'
  | 'snt_relation_doc' | 'snt_new_passport_series' | 'snt_old_passport_series'

const ACCEPTED_DOCS = (t: (key: string, fallback?: string) => string): { key: AcceptedDocKey; label: string }[] => [
  { key: 'acc_sberbank_card',    label: t('sberPayments.documents.sberbankCard',    'Talýba degişli SBERBANK kartynyň rekwizitleri') },
  { key: 'acc_enrollment',       label: t('sberPayments.documents.enrollment',       'Daşary ýurt ÝOM-da okaýandygy baradaky güwänamasy') },
  { key: 'acc_summons',          label: t('sberPayments.documents.summons',          'Çagyrylma hatynyn göçürmesi') },
  { key: 'acc_passport_tm',      label: t('sberPayments.documents.passportTm',       'TM içki pasportynyň asyl görnüşi we göçürmesi') },
  { key: 'acc_zagran_passport',  label: t('sberPayments.documents.zagranPassport',  'Daşary ýurt (zagran) pasportynyň göçürmesi') },
  { key: 'acc_visa_page',        label: t('sberPayments.documents.visaPage',        'Daşary ýurda rugsat (wizasy) bellenen sahypasynyň göçürmesi') },
  { key: 'acc_entry_stamp',      label: t('sberPayments.documents.entryStamp',      'Daşary ýurt döwletine girenliği baradaky ştamply sahypasynyň göçürmesi') },
  { key: 'acc_school_letter',    label: t('sberPayments.documents.schoolLetter',    'ÝOM-dan hat (daşary ýurt dilinde maglumatly)') },
]

const SENT_DOCS = (t: (key: string, fallback?: string) => string): { key: SentDocKey; label: string }[] => [
  { key: 'snt_passport_tm',         label: t('sberPayments.documents.sentPassportTm',       'Ugradyjynyň TM içki pasportynyň asyl görnüşi we göçürmesi') },
  { key: 'snt_zagran_passport',      label: t('sberPayments.documents.sentZagranPassport',   'Ugradyjynyň daşary ýurt pasportynyň asyl görnüşi we göçürmesi') },
  { key: 'snt_entry_stamp',         label: t('sberPayments.documents.sentEntryStamp',      'Ugradyjynyň daşary döwletine girenliği ştamply sahypasynyň göçürmesi') },
  { key: 'snt_relation_doc',        label: t('sberPayments.documents.sentRelationDoc',     'Ugradyjy we kabul edijiniň garyndaşlyk tassyklaýjy resminamasynyn göçürmesi') },
  { key: 'snt_new_passport_series', label: t('sberPayments.documents.sentNewPassportSeries', 'Ugradyjy/kabul ediji täze (2015+) pasport seriýasy maglumaty') },
  { key: 'snt_old_passport_series', label: t('sberPayments.documents.sentOldPassportSeries', 'Ugradyjy/kabul ediji köne pasport seriýasy baradaky güwänamasy') },
]


// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({ cols = 2, children }: { cols?: 1 | 2; children: React.ReactNode }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {children}
    </div>
  )
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full'
  children: React.ReactNode
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 space-y-4${
        span === 'full' ? ' sm:col-span-2' : ''
      }`}
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

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepGeneral({
  form, errors, set, t,
}: {
  form: SberPaymentFormData
  errors: FlatErrors
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void
  t: (key: string, fallback?: string) => string
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('sberPayments.cards.musteri', 'Müşderi')}>
        <FormInput
          type="searchable-select"
          label={t('sberPayments.fields.client_id', 'Ulanyjy')}
          value={form.client_id}
          onChange={(v) => set('client_id', v)}
          options={[]}
          placeholder={t('sberPayments.placeholders.select', 'Saýlamak üçin basyň')}
          required
        />
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.status', 'Status')}>
        <FormInput
          type="select"
          label={t('sberPayments.fields.status', 'Status')}
          value={form.status}
          onChange={(v) => set('status', v as PaymentStatus)}
          options={STATUSES}
          error={errors.status}
          required
        />
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.bellik', 'Bellik')} span="full">
        <FormInput
          type="textarea"
          label={t('sberPayments.fields.bellik', 'Bellik')}
          value={form.bellik}
          onChange={(v) => set('bellik', v)}
          placeholder={t('sberPayments.placeholders.bellik', 'Bellik...')}
          rows={2}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepLocation({
  form, errors, set, t,
}: {
  form: SberPaymentFormData
  errors: FlatErrors
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void
  t: (key: string, fallback?: string) => string
}) {
  const branches = form.welayat ? (SAHAMCALAR[form.welayat] ?? []) : []

  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('sberPayments.cards.welayat', 'Welaýat')}>
        <FormInput
          type="select"
          label={t('sberPayments.fields.welayat', 'Welaýat')}
          value={form.welayat}
          onChange={(v) => { set('welayat', v); set('sahamca', '') }}
          options={WELAYATLAR.map((w) => ({ value: w, label: w }))}
          placeholder={t('sberPayments.placeholders.welayat', 'Aşgabat')}
          error={errors.welayat}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t('sberPayments.hints.selectRegion', 'Welaýaty saýlasaňyz şahamçalar güncellenar.')}
        </p>
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.sahamca', 'Şahamça')}>
        <FormInput
          type="searchable-select"
          label={t('sberPayments.fields.sahamca', 'Şahamça')}
          value={form.sahamca}
          onChange={(v) => set('sahamca', v)}
          options={branches.map((b) => ({ value: b, label: b }))}
          placeholder={t('sberPayments.placeholders.select', 'Saýlamak üçin basyň')}
          disabled={!form.welayat}
          error={errors.sahamca}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPersonal({
  form, errors, set, t,
}: {
  form: SberPaymentFormData
  errors: FlatErrors
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void
  t: (key: string, fallback?: string) => string
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('sberPayments.cards.atFamilia', 'At-familýa')}>
        <FormInput
          type="text"
          label={t('sberPayments.fields.lastName', 'Pasportdaky familiýa')}
          value={form.lastName}
          onChange={(v) => set('lastName', v)}
          placeholder={t('sberPayments.placeholders.lastName', 'NURYYEW')}
          error={errors.lastName}
          required
        />
        <FormInput
          type="text"
          label={t('sberPayments.fields.firstName', 'Pasportdaky ady')}
          value={form.firstName}
          onChange={(v) => set('firstName', v)}
          placeholder={t('sberPayments.placeholders.firstName', 'HAÝDAR')}
          error={errors.firstName}
          required
        />
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.kontakt', 'Kontakt')}>
        <FormInput
          type="phone"
          label={t('sberPayments.fields.phone', 'Telefon')}
          value={form.phone}
          onChange={(v) => set('phone', v)}
          error={errors.phone}
          required
        />
        <FormInput
          type="email"
          label={t('sberPayments.fields.email', 'E-poçta')}
          value={form.email}
          onChange={(v) => set('email', v)}
          placeholder={t('sberPayments.placeholders.email', 'email@example.com')}
        />
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.yasysYeri', 'Häzirki ýaşyş ýeri')} span="full">
        <FormInput
          type="text"
          label={t('sberPayments.fields.address', 'Salgy')}
          value={form.address}
          onChange={(v) => set('address', v)}
          placeholder={t('sberPayments.placeholders.address', 'Köçe, jaý belgisi...')}
          error={errors.address}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPayment({
  form, errors, set, t,
}: {
  form: SberPaymentFormData
  errors: FlatErrors
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void
  t: (key: string, fallback?: string) => string
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('sberPayments.cards.pasportMaglumatlary', 'Pasport maglumatlary')}>
        <FormInput
          type="searchable-select"
          label={t('sberPayments.fields.passportSeries', 'Pasport seriýasy')}
          value={form.passportSeries}
          onChange={(v) => set('passportSeries', v)}
          options={[
            { value: 'II-MA', label: 'II-MA' },
            { value: 'II-MB', label: 'II-MB' },
            { value: 'II-MC', label: 'II-MC' },
            { value: 'II-MD', label: 'II-MD' },
          ]}
          placeholder={t('sberPayments.placeholders.select', 'Saýlamak üçin basyň')}
          error={errors.passportSeries}
          required
        />
        <FormInput
          type="text"
          label={t('sberPayments.fields.passportNumber', 'Pasport nomeri')}
          value={form.passportNumber}
          onChange={(v) => set('passportNumber', v)}
          placeholder={t('sberPayments.placeholders.passportNumber', 'A123456')}
          error={errors.passportNumber}
          required
        />
      </BentoCard>

      <BentoCard title={t('sberPayments.cards.ugradyjy', 'Ugradyjy')}>
        <FormInput
          type="text"
          label={t('sberPayments.fields.fullName', 'Ady Familiýasy Atasynyň ady')}
          value={form.fullName}
          onChange={(v) => set('fullName', v)}
          placeholder={t('sberPayments.placeholders.fullName', 'Doly ady...')}
          error={errors.fullName}
          required
        />
        <FormInput
          type="text"
          label={t('sberPayments.fields.accountNumber', 'Goýum hasaby')}
          value={form.accountNumber}
          onChange={(v) => set('accountNumber', v)}
          placeholder={t('sberPayments.placeholders.accountNumber', '1234 5678 ...')}
          error={errors.accountNumber}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepDocs({
  form, set, t,
}: {
  form: SberPaymentFormData
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void
  t: (key: string, fallback?: string) => string
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title={t('sberPayments.cards.documentsAccepted', 'Kabul ediji talyp — 8 resminama')}>
        <div className="space-y-3">
          {ACCEPTED_DOCS(t).map(({ key, label }) => (
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

      <BentoCard title={t('sberPayments.cards.documentsSent', 'Ugradyjy — 6 resminama')}>
        <div className="space-y-3">
          {SENT_DOCS(t).map(({ key, label }) => (
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

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId = 'general' | 'location' | 'personal' | 'payment' | 'docs'

const getSteps = (t: (key: string, fallback?: string) => string): { id: StepId; title: string; subtitle: string }[] => [
  { id: 'general',  title: t('sberPayments.steps.general.title', 'Esasy'),        subtitle: t('sberPayments.steps.general.subtitle', 'Status, müşderi')   },
  { id: 'location', title: t('sberPayments.steps.location.title', 'Lokasiýa'),     subtitle: t('sberPayments.steps.location.subtitle', 'Welaýat, şahamça') },
  { id: 'personal', title: t('sberPayments.steps.personal.title', 'Şahsy'),        subtitle: t('sberPayments.steps.personal.subtitle', 'Pasport, kontakt') },
  { id: 'payment',  title: t('sberPayments.steps.payment.title', 'Töleg'),        subtitle: t('sberPayments.steps.payment.subtitle', 'Hasap, ugradyjy')  },
  { id: 'docs',     title: t('sberPayments.steps.docs.title', 'Resminamalar'), subtitle: t('sberPayments.steps.docs.subtitle', '14 resminama')     },
]

// ─── Initial data mapper ──────────────────────────────────────────────────────

function mapInitialData(data: SberPaymentOrder): Partial<SberPaymentFormData> {
  return {
    welayat:        data.welayat,
    sahamca:        data.sahamca,
    firstName:      data.firstName,
    lastName:       data.lastName,
    phone:          data.phone,
    email:          data.email,
    address:        data.address,
    status:         data.status,
    bellik:         data.bellik,
    accountNumber:  data.accountNumber,
    passportSeries: data.passportSeries,
    passportNumber: data.passportNumber,
    fullName:       data.fullName,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SberPaymentForm({ mode, initialData, orderId }: SberPaymentFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t],
  )
  const navigate = useNavigate()
  const createMutation = useCreateSberPayment()
  const updateMutation = useUpdateSberPayment()
  const isLoading = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors,
  } = useForm<SberPaymentFormData>({
    defaultValues: mode === 'edit' && initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitialData(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const [validationErrors, setValidationErrors] = useState<FlatErrors>({})

  const rhfFlat = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )
  const errors = useMemo(
    () => ({ ...rhfFlat, ...validationErrors }),
    [rhfFlat, validationErrors],
  )

  const steps = useMemo(() => getSteps(t), [i18n.language])

  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    () => mode === 'edit'
      ? steps.map((_, i) => (i === 0 ? 'active' : i < 4 ? 'done' : 'idle'))
      : steps.map((_, i) => (i === 0 ? 'active' : 'idle')),
  )

  // ── Field setter ──
  const set = <K extends keyof SberPaymentFormData>(key: K, value: SberPaymentFormData[K]) => {
    (setValue as (name: K, val: SberPaymentFormData[K]) => void)(key, value)
    clearErrors(key)
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // ── Step validation ──
  const doValidateAll = (): FlatErrors => {
    const errs: FlatErrors = {}
    for (let i = 0; i <= 3; i++) {
      Object.assign(errs, validateStep(i, form, mode, t))
    }
    setValidationErrors(errs)
    return errs
  }

  // ── Re-validate on language change ──
  useEffect(() => {
    const hasErrors = Object.keys(validationErrors).length > 0 || Object.keys(rhfErrors).length > 0
    if (hasErrors) {
      doValidateAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  // ── Navigation ──
  const goStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length) return
    setStepStatuses((prev) => {
      const next = [...prev]
      if (idx > currentStep) next[currentStep] = 'done'
      next[idx] = 'active'
      if (idx < currentStep) {
        for (let i = idx + 1; i <= currentStep; i++) {
          if (next[i] !== 'done') next[i] = 'idle'
        }
      }
      return next
    })
    clearErrors()
    setValidationErrors({})
    setCurrentStep(idx)
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, form, mode, t)
    if (Object.keys(stepErrors).length > 0) {
      setValidationErrors(stepErrors)
      setStepStatuses((prev) => {
        const next = [...prev]; next[currentStep] = 'error'; return next
      })
      return
    }
    setValidationErrors({})
    if (currentStep === steps.length - 1) {
      handleSubmit()
    } else {
      goStep(currentStep + 1)
    }
  }

  // ── Submit ──
  const handleSubmit = async () => {
    const allErrors = doValidateAll()
    if (Object.keys(allErrors).length > 0) {
      toast.error(t('common.errors.requiredFieldsMissing', 'Meýdanlary dolduryň'))
      return
    }
    const payload = buildPayload(getValues())
    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      toast.success(t('sberPayments.toast.created', 'Töleg üstünlikli döredildi'))
      navigate('/sber-payments')
    } else if (orderId) {
      await updateMutation.mutateAsync({ ...payload, id: orderId })
      toast.success(t('sberPayments.toast.updated', 'Töleg üstünlikli täzelendi'))
      navigate(`/sber-payments/${orderId}`)
    }
  }

  // ── StepBarCards data ──
  const stepCardItems: StepCardItem[] = steps.map((s, i) => ({
    id:       s.id,
    title:    s.title,
    subtitle: s.subtitle,
    status:   stepStatuses[i],
    icon:     ([User, MapPin, IdCard, CreditCard, Files] as const)[i],
  }))

  const isLastStep = currentStep === steps.length - 1

  const submitLabel = mode === 'create'
    ? t('sberPayments.buttons.create', 'Sber töleg (talyplar üçin) dörediň')
    : t('sberPayments.buttons.update', 'Ýatda sakla')

  return (
    <div className="mx-auto space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-foreground">
        {mode === 'create'
          ? t('sberPayments.formTitle.create', 'Sber töleg dörediň')
          : t('sberPayments.formTitle.edit', 'Sber töleg redaktirläň')}
      </h1>

      {/* ── Step bar ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards
          steps={stepCardItems}
          onGoTo={(i) => {
            if (stepStatuses[i] !== 'idle') goStep(i)
          }}
        />
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      {steps[currentStep].id === 'general'  && <StepGeneral  form={form} errors={errors} set={set} t={t} />}
      {steps[currentStep].id === 'location' && <StepLocation form={form} errors={errors} set={set} t={t} />}
      {steps[currentStep].id === 'personal' && <StepPersonal form={form} errors={errors} set={set} t={t} />}
      {steps[currentStep].id === 'payment'  && <StepPayment  form={form} errors={errors} set={set} t={t} />}
      {steps[currentStep].id === 'docs'     && <StepDocs     form={form} set={set} t={t} />}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <FormActions
        isPending={isLoading}
        onCancel={() => navigate('/sber-payments')}
        onPrev={currentStep > 0 ? () => goStep(currentStep - 1) : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleNext : undefined}
        submitLabel={submitLabel}
        loadingLabel={t('sberPayments.buttons.loading', 'Ýüklenýär...')}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CreditCard, User, FileText } from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import type { CardPinItem, CardPinCreatePayload } from '@/features/cardPins/api/cardPinApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardPinFormProps {
  mode: 'create' | 'edit'
  initialData?: CardPinItem
  onSubmit: (payload: CardPinCreatePayload) => void
  isSubmitting: boolean
}

interface FormState {
  status: string
  note: string
  card_type: string
  card_number: string
  province: string
  branch: string
  first_name: string
  last_name: string
  father_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
  passport_file_1: File | null
  passport_file_2: File | null
  passport_file_3: File | null
  passport_file_4: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>
type StepStatus = 'idle' | 'active' | 'done' | 'error'

// ─── Step field mapping ───────────────────────────────────────────────────────

const STEP_FIELDS: Array<Array<keyof FormState>> = [
  // Step 0 — Kart & Lokasiýa
  ['status', 'card_type', 'card_number', 'province', 'branch'],
  // Step 1 — Şahsy maglumatlar
  ['first_name', 'last_name', 'birth_date', 'phone'],
  // Step 2 — Pasport & Faýllar
  ['passport_series', 'passport_number', 'passport_file_1', 'passport_file_2', 'passport_file_3', 'passport_file_4'],
]

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklandy' },
  { value: 'rejected', label: 'Ret edildi' },
]

const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr' },
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
  { value: 'mary',     label: 'Mary' },
  { value: 'dasoguz',  label: 'Daşoguz' },
  { value: 'lebap',    label: 'Lebap' },
  { value: 'balkan',   label: 'Balkan' },
  { value: 'ahal',     label: 'Ahal' },
]

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: FormState = {
  status:          'pending',
  note:            '',
  card_type:       '',
  card_number:     '',
  province:        '',
  branch:          '',
  first_name:      '',
  last_name:       '',
  father_name:     '',
  birth_date:      '',
  phone:           '',
  passport_series: '',
  passport_number: '',
  passport_file_1: null,
  passport_file_2: null,
  passport_file_3: null,
  passport_file_4: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  form: FormState,
  mode: 'create' | 'edit',
  stepIndex?: number,
): FormErrors {
  const allErrors: FormErrors = {}

  if (!form.status)          allErrors.status          = 'Status hökmany'
  if (!form.card_type)       allErrors.card_type       = 'Kart görnüşi hökmany'
  if (!form.card_number)     allErrors.card_number     = 'Kart belgisi hökmany'
  if (!form.province)        allErrors.province        = 'Welaýat hökmany'
  if (!form.branch)          allErrors.branch          = 'Şahamça hökmany'
  if (!form.first_name)      allErrors.first_name      = 'Ady hökmany'
  if (!form.last_name)       allErrors.last_name       = 'Familiýasy hökmany'
  if (!form.birth_date)      allErrors.birth_date      = 'Doglan güni hökmany'
  if (!form.phone)           allErrors.phone           = 'Telefon hökmany'
  if (!form.passport_series) allErrors.passport_series = 'Pasport seriýasy hökmany'
  if (!form.passport_number) allErrors.passport_number = 'Pasport belgisi hökmany'

  if (mode === 'create') {
    if (!form.passport_file_1) allErrors.passport_file_1 = 'Pasport (sahypa 1) hökmany'
    if (!form.passport_file_2) allErrors.passport_file_2 = 'Pasport (2-3-nji sahypa) hökmany'
    if (!form.passport_file_3) allErrors.passport_file_3 = 'Pasport (8-9 sahypa) hökmany'
    if (!form.passport_file_4) allErrors.passport_file_4 = 'Pasport (32-nji sahypa) hökmany'
  }

  if (stepIndex !== undefined) {
    const stepKeys = STEP_FIELDS[stepIndex]
    const stepErrors: FormErrors = {}
    for (const key of stepKeys) {
      if (allErrors[key]) stepErrors[key] = allErrors[key]
    }
    return stepErrors
  }

  return allErrors
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {title && (
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardPinForm({ mode, initialData, onSubmit, isSubmitting }: CardPinFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm]     = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep]   = useState(0)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['active', 'idle', 'idle'])

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        status:          initialData.status,
        note:            initialData.note ?? '',
        card_type:       initialData.card_type,
        card_number:     initialData.card_number,
        province:        initialData.province,
        branch:          initialData.branch,
        first_name:      initialData.first_name,
        last_name:       initialData.last_name,
        father_name:     initialData.father_name,
        birth_date:      initialData.birth_date,
        phone:           initialData.phone,
        passport_series: initialData.passport_series,
        passport_number: initialData.passport_number,
        passport_file_1: null,
        passport_file_2: null,
        passport_file_3: null,
        passport_file_4: null,
      })
    }
  }, [mode, initialData])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Step navigation ────────────────────────────────────────────────────────

  const updateStatus = (index: number, status: StepStatus) => {
    setStepStatuses((prev) => {
      const next = [...prev]
      next[index] = status
      return next
    })
  }

  const goToStep = (index: number) => {
    updateStatus(currentStep, stepStatuses[currentStep] === 'error' ? 'error' : 'done')
    updateStatus(index, 'active')
    setCurrentStep(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    const stepErrors = validate(form, mode, currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      updateStatus(currentStep, 'error')
      toast.error('Dogry maglumat girizmegiňizi haýyş edýäris.')
      const firstKey = Object.keys(stepErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    updateStatus(currentStep, 'done')
    const next = currentStep + 1
    updateStatus(next, 'active')
    setCurrentStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrev = () => {
    const prev = currentStep - 1
    updateStatus(currentStep, stepStatuses[currentStep] === 'error' ? 'error' : 'idle')
    updateStatus(prev, 'active')
    setCurrentStep(prev)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const allErrors = validate(form, mode)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      const newStatuses = stepStatuses.map((s, i) => {
        const stepKeys = STEP_FIELDS[i]
        const hasError = stepKeys.some((k) => allErrors[k])
        if (i === currentStep) return hasError ? 'error' : 'active'
        if (hasError) return 'error'
        return s === 'idle' ? 'idle' : 'done'
      }) as StepStatus[]
      setStepStatuses(newStatuses)
      toast.error('Dogry maglumat girizmegiňizi haýyş edýäris.')
      return
    }

    onSubmit({
      status:          form.status as CardPinCreatePayload['status'],
      note:            form.note,
      card_type:       form.card_type,
      card_number:     form.card_number,
      province:        form.province,
      branch:          form.branch,
      first_name:      form.first_name,
      last_name:       form.last_name,
      father_name:     form.father_name,
      birth_date:      form.birth_date,
      phone:           form.phone,
      passport_series: form.passport_series,
      passport_number: form.passport_number,
      passport_file_1: form.passport_file_1,
      passport_file_2: form.passport_file_2,
      passport_file_3: form.passport_file_3,
      passport_file_4: form.passport_file_4,
    })
  }

  // ── Step bar items ─────────────────────────────────────────────────────────

  const stepDefs = [
    {
      id: 'card',
      title: t('cardPin.step.card', 'Kart'),
      subtitle: t('cardPin.step.cardSub', 'Görnüş & lokasiýa'),
      icon: CreditCard,
    },
    {
      id: 'personal',
      title: t('cardPin.step.personal', 'Şahsy'),
      subtitle: t('cardPin.step.personalSub', 'Maglumatlar'),
      icon: User,
    },
    {
      id: 'passport',
      title: t('cardPin.step.passport', 'Pasport'),
      subtitle: t('cardPin.step.passportSub', 'Resminamalar'),
      icon: FileText,
    },
  ]

  const stepItems: StepCardItem[] = stepDefs.map((def, i) => ({
    ...def,
    status: stepStatuses[i],
  }))

  const isFirstStep = currentStep === 0
  const isLastStep  = currentStep === stepDefs.length - 1

  const title = mode === 'create'
    ? t('cardPin.create', 'Kart pin bukja dörediň')
    : t('cardPin.edit',   'Kart pin bukja redaktirläň')

  const submitLabel = mode === 'create'
    ? t('cardPin.createBtn', 'Kart pin bukja dörediň')
    : t('cardPin.editBtn',   'Kart pin bukja redaktirläň')

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      {/* ── Step Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepItems} onGoTo={goToStep} />
      </div>

      {/* ── Step 0: Kart & Lokasiýa ──────────────────────────────────────── */}
      {currentStep === 0 && (
        <>
          <Section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="field-status">
                <FormInput
                  type="select"
                  label={t('cardPin.status', 'Status')}
                  value={form.status}
                  onChange={(v) => set('status', v)}
                  options={STATUS_OPTIONS}
                  error={errors.status}
                  required
                />
              </div>
              <FormInput
                type="text"
                label={t('cardPin.note', 'Bellik')}
                value={form.note}
                onChange={(v) => set('note', v)}
                placeholder={t('cardPin.notePlaceholder', 'Bellik')}
              />
            </div>
          </Section>

          <Section title={t('cardPin.cardSection', 'Kart')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="field-card_type">
                <FormInput
                  type="searchable-select"
                  label={t('cardPin.cardType', 'Kart görnüşi')}
                  value={form.card_type}
                  onChange={(v) => set('card_type', v)}
                  options={CARD_TYPE_OPTIONS}
                  error={errors.card_type}
                  required
                />
              </div>
              <div id="field-card_number">
                <FormInput
                  type="text"
                  label={t('cardPin.cardNumber', 'Kart belgisi')}
                  value={form.card_number}
                  onChange={(v) => set('card_number', v)}
                  placeholder={t('cardPin.cardNumberPlaceholder', 'Kart belgisi')}
                  error={errors.card_number}
                  required
                />
              </div>
            </div>
          </Section>

          <Section title={t('cardPin.locationSection', 'Lokasiýa')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="field-province">
                <FormInput
                  type="searchable-select"
                  label={t('cardPin.province', 'Welaýat')}
                  value={form.province}
                  onChange={(v) => { set('province', v); set('branch', '') }}
                  options={PROVINCE_OPTIONS}
                  error={errors.province}
                  required
                />
              </div>
              <div id="field-branch">
                <FormInput
                  type="searchable-select"
                  label={t('cardPin.branch', 'Şahamça')}
                  value={form.branch}
                  onChange={(v) => set('branch', v)}
                  options={[]}
                  placeholder={t('cardPin.branchPlaceholder', 'Saýlamak üçin basyň')}
                  error={errors.branch}
                  required
                />
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ── Step 1: Şahsy maglumatlar ─────────────────────────────────────── */}
      {currentStep === 1 && (
        <Section title={t('cardPin.personalSection', 'Şahsy maglumatlar')}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div id="field-first_name">
              <FormInput
                type="text"
                label={t('cardPin.firstName', 'Ady')}
                value={form.first_name}
                onChange={(v) => set('first_name', v)}
                placeholder={t('cardPin.firstName', 'Ady')}
                error={errors.first_name}
                required
              />
            </div>
            <div id="field-last_name">
              <FormInput
                type="text"
                label={t('cardPin.lastName', 'Familiýasy')}
                value={form.last_name}
                onChange={(v) => set('last_name', v)}
                placeholder={t('cardPin.lastName', 'Familiýasy')}
                error={errors.last_name}
                required
              />
            </div>
            <FormInput
              type="text"
              label={t('cardPin.fatherName', 'Atasynyň ady')}
              value={form.father_name}
              onChange={(v) => set('father_name', v)}
              placeholder={t('cardPin.fatherName', 'Atasynyň ady')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div id="field-birth_date">
              <FormInput
                type="date"
                label={t('cardPin.birthDate', 'Doglan güni')}
                value={form.birth_date}
                onChange={(v) => set('birth_date', v)}
                error={errors.birth_date}
                required
              />
            </div>
            <div id="field-phone">
              <FormInput
                type="phone"
                label={t('cardPin.phone', 'Telefon')}
                value={form.phone}
                onChange={(v) => set('phone', v)}
                error={errors.phone}
                required
              />
            </div>
          </div>
        </Section>
      )}

      {/* ── Step 2: Pasport & Faýllar ─────────────────────────────────────── */}
      {currentStep === 2 && (
        <Section title={t('cardPin.passportSection', 'Pasport')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-passport_series">
              <FormInput
                type="searchable-select"
                label={t('cardPin.passportSeries', 'Pasport seriýasy')}
                value={form.passport_series}
                onChange={(v) => set('passport_series', v)}
                options={PASSPORT_SERIES_OPTIONS}
                error={errors.passport_series}
                required
              />
            </div>
            <div id="field-passport_number">
              <FormInput
                type="text"
                label={t('cardPin.passportNumber', 'Pasport belgisi')}
                value={form.passport_number}
                onChange={(v) => set('passport_number', v)}
                placeholder={t('cardPin.passportNumber', 'Pasport belgisi')}
                error={errors.passport_number}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div id="field-passport_file_1">
              <FormInput
                type="file"
                label={t('cardPin.passportFile1', 'Pasport (sahypa 1)')}
                onFileChange={(f) => set('passport_file_1', f)}
                fileValue={form.passport_file_1}
                accept="image/*,.pdf"
                error={errors.passport_file_1}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_file_2">
              <FormInput
                type="file"
                label={t('cardPin.passportFile2', 'Pasport (2-3-nji sahypa)')}
                onFileChange={(f) => set('passport_file_2', f)}
                fileValue={form.passport_file_2}
                accept="image/*,.pdf"
                error={errors.passport_file_2}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_file_3">
              <FormInput
                type="file"
                label={t('cardPin.passportFile3', 'Pasport (8-9 sahypa)')}
                onFileChange={(f) => set('passport_file_3', f)}
                fileValue={form.passport_file_3}
                accept="image/*,.pdf"
                error={errors.passport_file_3}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_file_4">
              <FormInput
                type="file"
                label={t('cardPin.passportFile4', 'Pasport (32-nji sahypa)')}
                onFileChange={(f) => set('passport_file_4', f)}
                fileValue={form.passport_file_4}
                accept="image/*,.pdf"
                error={errors.passport_file_4}
                required={mode === 'create'}
              />
            </div>
          </div>
        </Section>
      )}

      {/* ── Form Actions ──────────────────────────────────────────────────── */}
      <FormActions
        isPending={isSubmitting}
        onCancel={() => navigate('/card-pins')}
        onPrev={!isFirstStep ? handlePrev : undefined}
        prevLabel={t('common.prev', 'Yza')}
        onNext={!isLastStep ? handleNext : undefined}
        nextLabel={t('common.next', 'Indiki')}
        showSubmit={isLastStep}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
      />
    </div>
  )
}
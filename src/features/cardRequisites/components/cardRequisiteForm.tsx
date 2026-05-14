import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CreditCard, User, FileText } from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components//stepBarV2'
import type { CardRequisite, CardRequisiteStatus, CreateCardRequisitePayload } from '../api/cardRequisitesApi'
import { useCreateCardRequisite, useUpdateCardRequisite } from '../hooks/useCardRequisites'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardRequisiteFormProps {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
  cardRequisiteId?: string
}

interface FormState {
  status: string
  note: string
  card_type: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
  province_id: string
  branch_id: string
  first_name: string
  last_name: string
  middle_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
}

interface FileState {
  passport_page1: File | null
  passport_page2_3: File | null
  passport_page8_9: File | null
  passport_page32: File | null
}

interface FormErrors {
  status?: string
  card_type?: string
  card_number?: string
  card_expiry_month?: string
  card_expiry_year?: string
  province_id?: string
  branch_id?: string
  first_name?: string
  last_name?: string
  birth_date?: string
  phone?: string
  passport_series?: string
  passport_number?: string
  passport_page1?: string
  passport_page2_3?: string
  passport_page8_9?: string
  passport_page32?: string
}

type StepStatus = 'idle' | 'active' | 'done' | 'error'

// ─── Step field mapping ───────────────────────────────────────────────────────

const STEP_FORM_FIELDS: Array<Array<keyof FormState | keyof FileState>> = [
  // Step 0 — Kart & Lokasiýa
  ['status', 'card_type', 'card_number', 'card_expiry_month', 'card_expiry_year', 'province_id', 'branch_id'],
  // Step 1 — Şahsy maglumatlar
  ['first_name', 'last_name', 'birth_date', 'phone'],
  // Step 2 — Pasport & Faýllar
  ['passport_series', 'passport_number', 'passport_page1', 'passport_page2_3', 'passport_page8_9', 'passport_page32'],
]

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklanan' },
  { value: 'rejected', label: 'Ret edilen' },
]

const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr' },
  { value: 'visa',       label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I-MR',   label: 'I-MR' },
  { value: 'II-MR',  label: 'II-MR' },
  { value: 'I-LB',   label: 'I-LB' },
  { value: 'II-LB',  label: 'II-LB' },
  { value: 'III-LB', label: 'III-LB' },
  { value: 'A',      label: 'A' },
  { value: 'B',      label: 'B' },
]

const PROVINCE_OPTIONS = [
  { value: '1', label: 'Aşgabat' },
  { value: '2', label: 'Ahal' },
  { value: '3', label: 'Balkan' },
  { value: '4', label: 'Daşoguz' },
  { value: '5', label: 'Lebap' },
  { value: '6', label: 'Mary' },
]

const BRANCH_OPTIONS: Record<string, { value: string; label: string }[]> = {
  '1': [{ value: '11', label: 'Köpetdag' }, { value: '12', label: 'Çandybil' }, { value: '13', label: 'Büzmeyin' }],
  '2': [{ value: '21', label: 'Änew' },     { value: '22', label: 'Tejen' }],
  '3': [{ value: '31', label: 'Balkanabat' }, { value: '32', label: 'Türkmenbaşy' }],
  '4': [{ value: '41', label: 'Daşoguz ş.' }, { value: '42', label: 'Köneürgenç' }],
  '5': [{ value: '51', label: 'Türkmenabat' }, { value: '52', label: 'Hazar' }],
  '6': [{ value: '61', label: 'Mary ş.' }, { value: '62', label: 'Ýolöten' }, { value: '63', label: 'Şatlyk' }],
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0')
  return { value: val, label: val }
})

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i)
  return { value: year, label: year }
})

const EMPTY_FORM: FormState = {
  status: 'pending',
  note: '',
  card_type: '',
  card_number: '',
  card_expiry_month: '',
  card_expiry_year: '',
  province_id: '',
  branch_id: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  birth_date: '',
  phone: '',
  passport_series: '',
  passport_number: '',
}

const EMPTY_FILES: FileState = {
  passport_page1: null,
  passport_page2_3: null,
  passport_page8_9: null,
  passport_page32: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  form: FormState,
  files: FileState,
  mode: 'create' | 'edit',
  t: (k: string, fallback: string) => string,
  stepIndex?: number,
): FormErrors {
  const allErrors: FormErrors = {}

  if (!form.status)            allErrors.status            = t('Status is required', 'Status hökmanydyr')
  if (!form.card_type)         allErrors.card_type         = t('Card type is required', 'Görnüşi hökmanydyr')
  if (!form.card_number)       allErrors.card_number       = t('Card number is required', 'Kart belgisi hökmanydyr')
  if (!form.card_expiry_month) allErrors.card_expiry_month = t('Expiry month is required', 'Möhleti (aý) hökmanydyr')
  if (!form.card_expiry_year)  allErrors.card_expiry_year  = t('Expiry year is required', 'Möhleti (ýyl) hökmanydyr')
  if (!form.province_id)       allErrors.province_id       = t('Province is required', 'Welaýat hökmanydyr')
  if (!form.branch_id)         allErrors.branch_id         = t('Branch is required', 'Şahamça hökmanydyr')
  if (!form.first_name)        allErrors.first_name        = t('First name is required', 'Ady hökmanydyr')
  if (!form.last_name)         allErrors.last_name         = t('Last name is required', 'Familiýasy hökmanydyr')
  if (!form.birth_date)        allErrors.birth_date        = t('Birth date is required', 'Doglan güni hökmanydyr')
  if (!form.phone)             allErrors.phone             = t('Phone is required', 'Telefon hökmanydyr')
  if (!form.passport_series)   allErrors.passport_series   = t('Passport series is required', 'Pasport seriýasy hökmanydyr')
  if (!form.passport_number)   allErrors.passport_number   = t('Passport number is required', 'Pasport belgisi hökmanydyr')

  if (mode === 'create') {
    if (!files.passport_page1)   allErrors.passport_page1   = t('Required', 'Hökmanydyr')
    if (!files.passport_page2_3) allErrors.passport_page2_3 = t('Required', 'Hökmanydyr')
    if (!files.passport_page8_9) allErrors.passport_page8_9 = t('Required', 'Hökmanydyr')
    if (!files.passport_page32)  allErrors.passport_page32  = t('Required', 'Hökmanydyr')
  }

  if (stepIndex !== undefined) {
    const stepKeys = STEP_FORM_FIELDS[stepIndex]
    const stepErrors: FormErrors = {}
    for (const key of stepKeys) {
      const k = key as keyof FormErrors
      if (allErrors[k]) stepErrors[k] = allErrors[k]
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

export function CardRequisiteForm({
  mode,
  initialData,
  cardRequisiteId,
}: CardRequisiteFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm]     = useState<FormState>(EMPTY_FORM)
  const [files, setFiles]   = useState<FileState>(EMPTY_FILES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep]     = useState(0)
  const [stepStatuses, setStepStatuses]   = useState<StepStatus[]>(['active', 'idle', 'idle'])

  const createMutation = useCreateCardRequisite()
  const updateMutation = useUpdateCardRequisite(cardRequisiteId ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        status:            initialData.status,
        note:              initialData.note,
        card_type:         initialData.card_type,
        card_number:       initialData.card_number,
        card_expiry_month: initialData.card_expiry_month,
        card_expiry_year:  initialData.card_expiry_year,
        province_id:       initialData.province_id,
        branch_id:         initialData.branch_id,
        first_name:        initialData.first_name,
        last_name:         initialData.last_name,
        middle_name:       initialData.middle_name,
        birth_date:        initialData.birth_date,
        phone:             initialData.phone,
        passport_series:   initialData.passport_series,
        passport_number:   initialData.passport_number,
      })
    }
  }, [mode, initialData])

  // ── Field setters ──────────────────────────────────────────────────────────

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'province_id') next.branch_id = ''
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setFile = (field: keyof FileState) => (file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
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
    const stepErrors = validate(form, files, mode, t, currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      updateStatus(currentStep, 'error')
      toast.error(t('Fix errors', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
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

  const handleSubmit = async () => {
    const allErrors = validate(form, files, mode, t)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      const newStatuses = stepStatuses.map((s, i) => {
        const stepKeys = STEP_FORM_FIELDS[i]
        const hasError = stepKeys.some((k) => allErrors[k as keyof FormErrors])
        if (i === currentStep) return hasError ? 'error' : 'active'
        if (hasError) return 'error'
        return s === 'idle' ? 'idle' : 'done'
      }) as StepStatus[]
      setStepStatuses(newStatuses)
      toast.error(t('Fix errors', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }

    const payload: CreateCardRequisitePayload = {
      ...(form as unknown as CreateCardRequisitePayload),
      status: form.status as CardRequisiteStatus,
      ...(files.passport_page1   && { passport_page1:   files.passport_page1 }),
      ...(files.passport_page2_3 && { passport_page2_3: files.passport_page2_3 }),
      ...(files.passport_page8_9 && { passport_page8_9: files.passport_page8_9 }),
      ...(files.passport_page32  && { passport_page32:  files.passport_page32 }),
    }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/card-requisites')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/card-requisites/${cardRequisiteId}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') navigate('/card-requisites')
    else navigate(`/card-requisites/${cardRequisiteId}`)
  }

  const branchOptions = BRANCH_OPTIONS[form.province_id] ?? []

  // ── Step bar items ─────────────────────────────────────────────────────────

  const stepDefs = [
    {
      id: 'card',
      title: t('Card', 'Kart'),
      subtitle: t('Type & location', 'Görnüş & lokasiýa'),
      icon: CreditCard,
    },
    {
      id: 'personal',
      title: t('Personal', 'Şahsy'),
      subtitle: t('Name & contact', 'At & telefon'),
      icon: User,
    },
    {
      id: 'passport',
      title: t('Passport', 'Pasport'),
      subtitle: t('Docs & files', 'Resminamalar'),
      icon: FileText,
    },
  ]

  const stepItems: StepCardItem[] = stepDefs.map((def, i) => ({
    ...def,
    status: stepStatuses[i],
  }))

  const isFirstStep = currentStep === 0
  const isLastStep  = currentStep === stepDefs.length - 1

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* ── Step Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepItems} onGoTo={goToStep} />
      </div>

      {/* ── Step 0: Kart & Lokasiýa ──────────────────────────────────────── */}
      {currentStep === 0 && (
        <>
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-status">
                <FormInput
                  type="select"
                  label={t('Status', 'Status')}
                  value={form.status}
                  onChange={setField('status')}
                  options={STATUS_OPTIONS}
                  error={errors.status}
                  required
                />
              </div>
              <FormInput
                type="text"
                label={t('Note', 'Bellik')}
                value={form.note}
                onChange={setField('note')}
                placeholder={t('Note', 'Bellik')}
              />
            </div>
          </Section>

          <Section title={t('Card', 'Kart')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div id="field-card_type">
                <FormInput
                  type="select"
                  label={t('Card type', 'Görnüşi')}
                  value={form.card_type}
                  onChange={setField('card_type')}
                  options={CARD_TYPE_OPTIONS}
                  placeholder="—"
                  error={errors.card_type}
                  required
                />
              </div>
              <div id="field-card_number">
                <FormInput
                  type="text"
                  label={t('Card number', 'Kart belgisi')}
                  value={form.card_number}
                  onChange={setField('card_number')}
                  placeholder={t('Card number', 'Kart belgisi')}
                  error={errors.card_number}
                  required
                />
              </div>
              <div id="field-card_expiry_month">
                <FormInput
                  type="select"
                  label={t('Card expiry month', 'Kart Möhleti (aý)')}
                  value={form.card_expiry_month}
                  onChange={setField('card_expiry_month')}
                  options={MONTH_OPTIONS}
                  placeholder={t('Select', 'Saýlamak üçin basyň')}
                  error={errors.card_expiry_month}
                  required
                />
              </div>
              <div id="field-card_expiry_year">
                <FormInput
                  type="select"
                  label={t('Card expiry year', 'Kart Möhleti (ýyl)')}
                  value={form.card_expiry_year}
                  onChange={setField('card_expiry_year')}
                  options={YEAR_OPTIONS}
                  placeholder={t('Select', 'Saýlamak üçin basyň')}
                  error={errors.card_expiry_year}
                  required
                />
              </div>
            </div>
          </Section>

          <Section title={t('Location', 'Lokasiýa')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-province_id">
                <FormInput
                  type="select"
                  label={t('Province', 'Welaýat')}
                  value={form.province_id}
                  onChange={setField('province_id')}
                  options={PROVINCE_OPTIONS}
                  placeholder={t('Ashgabat', 'Aşgabat')}
                  error={errors.province_id}
                  required
                />
              </div>
              <div id="field-branch_id">
                <FormInput
                  type="searchable-select"
                  label={t('Branch', 'Şahamça')}
                  value={form.branch_id}
                  onChange={setField('branch_id')}
                  options={branchOptions}
                  placeholder={t('Select', 'Saýlamak üçin basyň')}
                  error={errors.branch_id}
                  disabled={!form.province_id}
                  required
                />
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ── Step 1: Şahsy maglumatlar ─────────────────────────────────────── */}
      {currentStep === 1 && (
        <Section title={t('Personal information', 'Şahsy maglumatlar')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div id="field-first_name">
              <FormInput
                type="text"
                label={t('First name', 'Ady')}
                value={form.first_name}
                onChange={setField('first_name')}
                placeholder={t('First name', 'Ady')}
                error={errors.first_name}
                required
              />
            </div>
            <div id="field-last_name">
              <FormInput
                type="text"
                label={t('Last name', 'Familiýasy')}
                value={form.last_name}
                onChange={setField('last_name')}
                placeholder={t('Last name', 'Familiýasy')}
                error={errors.last_name}
                required
              />
            </div>
            <FormInput
              type="text"
              label={t("Father's name", 'Atasynyň ady')}
              value={form.middle_name}
              onChange={setField('middle_name')}
              placeholder={t("Father's name", 'Atasynyň ady')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div id="field-birth_date">
              <FormInput
                type="date"
                label={t('Birth date', 'Doglan güni')}
                value={form.birth_date}
                onChange={setField('birth_date')}
                error={errors.birth_date}
                required
              />
            </div>
            <div id="field-phone">
              <FormInput
                type="phone"
                label={t('Phone', 'Telefon')}
                value={form.phone}
                onChange={setField('phone')}
                placeholder="63 21 87 04"
                error={errors.phone}
                required
              />
            </div>
          </div>
        </Section>
      )}

      {/* ── Step 2: Pasport & Faýllar ─────────────────────────────────────── */}
      {currentStep === 2 && (
        <Section title={t('Passport', 'Pasport')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="field-passport_series">
              <FormInput
                type="searchable-select"
                label={t('Passport series', 'Pasport seriýasy')}
                value={form.passport_series}
                onChange={setField('passport_series')}
                options={PASSPORT_SERIES_OPTIONS}
                placeholder={t('Select', 'Saýlamak üçin basyň')}
                error={errors.passport_series}
                required
              />
            </div>
            <div id="field-passport_number">
              <FormInput
                type="text"
                label={t('Passport number', 'Pasport belgisi')}
                value={form.passport_number}
                onChange={setField('passport_number')}
                placeholder={t('Passport number', 'Pasport belgisi')}
                error={errors.passport_number}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div id="field-passport_page1">
              <FormInput
                type="file"
                label={t('Passport (page 1)', 'Pasport (sahypa 1)')}
                accept="image/*,.pdf"
                fileValue={files.passport_page1}
                onFileChange={setFile('passport_page1')}
                error={errors.passport_page1}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_page2_3">
              <FormInput
                type="file"
                label={t('Passport (pages 2-3)', 'Pasport (2-3-nji sahypa)')}
                accept="image/*,.pdf"
                fileValue={files.passport_page2_3}
                onFileChange={setFile('passport_page2_3')}
                error={errors.passport_page2_3}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_page8_9">
              <FormInput
                type="file"
                label={t('Passport (pages 8-9)', 'Pasport (8-9 sahypa)')}
                accept="image/*,.pdf"
                fileValue={files.passport_page8_9}
                onFileChange={setFile('passport_page8_9')}
                error={errors.passport_page8_9}
                required={mode === 'create'}
              />
            </div>
            <div id="field-passport_page32">
              <FormInput
                type="file"
                label={t('Passport (page 32)', 'Pasport (32-nji sahypa)')}
                accept="image/*,.pdf"
                fileValue={files.passport_page32}
                onFileChange={setFile('passport_page32')}
                error={errors.passport_page32}
                required={mode === 'create'}
              />
            </div>
          </div>
        </Section>
      )}

      {/* ── Form Actions ──────────────────────────────────────────────────── */}
      <FormActions
        isPending={isPending}
        onCancel={handleCancel}
        cancelVariant="ghost"
        cancelLabel={t('Cancel', 'Ýatyr')}
        loadingLabel={t('Saving...', 'Saklanýar...')}
        onPrev={!isFirstStep ? handlePrev : undefined}
        prevLabel={t('Back', 'Yza')}
        onNext={!isLastStep ? handleNext : undefined}
        nextLabel={t('Next', 'Indiki')}
        showSubmit={isLastStep}
        onSubmit={handleSubmit}
        submitLabel={
          mode === 'create'
            ? t('Create card requisite order', 'Kart rekwiziti üçin sargyt dörediň')
            : t('Save changes', 'Üýtgetmeleri sakla')
        }
        className="mt-6"
      />
    </div>
  )
}
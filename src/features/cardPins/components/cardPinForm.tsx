import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CreditCard, User, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import type { CardPinItem, CardPinCreatePayload } from '@/features/cardPins/api/cardPinApi'
import { validateStep, DEFAULT_FORM_VALUES } from '@/features/cardPins/schemas/cardPin.schema'
import type { CardPinFormData } from '@/features/cardPins/schemas/cardPin.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardPinFormProps {
  mode: 'create' | 'edit'
  initialData?: CardPinItem
  onSubmit: (payload: CardPinCreatePayload) => void
  isSubmitting: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar'  },
  { value: 'approved', label: 'Tassyklandy' },
  { value: 'rejected', label: 'Ret edildi'  },
]

const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr' },
  { value: 'visa',       label: 'Visa'        },
  { value: 'mastercard', label: 'MasterCard'  },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',     label: 'I'     },
  { value: 'II',    label: 'II'    },
  { value: 'I-MR',  label: 'I-MR'  },
  { value: 'II-MR', label: 'II-MR' },
]

const PROVINCE_OPTIONS = [
  { value: 'ashgabat', label: 'Aşgabat' },
  { value: 'mary',     label: 'Mary'    },
  { value: 'dasoguz',  label: 'Daşoguz' },
  { value: 'lebap',    label: 'Lebap'   },
  { value: 'balkan',   label: 'Balkan'  },
  { value: 'ahal',     label: 'Ahal'    },
]

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof CardPinFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CardPinFormData] = msg
  }
  return result
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  subtitle: string
  icon: LucideIcon
  validate: (form: CardPinFormData, mode: 'create' | 'edit') => FlatErrors
}

const STEPS: StepDef[] = [
  {
    id: 'card',
    titleKey: 'cardPin.step.card',
    titleFallback: 'Kart',
    subtitle: 'Görnüş & lokasiýa',
    icon: CreditCard,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: 'personal',
    titleKey: 'cardPin.step.personal',
    titleFallback: 'Şahsy',
    subtitle: 'Maglumatlar',
    icon: User,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: 'passport',
    titleKey: 'cardPin.step.passport',
    titleFallback: 'Pasport',
    subtitle: 'Resminamalar',
    icon: FileText,
    validate: (form, mode) => validateStep(2, form, mode),
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
  form: CardPinFormData
  errors: FlatErrors
  set: <K extends keyof CardPinFormData>(k: K, v: CardPinFormData[K]) => void
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepCard({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
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
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label="Bellik"
            value={form.note}
            onChange={(v) => set('note', v)}
            placeholder="Bellik..."
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard title="Kart maglumatlary">
          <FormInput
            type="searchable-select"
            label="Kart görnüşi"
            required
            value={form.card_type}
            onChange={(v) => set('card_type', v)}
            options={CARD_TYPE_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.card_type}
          />
          <FormInput
            type="text"
            label="Kart belgisi"
            required
            value={form.card_number}
            onChange={(v) => set('card_number', v)}
            placeholder="Kart belgisi"
            error={errors.card_number}
          />
        </BentoCard>

        <BentoCard title="Lokasiýa">
          <FormInput
            type="searchable-select"
            label="Welaýat"
            required
            value={form.province}
            onChange={(v) => { set('province', v); set('branch', '') }}
            options={PROVINCE_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.province}
          />
          <FormInput
            type="searchable-select"
            label="Şahamça"
            required
            value={form.branch}
            onChange={(v) => set('branch', v)}
            options={[]}
            placeholder="Saýlamak üçin basyň"
            disabled={!form.province}
            error={errors.branch}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPersonal({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="text" label="Ady" required
            value={form.first_name} onChange={(v) => set('first_name', v)}
            placeholder="Ady" error={errors.first_name}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Familiýasy" required
            value={form.last_name} onChange={(v) => set('last_name', v)}
            placeholder="Familiýasy" error={errors.last_name}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label="Atasynyň ady"
            value={form.father_name} onChange={(v) => set('father_name', v)}
            placeholder="Atasynyň ady"
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="date" label="Doglan güni" required
            value={form.birth_date} onChange={(v) => set('birth_date', v)}
            error={errors.birth_date}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone" label="Telefon" required
            value={form.phone} onChange={(v) => set('phone', v)}
            error={errors.phone}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPassport({ form, errors, set, mode, initialData }: StepContentProps & {
  mode: 'create' | 'edit'
  initialData?: CardPinItem
}) {
  const existingFiles =
    mode === 'edit' && initialData
      ? [
          { url: initialData.passport_file_1, label: 'Pasport (sahypa 1)'       },
          { url: initialData.passport_file_2, label: 'Pasport (2-3-nji sahypa)' },
          { url: initialData.passport_file_3, label: 'Pasport (8-9 sahypa)'     },
          { url: initialData.passport_file_4, label: 'Pasport (32-nji sahypa)'  },
        ].filter((f): f is { url: string; label: string } => !!f.url)
      : []

  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label="Pasport seriýasy"
            required
            value={form.passport_series}
            onChange={(v) => set('passport_series', v)}
            options={PASSPORT_SERIES_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.passport_series}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label="Pasport belgisi"
            required
            value={form.passport_number}
            onChange={(v) => set('passport_number', v)}
            placeholder="Pasport belgisi"
            error={errors.passport_number}
          />
        </BentoCard>
      </BentoGrid>

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
            fileValue={form.passport_file_1}
            onFileChange={(f) => set('passport_file_1', f)}
            error={errors.passport_file_1}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (2-3-nji sahypa) (çalyşmak)' : 'Pasport (2-3-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_file_2}
            onFileChange={(f) => set('passport_file_2', f)}
            error={errors.passport_file_2}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (8-9 sahypa) (çalyşmak)' : 'Pasport (8-9 sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_file_3}
            onFileChange={(f) => set('passport_file_3', f)}
            error={errors.passport_file_3}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (32-nji sahypa) (çalyşmak)' : 'Pasport (32-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_file_4}
            onFileChange={(f) => set('passport_file_4', f)}
            error={errors.passport_file_4}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardPinForm({ mode, initialData, onSubmit, isSubmitting }: CardPinFormProps) {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors,
  } = useForm<CardPinFormData>({
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )

  // ── Computed step errors ───────────────────────────────────────────────────

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited])

  // ── set helper ─────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof CardPinFormData>(key: K, value: CardPinFormData[K]) => {
    (setValue as (name: K, val: CardPinFormData[K]) => void)(key, value)
    clearErrors(key)
  }, [setValue, clearErrors])

  const stepProps = useMemo(() => ({ form, errors, set }), [form, errors, set])

  // ── Navigation ─────────────────────────────────────────────────────────────

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]))

  const handleNext = () => {
    markVisited(currentStep)
    const errs = STEPS[currentStep].validate(form, mode)
    if (Object.keys(errs).length > 0) {
      toast.error(t('common.errors.fillRequiredCorrectly', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }
    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    markVisited(currentStep)
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoTo = (i: number) => {
    markVisited(currentStep)
    setCurrentStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    setVisited(new Set(STEPS.map((_, i) => i)))

    const values = getValues()
    const allErrors: FlatErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(values, mode))

    if (Object.keys(allErrors).length > 0) {
      toast.error(t('common.errors.requiredFieldsMissing', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(values, mode)).length > 0) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    onSubmit({
      status:          values.status as CardPinCreatePayload['status'],
      note:            values.note ?? '',
      card_type:       values.card_type,
      card_number:     values.card_number,
      province:        values.province,
      branch:          values.branch,
      first_name:      values.first_name,
      last_name:       values.last_name,
      father_name:     values.father_name ?? '',
      birth_date:      values.birth_date,
      phone:           values.phone,
      passport_series: values.passport_series,
      passport_number: values.passport_number,
      passport_file_1: values.passport_file_1,
      passport_file_2: values.passport_file_2,
      passport_file_3: values.passport_file_3,
      passport_file_4: values.passport_file_4,
    })
  }

  // ── StepBar items ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
    

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {currentStep === 0 && <StepCard     {...stepProps} />}
      {currentStep === 1 && <StepPersonal {...stepProps} />}
      {currentStep === 2 && (
        <StepPassport {...stepProps} mode={mode} initialData={initialData} />
      )}

      {/* Actions */}
      <FormActions
        isPending={isSubmitting}
        onCancel={currentStep === 0 ? () => navigate('/card-pins') : undefined}
        onPrev={currentStep > 0 ? handleBack : undefined}
        prevLabel={t('common.prev', 'Yza')}
        onNext={!isLastStep ? handleNext : undefined}
        nextLabel={t('common.next', 'Indiki')}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleSubmit : undefined}
        submitLabel={
          mode === 'create'
            ? t('cardPin.createBtn', 'Kart pin bukja dörediň')
            : t('cardPin.editBtn',   'Kart pin bukja redaktirläň')
        }
      />
    </div>
  )
}

function mapInitial(data: CardPinItem): Partial<CardPinFormData> {
  return {
    status:          data.status          ?? 'pending',
    note:            data.note            ?? '',
    card_type:       data.card_type       ?? '',
    card_number:     data.card_number     ?? '',
    province:        data.province        ?? '',
    branch:          data.branch          ?? '',
    first_name:      data.first_name      ?? '',
    last_name:       data.last_name       ?? '',
    father_name:     data.father_name     ?? '',
    birth_date:      data.birth_date      ?? '',
    phone:           data.phone           ?? '',
    passport_series: data.passport_series ?? '',
    passport_number: data.passport_number ?? '',
  }
}

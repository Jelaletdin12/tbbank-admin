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
import type { CardRequisite } from '../api/cardRequisitesApi'
import { useCreateCardRequisite, useUpdateCardRequisite } from '../hooks/useCardRequisites'
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/cardRequisite.schema'
import type { CardRequisiteFormData } from '../schemas/cardRequisite.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardRequisiteFormProps {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
  cardRequisiteId?: string
}

type FlatErrors = Partial<Record<keyof CardRequisiteFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CardRequisiteFormData] = msg
  }
  return result
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar'  },
  { value: 'approved', label: 'Tassyklanan' },
  { value: 'rejected', label: 'Ret edilen'  },
]

const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr'  },
  { value: 'visa',       label: 'Visa'        },
  { value: 'mastercard', label: 'MasterCard'  },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I-MR',   label: 'I-MR'   },
  { value: 'II-MR',  label: 'II-MR'  },
  { value: 'I-LB',   label: 'I-LB'   },
  { value: 'II-LB',  label: 'II-LB'  },
  { value: 'III-LB', label: 'III-LB' },
  { value: 'A',      label: 'A'      },
  { value: 'B',      label: 'B'      },
]

const PROVINCE_OPTIONS = [
  { value: '1', label: 'Aşgabat' },
  { value: '2', label: 'Ahal'    },
  { value: '3', label: 'Balkan'  },
  { value: '4', label: 'Daşoguz' },
  { value: '5', label: 'Lebap'   },
  { value: '6', label: 'Mary'    },
]

const BRANCH_OPTIONS: Record<string, { value: string; label: string }[]> = {
  '1': [{ value: '11', label: 'Köpetdag' }, { value: '12', label: 'Çandybil' }, { value: '13', label: 'Büzmeyin' }],
  '2': [{ value: '21', label: 'Änew'     }, { value: '22', label: 'Tejen'    }],
  '3': [{ value: '31', label: 'Balkanabat' }, { value: '32', label: 'Türkmenbaşy' }],
  '4': [{ value: '41', label: 'Daşoguz ş.' }, { value: '42', label: 'Köneürgenç'  }],
  '5': [{ value: '51', label: 'Türkmenabat' }, { value: '52', label: 'Hazar'      }],
  '6': [{ value: '61', label: 'Mary ş.'    }, { value: '62', label: 'Ýolöten'    }, { value: '63', label: 'Şatlyk' }],
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0')
  return { value: val, label: val }
})

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i)
  return { value: year, label: year }
})

function mapInitial(data: CardRequisite): CardRequisiteFormData {
  return {
    status:            data.status            ?? 'pending',
    note:              data.note              ?? '',
    card_type:         data.card_type         ?? '',
    card_number:       data.card_number       ?? '',
    card_expiry_month: data.card_expiry_month ?? '',
    card_expiry_year:  data.card_expiry_year  ?? '',
    province_id:       data.province_id       ?? '',
    branch_id:         data.branch_id         ?? '',
    first_name:        data.first_name        ?? '',
    last_name:         data.last_name         ?? '',
    middle_name:       data.middle_name       ?? '',
    birth_date:        data.birth_date        ?? '',
    phone:             data.phone             ?? '',
    passport_series:   data.passport_series   ?? '',
    passport_number:   data.passport_number   ?? '',
    passport_page1: null, passport_page2_3: null,
    passport_page8_9: null, passport_page32: null,
  }
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  subtitle: string
  icon: LucideIcon
  validate: (form: CardRequisiteFormData, mode: 'create' | 'edit') => FlatErrors
}

const STEPS: StepDef[] = [
  {
    id: 'card',
    titleKey: 'Card',
    titleFallback: 'Kart',
    subtitle: 'Görnüş & lokasiýa',
    icon: CreditCard,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: 'personal',
    titleKey: 'Personal',
    titleFallback: 'Şahsy',
    subtitle: 'At & telefon',
    icon: User,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: 'passport',
    titleKey: 'Passport',
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
  form: CardRequisiteFormData
  errors: FlatErrors
  set: <K extends keyof CardRequisiteFormData>(k: K, v: CardRequisiteFormData[K]) => void
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepCard({ form, errors, set }: StepContentProps) {
  const branchOptions = BRANCH_OPTIONS[form.province_id] ?? []

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
            type="select"
            label="Görnüşi"
            required
            value={form.card_type}
            onChange={(v) => set('card_type', v)}
            options={CARD_TYPE_OPTIONS}
            placeholder="—"
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

        <BentoCard title="Kart möhleti">
          <FormInput
            type="select"
            label="Möhleti (aý)"
            required
            value={form.card_expiry_month}
            onChange={(v) => set('card_expiry_month', v)}
            options={MONTH_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.card_expiry_month}
          />
          <FormInput
            type="select"
            label="Möhleti (ýyl)"
            required
            value={form.card_expiry_year}
            onChange={(v) => set('card_expiry_year', v)}
            options={YEAR_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.card_expiry_year}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label="Welaýat"
            required
            value={form.province_id}
            onChange={(v) => { set('province_id', v); set('branch_id', '') }}
            options={PROVINCE_OPTIONS}
            placeholder="Aşgabat"
            error={errors.province_id}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label="Şahamça"
            required
            value={form.branch_id}
            onChange={(v) => set('branch_id', v)}
            options={branchOptions}
            placeholder="Saýlamak üçin basyň"
            disabled={!form.province_id}
            error={errors.branch_id}
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
            value={form.middle_name} onChange={(v) => set('middle_name', v)}
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
            placeholder="63 21 87 04"
            error={errors.phone}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPassport({ form, errors, set, mode, initialData }: StepContentProps & {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
}) {
  const existingFiles =
    mode === 'edit' && initialData
      ? [
          { url: initialData.passport_page1_url,   label: 'Pasport (sahypa 1)'       },
          { url: initialData.passport_page2_3_url,  label: 'Pasport (2-3-nji sahypa)' },
          { url: initialData.passport_page8_9_url,  label: 'Pasport (8-9 sahypa)'     },
          { url: initialData.passport_page32_url,   label: 'Pasport (32-nji sahypa)'  },
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
            fileValue={form.passport_page1}
            onFileChange={(f) => set('passport_page1', f)}
            error={errors.passport_page1}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (2-3-nji sahypa) (çalyşmak)' : 'Pasport (2-3-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_page2_3}
            onFileChange={(f) => set('passport_page2_3', f)}
            error={errors.passport_page2_3}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (8-9 sahypa) (çalyşmak)' : 'Pasport (8-9 sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_page8_9}
            onFileChange={(f) => set('passport_page8_9', f)}
            error={errors.passport_page8_9}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (32-nji sahypa) (çalyşmak)' : 'Pasport (32-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*,.pdf"
            fileValue={form.passport_page32}
            onFileChange={(f) => set('passport_page32', f)}
            error={errors.passport_page32}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardRequisiteForm({
  mode,
  initialData,
  cardRequisiteId,
}: CardRequisiteFormProps) {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateCardRequisite()
  const updateMutation = useUpdateCardRequisite(cardRequisiteId ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors,
  } = useForm<CardRequisiteFormData>({
    defaultValues: initialData ? mapInitial(initialData) : DEFAULT_FORM_VALUES,
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

  const set = useCallback(<K extends keyof CardRequisiteFormData>(key: K, value: CardRequisiteFormData[K]) => {
    (setValue as (name: K, val: CardRequisiteFormData[K]) => void)(key, value)
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
      toast.error(t('Fix errors', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
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

  const handleCancel = () => {
    if (mode === 'create') navigate('/card-requisites')
    else navigate(`/card-requisites/${cardRequisiteId}`)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setVisited(new Set(STEPS.map((_, i) => i)))

    const allErrors: FlatErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode))

    if (Object.keys(allErrors).length > 0) {
      toast.error(t('Fix errors', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/card-requisites')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/card-requisites/${cardRequisiteId}`)
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
        isPending={isPending}
        onCancel={currentStep === 0 ? handleCancel : undefined}
        cancelVariant="ghost"
        cancelLabel={t('Cancel', 'Ýatyr')}
        loadingLabel={t('Saving...', 'Saklanýar...')}
        onPrev={currentStep > 0 ? handleBack : undefined}
        prevLabel={t('Back', 'Yza')}
        onNext={!isLastStep ? handleNext : undefined}
        nextLabel={t('Next', 'Indiki')}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleSubmit : undefined}
        submitLabel={
          mode === 'create'
            ? t('Create card requisite order', 'Kart rekwiziti üçin sargyt dörediň')
            : t('Save changes', 'Üýtgetmeleri sakla')
        }
      />
    </div>
  )
}
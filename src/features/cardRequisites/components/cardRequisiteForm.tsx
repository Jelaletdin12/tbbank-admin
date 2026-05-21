import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CreditCard, User, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import { BentoGrid, BentoCard } from '@/components/bento'
import type { CardRequisite } from '../api/cardRequisitesApi'
import { useCreateCardRequisite, useUpdateCardRequisite } from '../hooks/useCardRequisites'
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/cardRequisite.schema'
import type { CardRequisiteFormData } from '../schemas/cardRequisite.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardRequisiteFormProps {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
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
  subtitleKey: string
  subtitleFallback: string
  icon: LucideIcon
  validate: (form: CardRequisiteFormData, mode: 'create' | 'edit') => FlatErrors
}

const STEPS: StepDef[] = [
  {
    id: 'card',
    titleKey: 'Card',
    titleFallback: 'Kart',
    subtitleKey: 'cardRequisiteForm.steps.card.subtitle',
    subtitleFallback: 'Görnüş & lokasiýa',
    icon: CreditCard,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: 'personal',
    titleKey: 'Personal',
    titleFallback: 'Şahsy',
    subtitleKey: 'cardRequisiteForm.steps.personal.subtitle',
    subtitleFallback: 'At & telefon',
    icon: User,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: 'passport',
    titleKey: 'Passport',
    titleFallback: 'Pasport',
    subtitleKey: 'cardRequisiteForm.steps.passport.subtitle',
    subtitleFallback: 'Resminamalar',
    icon: FileText,
    validate: (form, mode) => validateStep(2, form, mode),
  },
]

// ─── Shared step content props ────────────────────────────────────────────────

interface StepContentProps {
  form: CardRequisiteFormData
  errors: FlatErrors
  set: <K extends keyof CardRequisiteFormData>(k: K, v: CardRequisiteFormData[K]) => void
  t: TFunction
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepCard({ form, errors, set, t }: StepContentProps) {
  const branchOptions = BRANCH_OPTIONS[form.province_id] ?? []

  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label={t('loanOrderForm.labels.status') || 'Status'}
            required
            value={form.status}
            onChange={(v) => set('status', v)}
            options={STATUS_OPTIONS}
            error={errors.status}
            placeholder={t('loanOrderForm.placeholders.select') || 'Saýlaň'}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t('Note') || 'Bellik'}
            value={form.note}
            onChange={(v) => set('note', v)}
            placeholder={t('loanOrderForm.placeholders.note') || 'Bellik...'}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard title={t('loanOrderForm.titles.cardInfo') || 'Kart maglumatlary'}>
          <FormInput
            type="select"
            label={t('cardRequisiteForm.labels.cardType') || 'Görnüşi'}
            required
            value={form.card_type}
            onChange={(v) => set('card_type', v)}
            options={CARD_TYPE_OPTIONS}
            placeholder="—"
            error={errors.card_type}
          />
          <FormInput
            type="text"
            label={t('Card number') || 'Kart belgisi'}
            required
            value={form.card_number}
            onChange={(v) => set('card_number', v)}
            placeholder={t('Card number') || 'Kart belgisi'}
            error={errors.card_number}
          />
        </BentoCard>

        <BentoCard title={t('loanOrderForm.titles.cardExpiry') || 'Kart möhleti'}>
          <FormInput
            type="select"
            label={t('Expiration month') || 'Möhleti (aý)'}
            required
            value={form.card_expiry_month}
            onChange={(v) => set('card_expiry_month', v)}
            options={MONTH_OPTIONS}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            error={errors.card_expiry_month}
          />
          <FormInput
            type="select"
            label={t('Expiration year') || 'Möhleti (ýyl)'}
            required
            value={form.card_expiry_year}
            onChange={(v) => set('card_expiry_year', v)}
            options={YEAR_OPTIONS}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            error={errors.card_expiry_year}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label={t('Region') || 'Welaýat'}
            required
            value={form.province_id}
            onChange={(v) => { set('province_id', v); set('branch_id', '') }}
            options={PROVINCE_OPTIONS}
            placeholder={t('Region') || 'Aşgabat'}
            error={errors.province_id}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t('Branch') || 'Şahamça'}
            required
            value={form.branch_id}
            onChange={(v) => set('branch_id', v)}
            options={branchOptions}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            disabled={!form.province_id}
            error={errors.branch_id}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPersonal({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="text" label={t('Name') || 'Ady'} required
            value={form.first_name} onChange={(v) => set('first_name', v)}
            placeholder={t('Name') || 'Ady'} error={errors.first_name}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label={t('Surname') || 'Familiýasy'} required
            value={form.last_name} onChange={(v) => set('last_name', v)}
            placeholder={t('Surname') || 'Familiýasy'} error={errors.last_name}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text" label={t('Patronic name') || 'Atasynyň ady'}
            value={form.middle_name} onChange={(v) => set('middle_name', v)}
            placeholder={t('Patronic name') || 'Atasynyň ady'}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="date" label={t('Date of birth') || 'Doglan güni'} required
            value={form.birth_date} onChange={(v) => set('birth_date', v)}
            error={errors.birth_date}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone" label={t('Phone') || 'Telefon'} required
            value={form.phone} onChange={(v) => set('phone', v)}
            placeholder="63 21 87 04"
            error={errors.phone}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepPassport({ form, errors, set, t, mode, initialData }: StepContentProps & {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
}) {
  const existingFiles =
    mode === 'edit' && initialData
      ? [
          { url: initialData.passport_page1_url,   label: t('Passport (page 1)') || 'Pasport (sahypa 1)'       },
          { url: initialData.passport_page2_3_url,  label: t('Passport (page 2-3)') || 'Pasport (2-3-nji sahypa)' },
          { url: initialData.passport_page8_9_url,  label: t('Passport (page 8-9)') || 'Pasport (8-9 sahypa)'     },
          { url: initialData.passport_page32_url,   label: t('Passport (page 32)') || 'Pasport (32-nji sahypa)'  },
        ].filter((f): f is { url: string; label: string } => !!f.url)
      : []

  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t('Passport serie') || 'Pasport seriýasy'}
            required
            value={form.passport_series}
            onChange={(v) => set('passport_series', v)}
            options={PASSPORT_SERIES_OPTIONS}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            error={errors.passport_series}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t('Passport id') || 'Pasport belgisi'}
            required
            value={form.passport_number}
            onChange={(v) => set('passport_number', v)}
            placeholder={t('Passport id') || 'Pasport belgisi'}
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
                {t('loanOrderForm.fileLabels.viewFile') || 'Faýly gör'}
              </a>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? (t('loanOrderForm.fileLabels.replacePage1') || 'Pasport (sahypa 1) (çalyşmak)') : (t('Passport (page 1)') || 'Pasport (sahypa 1)')}
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
            label={mode === 'edit' ? (t('loanOrderForm.fileLabels.replacePage23') || 'Pasport (2-3-nji sahypa) (çalyşmak)') : (t('Passport (page 2-3)') || 'Pasport (2-3-nji sahypa)')}
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
            label={t('Passport (page 8-9)') || 'Pasport (8-9 sahypa)'}
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
            label={t('Passport (page 32)') || 'Pasport (32-nji sahypa)'}
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

export function CardRequisiteForm({ mode, initialData }: CardRequisiteFormProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateCardRequisite()
  const updateMutation = useUpdateCardRequisite(initialData?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, setError,
  } = useForm<CardRequisiteFormData>({
    defaultValues: initialData ? mapInitial(initialData) : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set())

  // ── Computed step errors ───────────────────────────────────────────────────

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited, i18n.language])

  // ── set helper ─────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof CardRequisiteFormData>(key: K, value: CardRequisiteFormData[K]) => {
    (setValue as (name: K, val: CardRequisiteFormData[K]) => void)(key, value)
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

  // ── Navigation ─────────────────────────────────────────────────────────────

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
        setError(key as keyof CardRequisiteFormData, { type: 'manual', message: msg })
      })
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
    else navigate(`/card-requisites/${initialData?.id}`)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setVisited(new Set(STEPS.map((_, i) => i)))
    setSubmittedSteps(new Set(STEPS.map((_, i) => i)))

    const allErrors: FlatErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode))

    if (Object.keys(allErrors).length > 0) {
      Object.entries(allErrors).forEach(([key, msg]) => {
        setError(key as keyof CardRequisiteFormData, { type: 'manual', message: msg })
      })
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
      navigate(`/card-requisites/${initialData?.id}`)
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'create'
            ? t('Create card requisite order', 'Kart rekwiziti üçin sargyt dörediň')
            : t('Edit card requisite', 'Kart rekwizitini üýtget')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('common.form.subtitle', 'Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.')}
        </p>
      </div>

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
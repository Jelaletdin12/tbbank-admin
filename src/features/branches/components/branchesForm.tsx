import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2, MapPin, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { MultiLangInput } from '@/components/multiLangInput'
import { Checkbox } from '@/components/ui/checkbox'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import { useCreateBranch, useUpdateBranch } from '@/features/branches/hooks/useBranches'
import type { Branch } from '@/features/branches/api/branchesApi'
import { getDistrictOptions } from '@/features/branches/api/branchesApi'
import { createBranchFormSchema, validateStep, DEFAULT_FORM_VALUES, buildPayload } from '@/features/branches/schemas/branch.schema'
import type { BranchFormData } from '@/features/branches/schemas/branch.schema'

type FlatErrors = Partial<Record<keyof BranchFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof BranchFormData] = msg
  }
  return result
}

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  shortLabel: string
  icon: LucideIcon
  subtitle: string
  validate: (form: BranchFormData, mode: 'create' | 'edit', t: (key: string, fallback?: string) => string) => FlatErrors
}

const STEPS: StepDef[] = [
  {
    id: 'basic',
    titleKey: 'branches.steps.basic',
    titleFallback: 'Esasy maglumatlar',
    shortLabel: 'Esasy',
    icon: Building2,
    subtitle: 'Ady, kody, etrapy',
    validate: (form, mode, t) => validateStep(0, form, mode, t),
  },
  {
    id: 'address',
    titleKey: 'branches.steps.address',
    titleFallback: 'Salgy we habarlaşmak',
    shortLabel: 'Salgy',
    icon: MapPin,
    subtitle: 'Salgy, telefon, e-poçta',
    validate: (form, mode, t) => validateStep(1, form, mode, t),
  },
  {
    id: 'hours',
    titleKey: 'branches.steps.hours',
    titleFallback: 'Iş wagty',
    shortLabel: 'Wagt',
    icon: Clock,
    subtitle: 'Iş wagty we bellikler',
    validate: (form, mode, t) => validateStep(2, form, mode, t),
  },
]

const STEP_FIELDS: Record<number, (keyof BranchFormData)[]> = {
  0: ['nameTk', 'nameRu', 'nameEn', 'code', 'districtId', 'isActive'],
  1: ['addressTk', 'addressRu', 'addressEn', 'phone', 'email'],
  2: ['workingHours', 'description'],
}

interface StepContentProps {
  form: BranchFormData
  errors: FlatErrors
  set: <K extends keyof BranchFormData>(k: K, v: BranchFormData[K]) => void
  t: (key: string, fallback?: string) => string
  lang: 'tk' | 'ru' | 'en'
}

function StepBasic({ form, errors, set, t, lang }: StepContentProps) {
  const nameFields = {
    tk: { value: form.nameTk, onChange: (v: string) => set('nameTk', v), error: errors.nameTk },
    ru: { value: form.nameRu, onChange: (v: string) => set('nameRu', v), error: errors.nameRu },
    en: { value: form.nameEn, onChange: (v: string) => set('nameEn', v), error: errors.nameEn },
  }

  return (
    <div className="flex flex-col gap-6">
      <MultiLangInput fields={nameFields} placeholder={t('branches.fields.name', 'Şahamçanyň ady')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput
          type="text"
          label={t('branches.fields.code', 'Kod')}
          required
          value={form.code}
          onChange={(v) => set('code', v)}
          placeholder="BR-XXX"
          error={errors.code}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput
          type="searchable-select"
          label={t('branches.fields.district', 'Etrap')}
          required
          value={form.districtId}
          onChange={(v) => set('districtId', v)}
          options={getDistrictOptions().map((d) => ({ value: String(d.id), label: d.name[lang] }))}
          placeholder={t('branches.fields.district', 'Etrap saýlaň')}
          error={errors.districtId}
        />
        <div className="flex items-end pb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => set('isActive', !!checked)}
            />
            <label htmlFor="isActive" className="text-sm text-muted-foreground cursor-pointer select-none">
              {t('branches.fields.isActive', 'Işjeň')}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepAddress({ form, errors, set, t }: StepContentProps) {
  const addressFields = {
    tk: { value: form.addressTk, onChange: (v: string) => set('addressTk', v), error: errors.addressTk },
    ru: { value: form.addressRu, onChange: (v: string) => set('addressRu', v), error: errors.addressRu },
    en: { value: form.addressEn, onChange: (v: string) => set('addressEn', v), error: errors.addressEn },
  }

  return (
    <div className="flex flex-col gap-6">
      <MultiLangInput fields={addressFields} placeholder={t('branches.fields.address', 'Salgy')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput
          type="phone"
          label={t('branches.fields.phone', 'Telefon')}
          required
          value={form.phone}
          onChange={(v) => set('phone', v)}
          placeholder="12 45-67-89"
          error={errors.phone}
        />
        <FormInput
          type="email"
          label={t('branches.fields.email', 'E-poçta')}
          required
          value={form.email}
          onChange={(v) => set('email', v)}
          placeholder="email@tbbank.gov.tm"
          error={errors.email}
        />
      </div>
    </div>
  )
}

function StepHours({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormInput
          type="text"
          label={t('branches.fields.workingHours', 'Iş wagty')}
          required
          value={form.workingHours}
          onChange={(v) => set('workingHours', v)}
          placeholder="09:00 - 18:00"
          error={errors.workingHours}
        />
      </div>
      <FormInput
        type="textarea"
        label={t('branches.fields.description', 'Bellikler')}
        value={form.description}
        onChange={(v) => set('description', v)}
        placeholder="Goşmaça maglumatlar..."
        rows={3}
      />
    </div>
  )
}

export interface BranchFormProps {
  mode: 'create' | 'edit'
  initialData?: Branch
}

function mapInitial(data: Branch): Partial<BranchFormData> {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    code: data.code,
    districtId: String(data.districtId),
    addressTk: data.address.tk,
    addressRu: data.address.ru,
    addressEn: data.address.en,
    phone: data.phone,
    email: data.email,
    workingHours: data.workingHours,
    description: data.description ?? '',
    isActive: data.isActive,
  }
}

export function BranchForm({ mode, initialData }: BranchFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t],
  )
  const lang = (i18n.language?.slice(0, 2) ?? 'tk') as 'tk' | 'ru' | 'en'
  const navigate = useNavigate()

  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()
  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => createBranchFormSchema(t), [t, i18n.language])

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, trigger,
  } = useForm<BranchFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )
  const [isValidated, setIsValidated] = useState(false)

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode, t)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited, t])

  const set = useCallback(<K extends keyof BranchFormData>(key: K, value: BranchFormData[K]) => {
    (setValue as (name: K, val: BranchFormData[K]) => void)(key, value)
    clearErrors(key)
  }, [setValue, clearErrors])

  const stepProps = useMemo(() => ({ form, errors, set, t, lang }), [form, errors, set, t, lang])

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]))

  // ── Re-validate on language change ──
  useEffect(() => {
    if (!isValidated) return

    const visitedFields = Array.from(visited).flatMap((stepIdx) => STEP_FIELDS[stepIdx] || [])
    if (visitedFields.length > 0) {
      trigger(visitedFields)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, isValidated])

  const handleNext = async () => {
    setIsValidated(true)
    markVisited(currentStep)

    const fields = STEP_FIELDS[currentStep] || []
    const isValid = await trigger(fields)

    if (!isValid) {
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

  const doSubmit = async () => {
    setIsValidated(true)
    setVisited(new Set(STEPS.map((_, i) => i)))

    const isValid = await trigger()
    if (!isValid) {
      toast.error(t('common.errors.requiredFieldsMissing', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode, t)).length > 0) {
          setCurrentStep(i); break
        }
      }
      return
    }

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      createMutation.mutate(payload, { onSuccess: () => navigate('/settings/location/branches') })
    } else if (initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => navigate('/settings/location/branches') },
      )
    }
  }

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive = i === currentStep
    const hasErrors = stepsWithErrors.has(i)
    const isDone = visited.has(i) && !hasErrors

    return {
      id: s.id,
      title: t(s.titleKey) || s.titleFallback,
      subtitle: s.subtitle,
      icon: s.icon,
      status: isActive ? 'active'
        : hasErrors ? 'error'
        : isDone ? 'done'
        : 'idle',
    }
  })

  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'create' ? t('branches.createTitle', 'Şahamça döretmek') : t('branches.editTitle', 'Şahamçany üýtgetmek')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('branches.form.subtitle', 'Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.')}
        </p>
      </div>

      <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />

      <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tabular-nums">
            {currentStep + 1} / {STEPS.length}
          </span>
          <h2 className="text-sm font-semibold text-foreground">
            {t(STEPS[currentStep].titleKey) || STEPS[currentStep].titleFallback}
          </h2>
        </div>

        <div className="p-5">
          {currentStep === 0 && <StepBasic {...stepProps} />}
          {currentStep === 1 && <StepAddress {...stepProps} />}
          {currentStep === 2 && <StepHours {...stepProps} />}
        </div>

        <FormActions
          isPending={isPending}
          onCancel={currentStep === 0 ? () => navigate(-1) : undefined}
          onPrev={currentStep > 0 ? handleBack : undefined}
          onNext={!isLastStep ? handleNext : undefined}
          showSubmit={isLastStep}
          onSubmit={isLastStep ? doSubmit : undefined}
          submitLabel={mode === 'create'
            ? t('branches.actions.create', 'Şahamça döret')
            : t('branches.actions.update', 'Täzelemek')}
          className="px-5 py-3.5 border-t border-border bg-muted/30"
        />
      </div>
    </div>
  )
}

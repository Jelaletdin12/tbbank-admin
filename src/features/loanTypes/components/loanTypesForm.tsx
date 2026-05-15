import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { Label } from '@/components/ui/label'
import { FormActions } from '@/components/formActions'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateLoanType, useUpdateLoanType } from '../hooks/useLoanTypes'
import type { LoanType } from '../api/loanTypesApi'
import { loanTypeFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/loanType.schema'
import type { LoanTypeFormData } from '../schemas/loanType.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormMode = 'create' | 'edit'

interface LoanTypeFormProps {
  mode: FormMode
  initialData?: LoanType
  loanTypeId?: number
}

type FlatErrors = Partial<Record<keyof LoanTypeFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof LoanTypeFormData] = msg
  }
  return result
}

function mapInitial(data: LoanType): LoanTypeFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    notesTk: data.notes?.tk ?? '',
    notesRu: data.notes?.ru ?? '',
    notesEn: data.notes?.en ?? '',
    tax: String(data.tax),
    loanTerm: String(data.loanTerm),
    isActive: data.isActive,
  }
}

// ─── Language Tab ─────────────────────────────────────────────────────────────

type Lang = 'tk' | 'ru' | 'en'

const LANG_TABS: { key: Lang; label: string }[] = [
  { key: 'tk', label: 'Türkmen' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
]

// ─── LoanTypeForm ─────────────────────────────────────────────────────────────

export function LoanTypeForm({ mode, initialData, loanTypeId }: LoanTypeFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateLoanType()
  const updateMutation = useUpdateLoanType(loanTypeId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const [activeLang, setActiveLang] = useState<Lang>('tk')

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<LoanTypeFormData>({
    resolver: zodResolver(loanTypeFormSchema),
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  const set = useCallback(
    (key: keyof LoanTypeFormData) => (value: string | boolean) => {
      (setValue as (k: keyof LoanTypeFormData, v: string | boolean) => void)(key, value)
      clearErrors(key)
    },
    [setValue, clearErrors],
  )

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      const result = await createMutation.mutateAsync(payload)
      navigate(`/resources/loan-types/${result.id}`)
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/resources/loan-types/${loanTypeId}`)
    }
  }

  const handleCancel = () => navigate('/resources/loan-types')

  // ── Name fields per lang ───────────────────────────────────────────────────
  const nameFields: Record<Lang, { value: string; onChange: (v: string) => void; error?: string }> = {
    tk: { value: form.nameTk, onChange: set('nameTk'), error: errors.nameTk },
    ru: { value: form.nameRu, onChange: set('nameRu'), error: errors.nameRu },
    en: { value: form.nameEn, onChange: set('nameEn'), error: errors.nameEn },
  }

  const notesFields: Record<Lang, { value: string; onChange: (v: string) => void }> = {
    tk: { value: form.notesTk ?? '', onChange: set('notesTk') },
    ru: { value: form.notesRu ?? '', onChange: set('notesRu') },
    en: { value: form.notesEn ?? '', onChange: set('notesEn') },
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {/* Language tabs row */}
      <div className="flex items-center justify-end gap-1 mb-0 pb-0">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveLang(tab.key)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeLang === tab.key
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
        {/* Ady */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="text"
            value={nameFields[activeLang].value}
            onChange={nameFields[activeLang].onChange}
            placeholder={t('loanTypes.fields.name', 'Ady')}
            error={nameFields[activeLang].error}
          />
        </div>

        {/* Salgyt */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.tax', 'Salgyt')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="number"
            value={form.tax}
            onChange={set('tax')}
            placeholder={t('loanTypes.fields.tax', 'Salgyt')}
            error={errors.tax}
          />
        </div>

        {/* Karz möhleti */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.loanTerm', 'Karz möhleti')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <FormInput
            type="number"
            value={form.loanTerm}
            onChange={set('loanTerm')}
            placeholder={t('loanTypes.fields.loanTerm', 'Karz möhleti')}
            error={errors.loanTerm}
          />
        </div>

        {/* Bellikler */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.notes', 'Bellikler')}
          </span>
          <FormInput
            type="text"
            value={notesFields[activeLang].value}
            onChange={notesFields[activeLang].onChange}
            placeholder={t('loanTypes.fields.notes', 'Bellikler')}
          />
        </div>

        {/* Işjeň */}
        <div className="grid grid-cols-[220px_1fr] items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t('loanTypes.fields.isActive', 'Işjeň')}
          </span>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => set('isActive')(!!checked)}
            />
            <Label htmlFor="isActive" className="text-sm text-foreground cursor-pointer">
              {form.isActive
                ? t('common.active', 'Işjeň')
                : t('common.inactive', 'Işjeň däl')}
            </Label>
          </div>
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('loanTypes.actions.create', 'Karz görnüşi dörediň')
          : t('loanTypes.actions.save', 'Ýatda sakla')}
        className="pt-4"
      />
    </div>
  )
}

import {  useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { Label } from '@/components/ui/label'
import { FormActions } from '@/components/formActions'
import { MultiLangInput } from '@/components/multiLangInput'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateLoanType, useUpdateLoanType } from '../hooks/useLoanTypes'
import type { LoanType } from '../api/loanTypesApi'
import { createLoanTypeFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '../schemas/loanType.schema'
import type { LoanTypeFormData } from '../schemas/loanType.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormMode = 'create' | 'edit'

interface LoanTypeFormProps {
  mode: FormMode
  initialData?: LoanType
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

// ─── LoanTypeForm ─────────────────────────────────────────────────────────────

export function LoanTypeForm({ mode, initialData }: LoanTypeFormProps) {
  const { t: _t, i18n } = useTranslation()
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  )
  const navigate = useNavigate()

  const createMutation = useCreateLoanType()
  const updateMutation = useUpdateLoanType(initialData?.id ?? 0)


  const isPending = createMutation.isPending || updateMutation.isPending

  const schema = useMemo(() => createLoanTypeFormSchema(t), [t, i18n.language])

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<LoanTypeFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

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
      navigate(`/resources/loan-types/${initialData!.id}`)
    }
  }

  const handleCancel = () => navigate('/resources/loan-types')

  // ── Name fields per lang ───────────────────────────────────────────────────
  const nameFields = {
    tk: { value: form.nameTk, onChange: set('nameTk'), error: errors.nameTk },
    ru: { value: form.nameRu, onChange: set('nameRu'), error: errors.nameRu },
    en: { value: form.nameEn, onChange: set('nameEn'), error: errors.nameEn },
  }

  const notesFields = {
    tk: { value: form.notesTk ?? '', onChange: set('notesTk') },
    ru: { value: form.notesRu ?? '', onChange: set('notesRu') },
    en: { value: form.notesEn ?? '', onChange: set('notesEn') },
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('loanTypes.createTitle', 'Karz görnüşi dörediň')
          : t('loanTypes.editTitle', 'Karz görnüşi üýtgetmek')}
      </h1>
      <div className="space-y-0">
      {/* Form card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
        {/* Ady */}
        <div className="grid grid-cols-[220px_1fr] items-start px-4 py-4">
          <span className="text-sm text-muted-foreground pt-2">
            {t('loanTypes.fields.name', 'Ady')}
            <span className="text-destructive ml-0.5">*</span>
          </span>
          <MultiLangInput fields={nameFields} placeholder={t('loanTypes.fields.name', 'Ady')} disabled={isPending} />
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
        <div className="grid grid-cols-[220px_1fr] items-start px-4 py-4">
          <span className="text-sm text-muted-foreground pt-2">
            {t('loanTypes.fields.notes', 'Bellikler')}
          </span>
          <MultiLangInput fields={notesFields} placeholder={t('loanTypes.fields.notes', 'Bellikler')} disabled={isPending} />
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
    </div>
  )
}

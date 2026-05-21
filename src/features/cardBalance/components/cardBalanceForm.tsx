import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { type CardBalance } from '@/features/cardBalance/api/cardBalanceApi'
import { useCreateCardBalance, useUpdateCardBalance } from '@/features/cardBalance/hooks/useCardBalance'
import { cardBalanceFormSchema, DEFAULT_FORM_VALUES, buildPayload } from '@/features/cardBalance/schemas/cardBalance.schema'
import type { CardBalanceFormData } from '@/features/cardBalance/schemas/cardBalance.schema'

interface CardBalanceFormProps {
  mode: 'create' | 'edit'
  initialData?: CardBalance
}

type FlatErrors = Partial<Record<keyof CardBalanceFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CardBalanceFormData] = msg
  }
  return result
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I-MR',   label: 'I-MR' },
  { value: 'II-MR',  label: 'II-MR' },
  { value: 'I-LB',   label: 'I-LB' },
  { value: 'II-LB',  label: 'II-LB' },
  { value: 'III-LB', label: 'III-LB' },
  { value: 'I-BN',   label: 'I-BN' },
  { value: 'II-BN',  label: 'II-BN' },
  { value: 'I-AH',   label: 'I-AH' },
  { value: 'I-AS',   label: 'I-AS' },
  { value: 'I-DZ',   label: 'I-DZ' },
  { value: 'II-DZ',  label: 'II-DZ' },
  { value: 'A',      label: 'A' },
  { value: 'B',      label: 'B' },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0')
  return { value: val, label: val }
})

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i)
  return { value: year, label: year }
})

// ─── Component ────────────────────────────────────────────────────────────────

export function CardBalanceForm({ mode, initialData }: CardBalanceFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateCardBalance()
  const updateMutation = useUpdateCardBalance(initialData?.id ?? 0)
  const isPending      = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, setError,
  } = useForm<CardBalanceFormData>({
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...initialData } : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const setField = useCallback((field: keyof CardBalanceFormData) => (value: string) => {
    (setValue as (name: keyof CardBalanceFormData, val: string) => void)(field, value)
    clearErrors(field)
  }, [setValue, clearErrors])

  const errMsg = (msg: string | undefined) =>
    !msg ? undefined : msg.startsWith('validation.') ? t(msg, msg) : msg

  const handleSubmit = async () => {
    const result = cardBalanceFormSchema.safeParse(getValues())
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CardBalanceFormData
        setError(key, { message: issue.message })
      }
      return
    }
    const payload = buildPayload(result.data)
    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/card-balances')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/card-balances/${initialData!.id}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') navigate('/card-balances')
    else navigate(`/card-balances/${initialData!.id}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === 'create'
          ? t('cardBalance.createTitle', 'Kart galyndysy dörediň')
          : t('cardBalance.editTitle', 'Kart galyndysy üýtgetmek')}
      </h1>
      <div className="rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <FormInput
          type="searchable-select"
          label={t('Passport series', 'Pasport seriýasy')}
          value={form.passport_series}
          onChange={setField('passport_series')}
          options={PASSPORT_SERIES_OPTIONS}
          placeholder={t('Select to choose', 'Saýlamak üçin basyň')}
          error={errMsg(errors.passport_series)}
          required
        />
        <FormInput
          type="text"
          label={t('Passport number', 'Pasport belgisi')}
          value={form.passport_number}
          onChange={setField('passport_number')}
          placeholder={t('Passport number', 'Pasport belgisi')}
          error={errMsg(errors.passport_number)}
          required
        />

        {/* Row 2 — card number full width + 2 selects */}
        <FormInput
          type="text"
          label={t('Card number', 'Kart belgisi')}
          value={form.card_number}
          onChange={setField('card_number')}
          placeholder={t('Card number', 'Kart belgisi')}
          error={errMsg(errors.card_number)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            type="select"
            label={t('Card expiry month', 'Kart Möhleti (aý)')}
            value={form.card_expiry_month}
            onChange={setField('card_expiry_month')}
            options={MONTH_OPTIONS}
            placeholder={t('Select', 'Saýlamak üçin basyň')}
            error={errMsg(errors.card_expiry_month)}
            required
          />
          <FormInput
            type="select"
            label={t('Card expiry year', 'Kart Möhleti (ýyl)')}
            value={form.card_expiry_year}
            onChange={setField('card_expiry_year')}
            options={YEAR_OPTIONS}
            placeholder={t('Select', 'Saýlamak üçin basyň')}
            error={errMsg(errors.card_expiry_year)}
            required
          />
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        cancelVariant="ghost"
        cancelLabel={t('Cancel', 'Ýatyr')}
        loadingLabel={t('Saving...', 'Saklanýar...')}
        submitLabel={mode === 'create'
          ? t('Create card balance', 'Kart galyndysy dörediň')
          : t('Save changes', 'Üýtgetmeleri sakla')}
        className="mt-6"
      />
    </div>
    </div>
  )
}
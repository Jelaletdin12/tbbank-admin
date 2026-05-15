// features/currencyRates/components/CurrencyRateForm.tsx

import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { CURRENCY_OPTIONS, type CurrencyRate } from '../api/currencyRatesApi'
import { useCreateCurrencyRate, useUpdateCurrencyRate } from '../hooks/useCurrencyRates'
import {
  currencyRateFormSchema,
  DEFAULT_FORM_VALUES,
  buildPayload,
  type CurrencyRateFormData,
} from '../schemas/currencyRate.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrencyRateFormProps {
  mode:          'create' | 'edit'
  initialData?:  CurrencyRate
  rateId?:       number
}

type FlatErrors = Partial<Record<keyof CurrencyRateFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof CurrencyRateFormData] = msg
  }
  return result
}

// ─── CurrencyRateForm ─────────────────────────────────────────────────────────

export function CurrencyRateForm({ mode, initialData, rateId }: CurrencyRateFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateCurrencyRate()
  const updateMutation = useUpdateCurrencyRate(rateId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<CurrencyRateFormData>({
    resolver: zodResolver(currencyRateFormSchema),
    defaultValues: initialData
      ? {
          currencyFrom: initialData.currencyFrom,
          currencyTo:   initialData.currencyTo,
          value:        String(initialData.value),
        }
      : DEFAULT_FORM_VALUES,
  })

  const form = watch()
  const errors = useMemo(
    () => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>),
    [rhfErrors],
  )

  const setField = useCallback(
    (key: keyof CurrencyRateFormData) => (value: string) => {
      setValue(key, value)
      clearErrors(key)
    },
    [setValue, clearErrors],
  )

  const handleSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/resources/currency-rates')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/resources/currency-rates/${rateId}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') {
      navigate('/resources/currency-rates')
    } else {
      navigate(`/resources/currency-rates/${rateId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Currency From */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('currencyRates.fields.currencyFrom', 'Currency from')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <div className="space-y-1">
          <FormInput
            type="searchable-select"
            value={form.currencyFrom}
            onChange={setField('currencyFrom')}
            options={CURRENCY_OPTIONS}
            placeholder={t('common.selectPlaceholder', 'Saýlamak üçin basyň')}
            error={errors.currencyFrom}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            {t('currencyRates.hints.oneUnit', '1 möçberi')}
          </p>
        </div>
      </div>

      {/* Currency To */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6 border-b border-border">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('currencyRates.fields.currencyTo', 'Currency to')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <FormInput
          type="searchable-select"
          value={form.currencyTo}
          onChange={setField('currencyTo')}
          options={CURRENCY_OPTIONS}
          placeholder={t('common.selectPlaceholder', 'Saýlamak üçin basyň')}
          error={errors.currencyTo}
          disabled={isPending}
        />
      </div>

      {/* Value */}
      <div className="grid grid-cols-[220px_1fr] items-start py-4 px-6">
        <label className="text-sm text-muted-foreground pt-1.5">
          {t('currencyRates.fields.value', 'Value')}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <div className="space-y-1">
          <FormInput
            type="number"
            value={form.value}
            onChange={setField('value')}
            placeholder={t('currencyRates.fields.value', 'Value')}
            error={errors.value}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground italic">
            {t('currencyRates.hints.decimalNote', 'Bitin däl sanlary "." bilen ýazmaly')}
          </p>
        </div>
      </div>

      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        cancelVariant="ghost"
        submitLabel={mode === 'create'
          ? t('currencyRates.actions.create', 'Walýuta kursy dörediň')
          : t('currencyRates.actions.update', 'Ýatda sakla')}
        className="px-6 py-4 border-t border-border"
      />
    </div>
  )
}
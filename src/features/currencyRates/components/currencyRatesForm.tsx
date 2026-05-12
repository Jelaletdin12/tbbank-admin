// features/currencyRates/components/CurrencyRateForm.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { CURRENCY_OPTIONS, type CurrencyCode, type CurrencyRate } from '../api/currencyRatesApi'
import { useCreateCurrencyRate, useUpdateCurrencyRate } from '../hooks/useCurrencyRates'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  currencyFrom: string
  currencyTo:   string
  value:        string
}

interface FormErrors {
  currencyFrom?: string
  currencyTo?:   string
  value?:        string
}

export interface CurrencyRateFormProps {
  mode:          'create' | 'edit'
  initialData?:  CurrencyRate
  rateId?:       number
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, t: (key: string, fallback: string) => string): FormErrors {
  const errors: FormErrors = {}

  if (!form.currencyFrom) {
    errors.currencyFrom = t('currencyRates.errors.currencyFromRequired', 'Walýuta saýlaň')
  }
  if (!form.currencyTo) {
    errors.currencyTo = t('currencyRates.errors.currencyToRequired', 'Walýuta saýlaň')
  }
  if (!form.value.trim()) {
    errors.value = t('currencyRates.errors.valueRequired', 'Bahany giriziň')
  } else if (isNaN(Number(form.value)) || Number(form.value) <= 0) {
    errors.value = t('currencyRates.errors.valueInvalid', 'Baha 0-dan uly bolmaly')
  }

  return errors
}

// ─── CurrencyRateForm ─────────────────────────────────────────────────────────

export function CurrencyRateForm({ mode, initialData, rateId }: CurrencyRateFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    currencyFrom: initialData?.currencyFrom ?? '',
    currencyTo:   initialData?.currencyTo   ?? '',
    value:        initialData?.value != null ? String(initialData.value) : '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const createMutation = useCreateCurrencyRate()
  const updateMutation = useUpdateCurrencyRate(rateId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // Sync form when initialData loads (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        currencyFrom: initialData.currencyFrom,
        currencyTo:   initialData.currencyTo,
        value:        String(initialData.value),
      })
    }
  }, [mode, initialData])

  const setField = (field: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }))
    // Clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validate(form, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload = {
      currencyFrom: form.currencyFrom as CurrencyCode,
      currencyTo:   form.currencyTo   as CurrencyCode,
      value:        Number(form.value),
    }

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

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending
            ? t('common.saving', 'Saklanýar...')
            : mode === 'create'
              ? t('currencyRates.actions.create', 'Walýuta kursy dörediň')
              : t('currencyRates.actions.update', 'Ýatda sakla')}
        </Button>
      </div>
    </div>
  )
}
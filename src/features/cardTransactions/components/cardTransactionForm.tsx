import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/formInput'
import type { CardTransaction } from '../api/cardTransactionsApi'
import { useCreateCardTransaction, useUpdateCardTransaction } from '../hooks/useCardTransactions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardTransactionFormProps {
  mode: 'create' | 'edit'
  initialData?: CardTransaction
  cardTransactionId?: number
}

interface FormState {
  passport_series: string
  passport_number: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
}

interface FormErrors {
  passport_series?: string
  passport_number?: string
  card_number?: string
  card_expiry_month?: string
  card_expiry_year?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I-LB', label: 'I-LB' },
  { value: 'II-LB', label: 'II-LB' },
  { value: 'III-LB', label: 'III-LB' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0')
  return { value: val, label: val }
})

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i)
  return { value: year, label: year }
})

const EMPTY_FORM: FormState = {
  passport_series: '',
  passport_number: '',
  card_number: '',
  card_expiry_month: '',
  card_expiry_year: '',
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, t: (k: string, fallback: string) => string): FormErrors {
  const errors: FormErrors = {}

  if (!form.passport_series)
    errors.passport_series = t('Passport series is required', 'Pasport seriýasy hökmanydyr')
  if (!form.passport_number)
    errors.passport_number = t('Passport number is required', 'Pasport belgisi hökmanydyr')
  if (!form.card_number)
    errors.card_number = t('Card number is required', 'Kart belgisi hökmanydyr')
  if (!form.card_expiry_month)
    errors.card_expiry_month = t('Expiry month is required', 'Möhleti (aý) hökmanydyr')
  if (!form.card_expiry_year)
    errors.card_expiry_year = t('Expiry year is required', 'Möhleti (ýyl) hökmanydyr')

  return errors
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardTransactionForm({
  mode,
  initialData,
  cardTransactionId,
}: CardTransactionFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const createMutation = useCreateCardTransaction()
  const updateMutation = useUpdateCardTransaction(cardTransactionId ?? 0)

  const isPending = createMutation.isPending || updateMutation.isPending

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        passport_series: initialData.passport_series,
        passport_number: initialData.passport_number,
        card_number: initialData.card_number,
        card_expiry_month: initialData.card_expiry_month,
        card_expiry_year: initialData.card_expiry_year,
      })
    }
  }, [mode, initialData])

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validate(form, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (mode === 'create') {
      await createMutation.mutateAsync(form)
      navigate('/card-transactions')
    } else {
      await updateMutation.mutateAsync(form)
      navigate(`/card-transactions/${cardTransactionId}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') {
      navigate('/card-transactions')
    } else {
      navigate(`/card-transactions/${cardTransactionId}`)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Passport Series */}
        <FormInput
          type="searchable-select"
          label={t('Passport series', 'Pasport seriýasy')}
          value={form.passport_series}
          onChange={setField('passport_series')}
          options={PASSPORT_SERIES_OPTIONS}
          placeholder={t('Select to choose', 'Saýlamak üçin basyň')}
          error={errors.passport_series}
          required
        />

        {/* Passport Number */}
        <FormInput
          type="text"
          label={t('Passport number', 'Pasport belgisi')}
          value={form.passport_number}
          onChange={setField('passport_number')}
          placeholder={t('Passport number', 'Pasport belgisi')}
          error={errors.passport_number}
          required
        />

        {/* Card Number */}
        <FormInput
          type="text"
          label={t('Card number', 'Kart belgisi')}
          value={form.card_number}
          onChange={setField('card_number')}
          placeholder={t('Card number', 'Kart belgisi')}
          error={errors.card_number}
          required
        />

        {/* Expiry Month + Year side by side */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            type="select"
            label={t('Card expiry month', 'Kart Möhleti (aý)')}
            value={form.card_expiry_month}
            onChange={setField('card_expiry_month')}
            options={MONTH_OPTIONS}
            placeholder={t('Select to choose', 'Saýlamak üçin basyň')}
            error={errors.card_expiry_month}
            required
          />

          <FormInput
            type="select"
            label={t('Card expiry year', 'Kart Möhleti (ýyl)')}
            value={form.card_expiry_year}
            onChange={setField('card_expiry_year')}
            options={YEAR_OPTIONS}
            placeholder={t('Select to choose', 'Saýlamak üçin basyň')}
            error={errors.card_expiry_year}
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={handleCancel} disabled={isPending}>
          {t('Cancel', 'Ýatyr')}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending
            ? t('Saving...', 'Saklanýar...')
            : mode === 'create'
            ? t('Create card transaction', 'Kart herekedi dörediň')
            : t('Save changes', 'Üýtgetmeleri sakla')}
        </Button>
      </div>
    </div>
  )
}

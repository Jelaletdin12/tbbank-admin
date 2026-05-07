import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/formInput'
import { type CardBalance } from '@/features/cardBalance/api/cardBalanceApi'
import { useCreateCardBalance, useUpdateCardBalance } from '@/features/cardBalance/hooks/useCardBalance'

interface CardBalanceFormProps {
  mode: 'create' | 'edit'
  initialData?: CardBalance
  cardBalanceId?: number
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
  if (!form.passport_series)   errors.passport_series   = t('Required', 'Pasport seriýasy hökmanydyr')
  if (!form.passport_number)   errors.passport_number   = t('Required', 'Pasport belgisi hökmanydyr')
  if (!form.card_number)       errors.card_number       = t('Required', 'Kart belgisi hökmanydyr')
  if (!form.card_expiry_month) errors.card_expiry_month = t('Required', 'Möhleti (aý) hökmanydyr')
  if (!form.card_expiry_year)  errors.card_expiry_year  = t('Required', 'Möhleti (ýyl) hökmanydyr')
  return errors
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardBalanceForm({ mode, initialData, cardBalanceId }: CardBalanceFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm]     = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const createMutation = useCreateCardBalance()
  const updateMutation = useUpdateCardBalance(cardBalanceId ?? 0)
  const isPending      = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        passport_series:   initialData.passport_series,
        passport_number:   initialData.passport_number,
        card_number:       initialData.card_number,
        card_expiry_month: initialData.card_expiry_month,
        card_expiry_year:  initialData.card_expiry_year,
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
      navigate('/card-balances')
    } else {
      await updateMutation.mutateAsync(form)
      navigate(`/card-balances/${cardBalanceId}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') navigate('/card-balances')
    else navigate(`/card-balances/${cardBalanceId}`)
  }

  return (
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
          error={errors.passport_series}
          required
        />
        <FormInput
          type="text"
          label={t('Passport number', 'Pasport belgisi')}
          value={form.passport_number}
          onChange={setField('passport_number')}
          placeholder={t('Passport number', 'Pasport belgisi')}
          error={errors.passport_number}
          required
        />

        {/* Row 2 — card number full width + 2 selects */}
        <FormInput
          type="text"
          label={t('Card number', 'Kart belgisi')}
          value={form.card_number}
          onChange={setField('card_number')}
          placeholder={t('Card number', 'Kart belgisi')}
          error={errors.card_number}
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
            error={errors.card_expiry_month}
            required
          />
          <FormInput
            type="select"
            label={t('Card expiry year', 'Kart Möhleti (ýyl)')}
            value={form.card_expiry_year}
            onChange={setField('card_expiry_year')}
            options={YEAR_OPTIONS}
            placeholder={t('Select', 'Saýlamak üçin basyň')}
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
            ? t('Create card balance', 'Kart galyndysy dörediň')
            : t('Save changes', 'Üýtgetmeleri sakla')}
        </Button>
      </div>
    </div>
  )
}
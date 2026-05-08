import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CardPinItem, CardPinCreatePayload } from '@/features/cardPins/api/cardPinApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardPinFormProps {
  mode: 'create' | 'edit'
  initialData?: CardPinItem
  onSubmit: (payload: CardPinCreatePayload) => void
  isSubmitting: boolean
}

interface FormState {
  status: string
  note: string
  card_type: string
  card_number: string
  province: string
  branch: string
  first_name: string
  last_name: string
  father_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
  passport_file_1: File | null
  passport_file_2: File | null
  passport_file_3: File | null
  passport_file_4: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklandy' },
  { value: 'rejected', label: 'Ret edildi' },
]

// These would typically come from API — using static options as placeholder
const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr' },
  { value: 'visa',       label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',    label: 'I' },
  { value: 'II',   label: 'II' },
  { value: 'I-MR', label: 'I-MR' },
  { value: 'II-MR',label: 'II-MR' },
]

const PROVINCE_OPTIONS = [
  { value: 'ashgabat', label: 'Aşgabat' },
  { value: 'mary',     label: 'Mary' },
  { value: 'dasoguz',  label: 'Daşoguz' },
  { value: 'lebap',    label: 'Lebap' },
  { value: 'balkan',   label: 'Balkan' },
  { value: 'ahal',     label: 'Ahal' },
]

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: FormState = {
  status:          'pending',
  note:            '',
  card_type:       '',
  card_number:     '',
  province:        '',
  branch:          '',
  first_name:      '',
  last_name:       '',
  father_name:     '',
  birth_date:      '',
  phone:           '',
  passport_series: '',
  passport_number: '',
  passport_file_1: null,
  passport_file_2: null,
  passport_file_3: null,
  passport_file_4: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, mode: 'create' | 'edit'): FormErrors {
  const errors: FormErrors = {}

  if (!form.status)          errors.status          = 'Status hökmany'
  if (!form.card_type)       errors.card_type       = 'Kart görnüşi hökmany'
  if (!form.card_number)     errors.card_number     = 'Kart belgisi hökmany'
  if (!form.province)        errors.province        = 'Welaýat hökmany'
  if (!form.branch)          errors.branch          = 'Şahamça hökmany'
  if (!form.first_name)      errors.first_name      = 'Ady hökmany'
  if (!form.last_name)       errors.last_name       = 'Familiýasy hökmany'
  if (!form.birth_date)      errors.birth_date      = 'Doglan güni hökmany'
  if (!form.phone)           errors.phone           = 'Telefon hökmany'
  if (!form.passport_series) errors.passport_series = 'Pasport seriýasy hökmany'
  if (!form.passport_number) errors.passport_number = 'Pasport belgisi hökmany'

  if (mode === 'create') {
    if (!form.passport_file_1) errors.passport_file_1 = 'Pasport (sahypa 1) hökmany'
    if (!form.passport_file_2) errors.passport_file_2 = 'Pasport (2-3-nji sahypa) hökmany'
    if (!form.passport_file_3) errors.passport_file_3 = 'Pasport (8-9 sahypa) hökmany'
    if (!form.passport_file_4) errors.passport_file_4 = 'Pasport (32-nji sahypa) hökmany'
  }

  return errors
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardPinForm({ mode, initialData, onSubmit, isSubmitting }: CardPinFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})

  // Hydrate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        status:          initialData.status,
        note:            initialData.note ?? '',
        card_type:       initialData.card_type,
        card_number:     initialData.card_number,
        province:        initialData.province,
        branch:          initialData.branch,
        first_name:      initialData.first_name,
        last_name:       initialData.last_name,
        father_name:     initialData.father_name,
        birth_date:      initialData.birth_date,
        phone:           initialData.phone,
        passport_series: initialData.passport_series,
        passport_number: initialData.passport_number,
        passport_file_1: null,
        passport_file_2: null,
        passport_file_3: null,
        passport_file_4: null,
      })
    }
  }, [mode, initialData])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = () => {
    const errs = validate(form, mode)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onSubmit({
      status:          form.status as CardPinCreatePayload['status'],
      note:            form.note,
      card_type:       form.card_type,
      card_number:     form.card_number,
      province:        form.province,
      branch:          form.branch,
      first_name:      form.first_name,
      last_name:       form.last_name,
      father_name:     form.father_name,
      birth_date:      form.birth_date,
      phone:           form.phone,
      passport_series: form.passport_series,
      passport_number: form.passport_number,
      passport_file_1: form.passport_file_1,
      passport_file_2: form.passport_file_2,
      passport_file_3: form.passport_file_3,
      passport_file_4: form.passport_file_4,
    })
  }

  const title = mode === 'create'
    ? t('cardPin.create', 'Kart pin bukja dörediň')
    : t('cardPin.edit',   'Kart pin bukja redaktirläň')

  const submitLabel = mode === 'create'
    ? t('cardPin.createBtn', 'Kart pin bukja dörediň')
    : t('cardPin.editBtn',   'Kart pin bukja redaktirläň')

  return (
    <div className=" mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      {/* ── Status & Note ────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <FormInput
          type="select"
          label={t('cardPin.status', 'Status')}
          value={form.status}
          onChange={(v) => set('status', v)}
          options={STATUS_OPTIONS}
          error={errors.status}
          required
        />
        <FormInput
          type="text"
          label={t('cardPin.note', 'Bellik')}
          value={form.note}
          onChange={(v) => set('note', v)}
          placeholder={t('cardPin.notePlaceholder', 'Bellik')}
        />
      </section>

      {/* ── Kart ─────────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t('cardPin.cardSection', 'Kart')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('cardPin.cardType', 'Kart görnüşi')}
            value={form.card_type}
            onChange={(v) => set('card_type', v)}
            options={CARD_TYPE_OPTIONS}
            error={errors.card_type}
            required
          />
          <FormInput
            type="text"
            label={t('cardPin.cardNumber', 'Kart belgisi')}
            value={form.card_number}
            onChange={(v) => set('card_number', v)}
            placeholder={t('cardPin.cardNumberPlaceholder', 'Kart belgisi')}
            error={errors.card_number}
            required
          />
        </div>
      </section>

      {/* ── Lokasiýa ─────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t('cardPin.locationSection', 'Lokasiýa')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('cardPin.province', 'Welaýat')}
            value={form.province}
            onChange={(v) => { set('province', v); set('branch', '') }}
            options={PROVINCE_OPTIONS}
            error={errors.province}
            required
          />
          <FormInput
            type="searchable-select"
            label={t('cardPin.branch', 'Şahamça')}
            value={form.branch}
            onChange={(v) => set('branch', v)}
            options={[]} // Populated dynamically based on province from API
            placeholder={t('cardPin.branchPlaceholder', 'Saýlamak üçin basyň')}
            error={errors.branch}
            required
          />
        </div>
      </section>

      {/* ── Şahsy maglumatlar ─────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t('cardPin.personalSection', 'Şahsy maglumatlar')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            type="text"
            label={t('cardPin.firstName', 'Ady')}
            value={form.first_name}
            onChange={(v) => set('first_name', v)}
            placeholder={t('cardPin.firstName', 'Ady')}
            error={errors.first_name}
            required
          />
          <FormInput
            type="text"
            label={t('cardPin.lastName', 'Familiýasy')}
            value={form.last_name}
            onChange={(v) => set('last_name', v)}
            placeholder={t('cardPin.lastName', 'Familiýasy')}
            error={errors.last_name}
            required
          />
          <FormInput
            type="text"
            label={t('cardPin.fatherName', 'Atasynyň ady')}
            value={form.father_name}
            onChange={(v) => set('father_name', v)}
            placeholder={t('cardPin.fatherName', 'Atasynyň ady')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <FormInput
            type="date"
            label={t('cardPin.birthDate', 'Doglan güni')}
            value={form.birth_date}
            onChange={(v) => set('birth_date', v)}
            error={errors.birth_date}
            required
          />
          <FormInput
            type="phone"
            label={t('cardPin.phone', 'Telefon')}
            value={form.phone}
            onChange={(v) => set('phone', v)}
            error={errors.phone}
            required
          />
        </div>
      </section>

      {/* ── Pasport ───────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t('cardPin.passportSection', 'Pasport')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <FormInput
            type="searchable-select"
            label={t('cardPin.passportSeries', 'Pasport seriýasy')}
            value={form.passport_series}
            onChange={(v) => set('passport_series', v)}
            options={PASSPORT_SERIES_OPTIONS}
            error={errors.passport_series}
            required
          />
          <FormInput
            type="text"
            label={t('cardPin.passportNumber', 'Pasport belgisi')}
            value={form.passport_number}
            onChange={(v) => set('passport_number', v)}
            placeholder={t('cardPin.passportNumber', 'Pasport belgisi')}
            error={errors.passport_number}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="file"
            label={t('cardPin.passportFile1', 'Pasport (sahypa 1)')}
            onFileChange={(f) => set('passport_file_1', f)}
            fileValue={form.passport_file_1}
            accept="image/*,.pdf"
            error={errors.passport_file_1}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('cardPin.passportFile2', 'Pasport (2-3-nji sahypa)')}
            onFileChange={(f) => set('passport_file_2', f)}
            fileValue={form.passport_file_2}
            accept="image/*,.pdf"
            error={errors.passport_file_2}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('cardPin.passportFile3', 'Pasport (8-9 sahypa)')}
            onFileChange={(f) => set('passport_file_3', f)}
            fileValue={form.passport_file_3}
            accept="image/*,.pdf"
            error={errors.passport_file_3}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('cardPin.passportFile4', 'Pasport (32-nji sahypa)')}
            onFileChange={(f) => set('passport_file_4', f)}
            fileValue={form.passport_file_4}
            accept="image/*,.pdf"
            error={errors.passport_file_4}
            required={mode === 'create'}
          />
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/card-pins')}
          disabled={isSubmitting}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[180px]"
        >
          {isSubmitting ? (
            <Spinner className="size-4" />
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  )
}
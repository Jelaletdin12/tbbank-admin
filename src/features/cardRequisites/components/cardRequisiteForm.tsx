import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/formInput'
import type { CardRequisite, CardRequisiteStatus, CreateCardRequisitePayload } from '../api/cardRequisitesApi'
import { useCreateCardRequisite, useUpdateCardRequisite } from '../hooks/useCardRequisites'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardRequisiteFormProps {
  mode: 'create' | 'edit'
  initialData?: CardRequisite
  cardRequisiteId?: string
}

interface FormState {
  status: string
  note: string
  card_type: string
  card_number: string
  card_expiry_month: string
  card_expiry_year: string
  province_id: string
  branch_id: string
  first_name: string
  last_name: string
  middle_name: string
  birth_date: string
  phone: string
  passport_series: string
  passport_number: string
}

interface FileState {
  passport_page1: File | null
  passport_page2_3: File | null
  passport_page8_9: File | null
  passport_page32: File | null
}

interface FormErrors {
  status?: string
  card_type?: string
  card_number?: string
  card_expiry_month?: string
  card_expiry_year?: string
  province_id?: string
  branch_id?: string
  first_name?: string
  last_name?: string
  birth_date?: string
  phone?: string
  passport_series?: string
  passport_number?: string
  passport_page1?: string
  passport_page2_3?: string
  passport_page8_9?: string
  passport_page32?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklanan' },
  { value: 'rejected', label: 'Ret edilen' },
]

const CARD_TYPE_OPTIONS = [
  { value: 'altyn_asyr', label: 'Altyn Asyr' },
  { value: 'visa',       label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I-MR',   label: 'I-MR' },
  { value: 'II-MR',  label: 'II-MR' },
  { value: 'I-LB',   label: 'I-LB' },
  { value: 'II-LB',  label: 'II-LB' },
  { value: 'III-LB', label: 'III-LB' },
  { value: 'A',      label: 'A' },
  { value: 'B',      label: 'B' },
]

const PROVINCE_OPTIONS = [
  { value: '1', label: 'Aşgabat' },
  { value: '2', label: 'Ahal' },
  { value: '3', label: 'Balkan' },
  { value: '4', label: 'Daşoguz' },
  { value: '5', label: 'Lebap' },
  { value: '6', label: 'Mary' },
]

const BRANCH_OPTIONS: Record<string, { value: string; label: string }[]> = {
  '1': [{ value: '11', label: 'Köpetdag' }, { value: '12', label: 'Çandybil' }, { value: '13', label: 'Büzmeyin' }],
  '2': [{ value: '21', label: 'Änew' },     { value: '22', label: 'Tejen' }],
  '3': [{ value: '31', label: 'Balkanabat' }, { value: '32', label: 'Türkmenbaşy' }],
  '4': [{ value: '41', label: 'Daşoguz ş.' }, { value: '42', label: 'Köneürgenç' }],
  '5': [{ value: '51', label: 'Türkmenabat' }, { value: '52', label: 'Hazar' }],
  '6': [{ value: '61', label: 'Mary ş.' }, { value: '62', label: 'Ýolöten' }, { value: '63', label: 'Şatlyk' }],
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0')
  return { value: val, label: val }
})

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i)
  return { value: year, label: year }
})

const EMPTY_FORM: FormState = {
  status: 'pending',
  note: '',
  card_type: '',
  card_number: '',
  card_expiry_month: '',
  card_expiry_year: '',
  province_id: '',
  branch_id: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  birth_date: '',
  phone: '',
  passport_series: '',
  passport_number: '',
}

const EMPTY_FILES: FileState = {
  passport_page1: null,
  passport_page2_3: null,
  passport_page8_9: null,
  passport_page32: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  form: FormState,
  files: FileState,
  mode: 'create' | 'edit',
  t: (k: string, fallback: string) => string,
): FormErrors {
  const errors: FormErrors = {}

  if (!form.status)           errors.status           = t('Status is required', 'Status hökmanydyr')
  if (!form.card_type)        errors.card_type        = t('Card type is required', 'Görnüşi hökmanydyr')
  if (!form.card_number)      errors.card_number      = t('Card number is required', 'Kart belgisi hökmanydyr')
  if (!form.card_expiry_month) errors.card_expiry_month = t('Expiry month is required', 'Möhleti (aý) hökmanydyr')
  if (!form.card_expiry_year) errors.card_expiry_year = t('Expiry year is required', 'Möhleti (ýyl) hökmanydyr')
  if (!form.province_id)      errors.province_id      = t('Province is required', 'Welaýat hökmanydyr')
  if (!form.branch_id)        errors.branch_id        = t('Branch is required', 'Şahamça hökmanydyr')
  if (!form.first_name)       errors.first_name       = t('First name is required', 'Ady hökmanydyr')
  if (!form.last_name)        errors.last_name        = t('Last name is required', 'Familiýasy hökmanydyr')
  if (!form.birth_date)       errors.birth_date       = t('Birth date is required', 'Doglan güni hökmanydyr')
  if (!form.phone)            errors.phone            = t('Phone is required', 'Telefon hökmanydyr')
  if (!form.passport_series)  errors.passport_series  = t('Passport series is required', 'Pasport seriýasy hökmanydyr')
  if (!form.passport_number)  errors.passport_number  = t('Passport number is required', 'Pasport belgisi hökmanydyr')

  // Files only required on create
  if (mode === 'create') {
    if (!files.passport_page1)   errors.passport_page1   = t('Required', 'Hökmanydyr')
    if (!files.passport_page2_3) errors.passport_page2_3 = t('Required', 'Hökmanydyr')
    if (!files.passport_page8_9) errors.passport_page8_9 = t('Required', 'Hökmanydyr')
    if (!files.passport_page32)  errors.passport_page32  = t('Required', 'Hökmanydyr')
  }

  return errors
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground mt-6 mb-3">{children}</h2>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardRequisiteForm({
  mode,
  initialData,
  cardRequisiteId,
}: CardRequisiteFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm]   = useState<FormState>(EMPTY_FORM)
  const [files, setFiles] = useState<FileState>(EMPTY_FILES)
  const [errors, setErrors] = useState<FormErrors>({})

  const createMutation = useCreateCardRequisite()
  const updateMutation = useUpdateCardRequisite(cardRequisiteId ?? '')

  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        status:            initialData.status,
        note:              initialData.note,
        card_type:         initialData.card_type,
        card_number:       initialData.card_number,
        card_expiry_month: initialData.card_expiry_month,
        card_expiry_year:  initialData.card_expiry_year,
        province_id:       initialData.province_id,
        branch_id:         initialData.branch_id,
        first_name:        initialData.first_name,
        last_name:         initialData.last_name,
        middle_name:       initialData.middle_name,
        birth_date:        initialData.birth_date,
        phone:             initialData.phone,
        passport_series:   initialData.passport_series,
        passport_number:   initialData.passport_number,
      })
    }
  }, [mode, initialData])

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Reset branch when province changes
      if (field === 'province_id') next.branch_id = ''
      return next
    })
    if (errors[field as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setFile = (field: keyof FileState) => (file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }))
    if (errors[field as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validate(form, files, mode, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload: CreateCardRequisitePayload = {
      ...(form as unknown as CreateCardRequisitePayload),
      status: form.status as CardRequisiteStatus,
      ...(files.passport_page1   && { passport_page1:   files.passport_page1 }),
      ...(files.passport_page2_3 && { passport_page2_3: files.passport_page2_3 }),
      ...(files.passport_page8_9 && { passport_page8_9: files.passport_page8_9 }),
      ...(files.passport_page32  && { passport_page32:  files.passport_page32 }),
    }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      navigate('/card-requisites')
    } else {
      await updateMutation.mutateAsync(payload)
      navigate(`/card-requisites/${cardRequisiteId}`)
    }
  }

  const handleCancel = () => {
    if (mode === 'create') navigate('/card-requisites')
    else navigate(`/card-requisites/${cardRequisiteId}`)
  }

  const branchOptions = BRANCH_OPTIONS[form.province_id] ?? []

  return (
    <div className="space-y-0">
      {/* ── General ── */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            type="select"
            label={t('Status', 'Status')}
            value={form.status}
            onChange={setField('status')}
            options={STATUS_OPTIONS}
            error={errors.status}
            required
          />
          <FormInput
            type="text"
            label={t('Note', 'Bellik')}
            value={form.note}
            onChange={setField('note')}
            placeholder={t('Note', 'Bellik')}
          />
        </div>
      </div>

      {/* ── Kart ── */}
      <SectionTitle>{t('Card', 'Kart')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormInput
            type="select"
            label={t('Card type', 'Görnüşi')}
            value={form.card_type}
            onChange={setField('card_type')}
            options={CARD_TYPE_OPTIONS}
            placeholder="—"
            error={errors.card_type}
            required
          />
          <FormInput
            type="text"
            label={t('Card number', 'Kart belgisi')}
            value={form.card_number}
            onChange={setField('card_number')}
            placeholder={t('Card number', 'Kart belgisi')}
            error={errors.card_number}
            required
          />
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

      {/* ── Lokasiýa ── */}
      <SectionTitle>{t('Location', 'Lokasiýa')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            type="select"
            label={t('Province', 'Welaýat')}
            value={form.province_id}
            onChange={setField('province_id')}
            options={PROVINCE_OPTIONS}
            placeholder={t('Ashgabat', 'Aşgabat')}
            error={errors.province_id}
            required
          />
          <FormInput
            type="searchable-select"
            label={t('Branch', 'Şahamça')}
            value={form.branch_id}
            onChange={setField('branch_id')}
            options={branchOptions}
            placeholder={t('Select', 'Saýlamak üçin basyň')}
            error={errors.branch_id}
            disabled={!form.province_id}
            required
          />
        </div>
      </div>

      {/* ── Şahsy maglumatlar ── */}
      <SectionTitle>{t('Personal information', 'Şahsy maglumatlar')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            type="text"
            label={t('First name', 'Ady')}
            value={form.first_name}
            onChange={setField('first_name')}
            placeholder={t('First name', 'Ady')}
            error={errors.first_name}
            required
          />
          <FormInput
            type="text"
            label={t('Last name', 'Familiýasy')}
            value={form.last_name}
            onChange={setField('last_name')}
            placeholder={t('Last name', 'Familiýasy')}
            error={errors.last_name}
            required
          />
          <FormInput
            type="text"
            label={t("Father's name", 'Atasynyň ady')}
            value={form.middle_name}
            onChange={setField('middle_name')}
            placeholder={t("Father's name", 'Atasynyň ady')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            type="date"
            label={t('Birth date', 'Doglan güni')}
            value={form.birth_date}
            onChange={setField('birth_date')}
            error={errors.birth_date}
            required
          />
          <FormInput
            type="phone"
            label={t('Phone', 'Telefon')}
            value={form.phone}
            onChange={setField('phone')}
            placeholder="63 21 87 04"
            error={errors.phone}
            required
          />
        </div>
      </div>

      {/* ── Pasport ── */}
      <SectionTitle>{t('Passport', 'Pasport')}</SectionTitle>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('Passport series', 'Pasport seriýasy')}
            value={form.passport_series}
            onChange={setField('passport_series')}
            options={PASSPORT_SERIES_OPTIONS}
            placeholder={t('Select', 'Saýlamak üçin basyň')}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            type="file"
            label={t('Passport (page 1)', 'Pasport (sahypa 1)')}
            accept="image/*,.pdf"
            fileValue={files.passport_page1}
            onFileChange={setFile('passport_page1')}
            error={errors.passport_page1}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('Passport (pages 2-3)', 'Pasport (2-3-nji sahypa)')}
            accept="image/*,.pdf"
            fileValue={files.passport_page2_3}
            onFileChange={setFile('passport_page2_3')}
            error={errors.passport_page2_3}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('Passport (pages 8-9)', 'Pasport (8-9 sahypa)')}
            accept="image/*,.pdf"
            fileValue={files.passport_page8_9}
            onFileChange={setFile('passport_page8_9')}
            error={errors.passport_page8_9}
            required={mode === 'create'}
          />
          <FormInput
            type="file"
            label={t('Passport (page 32)', 'Pasport (32-nji sahypa)')}
            accept="image/*,.pdf"
            fileValue={files.passport_page32}
            onFileChange={setFile('passport_page32')}
            error={errors.passport_page32}
            required={mode === 'create'}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={handleCancel} disabled={isPending}>
          {t('Cancel', 'Ýatyr')}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending
            ? t('Saving...', 'Saklanýar...')
            : mode === 'create'
            ? t('Create card requisite order', 'Kart rekwiziti üçin sargyt dörediň')
            : t('Save changes', 'Üýtgetmeleri sakla')}
        </Button>
      </div>
    </div>
  )
}

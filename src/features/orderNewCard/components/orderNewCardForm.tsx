import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import type { SelectOption } from '@/components/formInput'
import type {
  CardOrder,
  CardOrderStatus,
  CreateCardOrderPayload,
} from '../api/orderNewCardApi'
import {
  useCardIssuanceReasons,
  useCardTypes,
  useProvinces,
  useBranches,
  useCreateCardOrder,
  useUpdateCardOrder,
} from '../hooks/useOrderNewCard'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardOrderFormProps {
  mode: 'create' | 'edit'
  initialData?: CardOrder
  cardOrderId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormState {
  isPaid: boolean
  status: CardOrderStatus | ''
  note: string

  issuanceReasonId: string
  cardTypeId: string
  provinceId: string
  branchId: string

  firstName: string
  lastName: string
  middleName: string
  formerLastName: string
  birthDate: string
  phone: string
  phoneExtra: string
  citizenship: string
  registeredAddress: string
  currentAddress: string
  workplace: string

  passportSeriesId: string
  passportNumber: string
  passportIssueDate: string
  passportIssuedBy: string
  passportBirthPlace: string

  passportPage1: File | null
  passportPage23: File | null
  passportPage89: File | null
  passportPage32: File | null

  termsAccepted: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Initial state ────────────────────────────────────────────────────────────

function getInitialState(data?: CardOrder): FormState {
  return {
    isPaid:            data?.isPaid            ?? false,
    status:            data?.status            ?? '',
    note:              data?.note              ?? '',

    issuanceReasonId:  data?.issuanceReasonId  ? String(data.issuanceReasonId) : '',
    cardTypeId:        data?.cardTypeId        ? String(data.cardTypeId)        : '',
    provinceId:        data?.provinceId        ? String(data.provinceId)        : '',
    branchId:          data?.branchId          ? String(data.branchId)          : '',

    firstName:         data?.firstName         ?? '',
    lastName:          data?.lastName          ?? '',
    middleName:        data?.middleName        ?? '',
    formerLastName:    data?.formerLastName     ?? '',
    birthDate:         data?.birthDate         ?? '',
    phone:             data?.phone             ?? '',
    phoneExtra:        data?.phoneExtra        ?? '',
    citizenship:       data?.citizenship       ?? 'Turkmenistan',
    registeredAddress: data?.registeredAddress ?? '',
    currentAddress:    data?.currentAddress    ?? '',
    workplace:         data?.workplace         ?? '',

    passportSeriesId:  data?.passportSeriesId  ? String(data.passportSeriesId) : '',
    passportNumber:    data?.passportNumber    ?? '',
    passportIssueDate: data?.passportIssueDate ?? '',
    passportIssuedBy:  data?.passportIssuedBy  ?? '',
    passportBirthPlace:data?.passportBirthPlace?? '',

    passportPage1:  null,
    passportPage23: null,
    passportPage89: null,
    passportPage32: null,

    termsAccepted: false,
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, mode: 'create' | 'edit', t: (k: string, fb: string) => string): FormErrors {
  const errors: FormErrors = {}
  const req = (field: keyof FormState, msg: string) => {
    const v = form[field]
    if (!v || (typeof v === 'string' && !v.trim())) errors[field] = msg
  }

  req('status',            t('validation.required', 'Bu meýdan hökmanydyr'))
  req('issuanceReasonId',  t('validation.required', 'Bu meýdan hökmanydyr'))
  req('cardTypeId',        t('validation.required', 'Bu meýdan hökmanydyr'))
  req('provinceId',        t('validation.required', 'Bu meýdan hökmanydyr'))
  req('branchId',          t('validation.required', 'Bu meýdan hökmanydyr'))
  req('firstName',         t('validation.required', 'Bu meýdan hökmanydyr'))
  req('lastName',          t('validation.required', 'Bu meýdan hökmanydyr'))
  req('birthDate',         t('validation.required', 'Bu meýdan hökmanydyr'))
  req('phone',             t('validation.required', 'Bu meýdan hökmanydyr'))
  req('citizenship',       t('validation.required', 'Bu meýdan hökmanydyr'))
  req('registeredAddress', t('validation.required', 'Bu meýdan hökmanydyr'))
  req('currentAddress',    t('validation.required', 'Bu meýdan hökmanydyr'))
  req('workplace',         t('validation.required', 'Bu meýdan hökmanydyr'))
  req('passportSeriesId',  t('validation.required', 'Bu meýdan hökmanydyr'))
  req('passportNumber',    t('validation.required', 'Bu meýdan hökmanydyr'))
  req('passportIssueDate', t('validation.required', 'Bu meýdan hökmanydyr'))
  req('passportIssuedBy',  t('validation.required', 'Bu meýdan hökmanydyr'))
  req('passportBirthPlace',t('validation.required', 'Bu meýdan hökmanydyr'))

  if (mode === 'create') {
    if (!form.passportPage1)  errors.passportPage1  = t('validation.required', 'Bu meýdan hökmanydyr')
    if (!form.passportPage23) errors.passportPage23 = t('validation.required', 'Bu meýdan hökmanydyr')
    if (!form.passportPage89) errors.passportPage89 = t('validation.required', 'Bu meýdan hökmanydyr')
    if (!form.passportPage32) errors.passportPage32 = t('validation.required', 'Bu meýdan hökmanydyr')
    if (!form.termsAccepted)  errors.termsAccepted  = t('validation.terms', 'Şertnama bilen razylaşmaly')
  }

  return errors
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-base font-semibold text-foreground mb-3">{title}</h3>
      )}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

// ─── CardOrderForm ────────────────────────────────────────────────────────────

export function CardOrderForm({
  mode,
  initialData,
  cardOrderId,
  onSuccess,
  onCancel,
}: CardOrderFormProps) {
  const { t } = useTranslation()
  const isEdit = mode === 'edit'

  const [form, setForm]       = useState<FormState>(() => getInitialState(initialData))
  const [errors, setErrors]   = useState<FormErrors>({})
  const [touched, setTouched] = useState(false)

  // Reset form when initialData loads (edit mode)
  useEffect(() => {
    if (initialData) setForm(getInitialState(initialData))
  }, [initialData])

  // Lookup data
  const { data: reasons    = [] } = useCardIssuanceReasons()
  const { data: cardTypes  = [] } = useCardTypes()
  const { data: provinces  = [] } = useProvinces()
  const { data: branches   = [] } = useBranches(
    form.provinceId ? Number(form.provinceId) : undefined,
  )

  // Mutations
  const createMutation = useCreateCardOrder()
  const updateMutation = useUpdateCardOrder(cardOrderId ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  // Helpers
  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setFile = (key: keyof FormState) => (file: File | null) =>
    setForm((f) => ({ ...f, [key]: file }))

  const toOptions = (arr: { id: number; name: string }[]): SelectOption[] =>
    arr.map((x) => ({ value: String(x.id), label: x.name }))

  // Validate on every change if user has already submitted once
  useEffect(() => {
    if (touched) setErrors(validate(form, mode, t))
  }, [form, touched, mode])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setTouched(true)
    const errs = validate(form, mode, t)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload = {
      isPaid:             form.isPaid,
      status:             form.status as CardOrderStatus,
      note:               form.note || null,
      issuanceReasonId:   Number(form.issuanceReasonId),
      cardTypeId:         Number(form.cardTypeId),
      provinceId:         Number(form.provinceId),
      branchId:           Number(form.branchId),
      firstName:          form.firstName,
      lastName:           form.lastName,
      middleName:         form.middleName  || null,
      formerLastName:     form.formerLastName || null,
      birthDate:          form.birthDate,
      phone:              form.phone,
      phoneExtra:         form.phoneExtra || null,
      citizenship:        form.citizenship,
      registeredAddress:  form.registeredAddress,
      currentAddress:     form.currentAddress,
      workplace:          form.workplace,
      passportSeriesId:   Number(form.passportSeriesId),
      passportNumber:     form.passportNumber,
      passportIssueDate:  form.passportIssueDate,
      passportIssuedBy:   form.passportIssuedBy,
      passportBirthPlace: form.passportBirthPlace,
      ...(form.passportPage1  && { passportPage1:  form.passportPage1  }),
      ...(form.passportPage23 && { passportPage23: form.passportPage23 }),
      ...(form.passportPage89 && { passportPage89: form.passportPage89 }),
      ...(form.passportPage32 && { passportPage32: form.passportPage32 }),
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload as CreateCardOrderPayload)
      }
      onSuccess?.()
    } catch {
      // errors handled in hooks via toast
    }
  }

  // ── Status options ─────────────────────────────────────────────────────────

  const statusOptions: SelectOption[] = [
    { value: 'PENDING',  label: t('cardOrder.status.pending',  'Garaşylýar') },
    { value: 'APPROVED', label: t('cardOrder.status.approved', 'Tassyklandy') },
    { value: 'REJECTED', label: t('cardOrder.status.rejected', 'Ýatyryldy') },
  ]

  const citizenshipOptions: SelectOption[] = [
    { value: 'Turkmenistan', label: t('citizenship.tm', 'Turkmenistan') },
    { value: 'Russia',       label: t('citizenship.ru', 'Russiýa') },
    { value: 'Other',        label: t('citizenship.other', 'Beýlekiler') },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── Status section ── */}
      <FormSection>
        <div className="flex items-center gap-2 mb-1">
          <input
            id="isPaid"
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <label
            htmlFor="isPaid"
            className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
          >
            {t('cardOrder.field.isPaid', 'Tölenen')}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="select"
            label={t('cardOrder.field.status', 'Status')}
            required
            value={form.status}
            onChange={set('status')}
            options={statusOptions}
            placeholder={t('common.selectPlaceholder', 'Saýlamak üçin basyň')}
            error={errors.status}
          />
          <FormInput
            type="textarea"
            label={t('cardOrder.field.note', 'Bellik')}
            value={form.note}
            onChange={set('note')}
            placeholder={t('cardOrder.field.note', 'Bellik')}
            rows={2}
          />
        </div>
      </FormSection>

      {/* ── Kart ── */}
      <FormSection title={t('cardOrder.section.card', 'Kart')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('cardOrder.field.issuanceReason', 'Kartyň çykarylmagynyň sebäbi')}
            required
            value={form.issuanceReasonId}
            onChange={set('issuanceReasonId')}
            options={toOptions(reasons)}
            error={errors.issuanceReasonId}
          />
          <FormInput
            type="searchable-select"
            label={t('cardOrder.field.cardType', 'Kart görnüşi')}
            required
            value={form.cardTypeId}
            onChange={set('cardTypeId')}
            options={toOptions(cardTypes)}
            error={errors.cardTypeId}
          />
        </div>
      </FormSection>

      {/* ── Lokasiýa ── */}
      <FormSection title={t('cardOrder.section.location', 'Lokasiýa')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="select"
            label={t('cardOrder.field.province', 'Welaýat')}
            required
            value={form.provinceId}
            onChange={(v) => {
              setForm((f) => ({ ...f, provinceId: v, branchId: '' }))
            }}
            options={toOptions(provinces)}
            error={errors.provinceId}
          />
          <FormInput
            type="searchable-select"
            label={t('cardOrder.field.branch', 'Şahamça')}
            required
            value={form.branchId}
            onChange={set('branchId')}
            options={toOptions(branches)}
            disabled={!form.provinceId}
            error={errors.branchId}
          />
        </div>
      </FormSection>

      {/* ── Şahsy maglumatlar ── */}
      <FormSection title={t('cardOrder.section.personal', 'Şahsy maglumatlar')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label={t('cardOrder.field.firstName', 'Ady')}
            required
            value={form.firstName}
            onChange={set('firstName')}
            placeholder={t('cardOrder.field.firstName', 'Ady')}
            error={errors.firstName}
          />
          <FormInput
            label={t('cardOrder.field.lastName', 'Familiýasy')}
            required
            value={form.lastName}
            onChange={set('lastName')}
            placeholder={t('cardOrder.field.lastName', 'Familiýasy')}
            error={errors.lastName}
          />
          <FormInput
            label={t('cardOrder.field.middleName', 'Atasynyn ady')}
            value={form.middleName}
            onChange={set('middleName')}
            placeholder={t('cardOrder.field.middleName', 'Atasynyn ady')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('cardOrder.field.formerLastName', 'Köne familiýaňyz (eger üýtgän bolsa)')}
            value={form.formerLastName}
            onChange={set('formerLastName')}
            placeholder={t('cardOrder.field.formerLastName', 'Köne familiýaňyz (eger üýtgän bolsa)')}
          />
          <FormInput
            type="date"
            label={t('cardOrder.field.birthDate', 'Doglan güni')}
            required
            value={form.birthDate}
            onChange={set('birthDate')}
            error={errors.birthDate}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            type="phone"
            label={t('cardOrder.field.phone', 'Telefon')}
            required
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
          />
          <FormInput
            type="phone"
            label={t('cardOrder.field.phoneExtra', 'Telefon goşmaça')}
            value={form.phoneExtra}
            onChange={set('phoneExtra')}
          />
          <FormInput
            type="select"
            label={t('cardOrder.field.citizenship', 'Raýatlyk')}
            required
            value={form.citizenship}
            onChange={set('citizenship')}
            options={citizenshipOptions}
            error={errors.citizenship}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('cardOrder.field.registeredAddress', 'Ýazgy edilen salgyňyz')}
            required
            value={form.registeredAddress}
            onChange={set('registeredAddress')}
            placeholder={t('cardOrder.field.registeredAddress', 'Ýazgy edilen salgyňyz')}
            error={errors.registeredAddress}
          />
          <FormInput
            label={t('cardOrder.field.currentAddress', 'Häzirki ýaşaýyş ýeri')}
            required
            value={form.currentAddress}
            onChange={set('currentAddress')}
            placeholder={t('cardOrder.field.currentAddress', 'Häzirki ýaşaýyş ýeri')}
            error={errors.currentAddress}
          />
        </div>

        <FormInput
          label={t('cardOrder.field.workplace', 'Işleýän ýeriňiz we wezipäňiz')}
          required
          value={form.workplace}
          onChange={set('workplace')}
          placeholder={t('cardOrder.field.workplace', 'Işleýän ýeriňiz we wezipäňiz')}
          error={errors.workplace}
        />
      </FormSection>

      {/* ── Pasport ── */}
      <FormSection title={t('cardOrder.section.passport', 'Pasport')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            type="select"
            label={t('cardOrder.field.passportSeries', 'Pasport seriýasy')}
            required
            value={form.passportSeriesId}
            onChange={set('passportSeriesId')}
            options={[
              { value: '1', label: 'I'   },
              { value: '2', label: 'II'  },
              { value: '3', label: 'III' },
            ]}
            error={errors.passportSeriesId}
          />
          <FormInput
            label={t('cardOrder.field.passportNumber', 'Pasport belgisi')}
            required
            value={form.passportNumber}
            onChange={set('passportNumber')}
            placeholder={t('cardOrder.field.passportNumber', 'Pasport belgisi')}
            error={errors.passportNumber}
          />
          <FormInput
            type="date"
            label={t('cardOrder.field.passportIssueDate', 'Pasport berlen senesi')}
            required
            value={form.passportIssueDate}
            onChange={set('passportIssueDate')}
            error={errors.passportIssueDate}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('cardOrder.field.passportIssuedBy', 'Kim tarapyndan berildi')}
            required
            value={form.passportIssuedBy}
            onChange={set('passportIssuedBy')}
            placeholder={t('cardOrder.field.passportIssuedBy', 'Kim tarapyndan berildi')}
            error={errors.passportIssuedBy}
          />
          <FormInput
            label={t('cardOrder.field.passportBirthPlace', 'Doglan ýeri (pasport)')}
            required
            value={form.passportBirthPlace}
            onChange={set('passportBirthPlace')}
            placeholder={t('cardOrder.field.passportBirthPlace', 'Doglan ýeri (pasport)')}
            error={errors.passportBirthPlace}
          />
        </div>
      </FormSection>

      {/* ── Pasport faýýlar ── */}
      <FormSection title={t('cardOrder.section.passportFiles', 'Pasport faýýlar')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="file"
            label={t('cardOrder.field.passportPage1', 'Pasport (sahypa 1)')}
            required
            accept="image/*,.pdf"
            fileValue={form.passportPage1}
            onFileChange={setFile('passportPage1')}
            error={errors.passportPage1}
          />
          <FormInput
            type="file"
            label={t('cardOrder.field.passportPage23', 'Pasport (2-3-nji sahypa)')}
            required
            accept="image/*,.pdf"
            fileValue={form.passportPage23}
            onFileChange={setFile('passportPage23')}
            error={errors.passportPage23}
          />
          <FormInput
            type="file"
            label={t('cardOrder.field.passportPage89', 'Pasport (8-9 sahypa)')}
            required
            accept="image/*,.pdf"
            fileValue={form.passportPage89}
            onFileChange={setFile('passportPage89')}
            error={errors.passportPage89}
          />
          <FormInput
            type="file"
            label={t('cardOrder.field.passportPage32', 'Pasport (32-nji sahypa)')}
            required
            accept="image/*,.pdf"
            fileValue={form.passportPage32}
            onFileChange={setFile('passportPage32')}
            error={errors.passportPage32}
          />
        </div>
      </FormSection>

      {/* ── Terms ── */}
      {!isEdit && (
        <div
          className={`flex items-center gap-3 p-3 rounded-lg mb-6 cursor-pointer transition-colors
            ${errors.termsAccepted
              ? 'bg-destructive/10 border border-destructive/30'
              : 'bg-primary/5 border border-primary/20'
            }`}
          onClick={() => setForm((f) => ({ ...f, termsAccepted: !f.termsAccepted }))}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors
            ${form.termsAccepted ? 'bg-primary text-primary-foreground' : 'border border-border bg-background'}`}
          >
            {form.termsAccepted && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className={`text-sm font-medium ${errors.termsAccepted ? 'text-destructive' : 'text-primary'}`}>
            {t('cardOrder.terms', 'Şertnama bilen razylaşýaryn (Okamak üçin bas)')}
          </span>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('common.cancel', 'Ýatyr')}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="min-w-[160px]"
        >
          {isPending
            ? t('common.saving', 'Saklanylýar...')
            : isEdit
              ? t('common.save', 'Ýatda sakla')
              : t('cardOrder.submit', 'Kart sargyt dörediň')
          }
        </Button>
      </div>
    </div>
  )
}
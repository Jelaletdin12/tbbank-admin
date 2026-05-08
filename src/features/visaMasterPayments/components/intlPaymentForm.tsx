import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { IntlPaymentItem, IntlPaymentCreatePayload, IntlPaymentStatus, CurrencyType } from '../api/visaMasterPaymentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntlPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: IntlPaymentItem
  onSubmit: (payload: IntlPaymentCreatePayload) => void
  isSubmitting: boolean
}

type FileKey =
  | 'doc_sberbank_account' | 'doc_school_enrollment' | 'doc_summons'
  | 'doc_passport_tm' | 'doc_foreign_passport' | 'doc_foreign_passport_copy'
  | 'doc_exit_permission' | 'doc_school_foreign_info' | 'doc_school_departure_info'
  | 'upd_doc_passport_tm' | 'upd_doc_foreign_passport' | 'upd_doc_visa'
  | 'upd_doc_acceptance_letter' | 'upd_doc_passport_biometric' | 'upd_doc_passport_old'

interface FormState {
  client_id: string
  status: string
  note: string
  currency_type: string
  province: string
  branch: string
  passport_first_name: string
  passport_last_name: string
  phone: string
  email: string
  home_address: string
  passport_series: string
  passport_number: string
  payer_full_name: string
  payer_account_number: string
  receiver_info: string
  doc_sberbank_account: File | null
  doc_school_enrollment: File | null
  doc_summons: File | null
  doc_passport_tm: File | null
  doc_foreign_passport: File | null
  doc_foreign_passport_copy: File | null
  doc_exit_permission: File | null
  doc_school_foreign_info: File | null
  doc_school_departure_info: File | null
  upd_doc_passport_tm: File | null
  upd_doc_foreign_passport: File | null
  upd_doc_visa: File | null
  upd_doc_acceptance_letter: File | null
  upd_doc_passport_biometric: File | null
  upd_doc_passport_old: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Garaşylýar' },
  { value: 'approved', label: 'Tassyklandy' },
  { value: 'rejected', label: 'Ret edildi' },
]

const CURRENCY_OPTIONS = [
  { value: 'visa',       label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',     label: 'I' },
  { value: 'II',    label: 'II' },
  { value: 'I-MR',  label: 'I-MR' },
  { value: 'II-MR', label: 'II-MR' },
]

const PROVINCE_OPTIONS = [
  { value: 'ashgabat', label: 'Aşgabat' },
  { value: 'ahal',     label: 'Ahal' },
  { value: 'mary',     label: 'Mary' },
  { value: 'dasoguz',  label: 'Daşoguz' },
  { value: 'lebap',    label: 'Lebap' },
  { value: 'balkan',   label: 'Balkan' },
]

// Kabul ediji docs — 9 sany
const KABUL_DOCS: { key: FileKey; label: string }[] = [
  { key: 'doc_sberbank_account',     label: 'Talypyň degişli welaýata "SBERBANK" kartyň rekwizitleri' },
  { key: 'doc_school_enrollment',    label: 'Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwänamasy' },
  { key: 'doc_summons',              label: 'Talypyň bilendiriň göçürmesi' },
  { key: 'doc_passport_tm',          label: 'Talypyň degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'doc_foreign_passport',     label: 'Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi' },
  { key: 'doc_foreign_passport_copy',label: 'Talypyň Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurtda galan döwründe bakýan döwleti baradaky bellenen sahypasynyň göçürmesi' },
  { key: 'doc_exit_permission',      label: 'Talypyň Türkmenistandan çykmak — we Türkmenistana girmek üçin pasportynyň dowletiniň girmesiz baradaky bellenen (goşmaç şaýmynyň) bellenen sahypasynyň göçürmesi' },
  { key: 'doc_school_foreign_info',  label: 'Talypyň daşary ýurt döwletiniň ýokary okuw mekdebinde okaýandygy barada doly takyk dil ulgaýynda takyk dil maglumatly sebäpleri daşary ýurt döwletiniň ýokary okuw mekdebinden haty' },
  { key: 'doc_school_departure_info',label: 'Talypyň daşary ýurt döwletinde döwletiniň ýokary okuw mekdebinde okaýandygy baradaky güwänamany döwlet dili maglumatlaryny talabap doly takyk dil ulgaýynda talaby daşary ýurt döwletiniň ýokary okuw mekdebinden haty' },
]

// Upgradyý docs — 6 sany
const UPGRAD_DOCS: { key: FileKey; label: string }[] = [
  { key: 'upd_doc_passport_tm',          label: 'Upgradyý degişli Türkmenistanyň raýatynyň içki milli pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'upd_doc_foreign_passport',     label: 'Upgradyý degişli Türkmenistandan çykmak we Türkmenistana girmek üçin pasportynyň göçürmesi' },
  { key: 'upd_doc_visa',                 label: 'Upgradyý Türkmenistandan — çykmak we Türkmenistana girmek üçin pasportynyň daşary ýurt döwletinde galýandygy we daşary ýurt döwleti baradaky şaýmynyň bellenen sahypasynyň göçürmesi' },
  { key: 'upd_doc_acceptance_letter',    label: 'Upgradyýyň we kabul edijiniň Batalyý töräre garyşdyryjy resminamalarynyň göçürmesi' },
  { key: 'upd_doc_passport_biometric',   label: 'Upgradyý we kabul ediji täze 2015-nji ýyldan soňra Türkmenistanyň raýatynyň pasportynyň tässy göreli alan bolsa, osta üstü görli 1 pasportynyň seriýasy baradaky maglumatlary' },
  { key: 'upd_doc_passport_old',         label: 'Upgradyý we kabul ediji täze 2015-nji ýyldan soňra Türkmenistanyň raýatynyň pasportynyň köp göreli alanlar soňra birleşi göreli alan bolsa, biri miwe möhüründen doglan doglan ata-enelerden biriniň alan pasportynyň seriýasy baradaky göwnamasy' },
]

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: FormState = {
  client_id: '', status: 'pending', note: '',
  currency_type: '', province: '', branch: '',
  passport_first_name: '', passport_last_name: '',
  phone: '', email: '', home_address: '',
  passport_series: '', passport_number: '',
  payer_full_name: '', payer_account_number: '',
  receiver_info: '',
  doc_sberbank_account: null, doc_school_enrollment: null,
  doc_summons: null, doc_passport_tm: null,
  doc_foreign_passport: null, doc_foreign_passport_copy: null,
  doc_exit_permission: null, doc_school_foreign_info: null,
  doc_school_departure_info: null,
  upd_doc_passport_tm: null, upd_doc_foreign_passport: null,
  upd_doc_visa: null, upd_doc_acceptance_letter: null,
  upd_doc_passport_biometric: null, upd_doc_passport_old: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.client_id)           errors.client_id           = 'Ulanyjy hökmany'
  if (!form.status)              errors.status              = 'Status hökmany'
  if (!form.currency_type)       errors.currency_type       = 'Ýüztumanyň görnüşi hökmany'
  if (!form.province)            errors.province            = 'Welaýat hökmany'
  if (!form.branch)              errors.branch              = 'Şahamça hökmany'
  if (!form.passport_first_name) errors.passport_first_name = 'Ady hökmany'
  if (!form.passport_last_name)  errors.passport_last_name  = 'Familiýasy hökmany'
  if (!form.phone)               errors.phone               = 'Telefon hökmany'
  if (!form.passport_series)     errors.passport_series     = 'Pasport seriýasy hökmany'
  if (!form.passport_number)     errors.passport_number     = 'Pasport nomeri hökmany'
  if (!form.payer_full_name)     errors.payer_full_name     = 'Ady Familiýasy Atasnyň ady hökmany'
  if (!form.payer_account_number)errors.payer_account_number= 'Goşun hasaby hökmany'
  if (!form.receiver_info)       errors.receiver_info       = 'Töleg kabul edijiniň maglumatlary hökmany'
  return errors
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-lg p-6 space-y-4">
      {title && (
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      )}
      {children}
    </section>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IntlPaymentForm({ mode, initialData, onSubmit, isSubmitting }: IntlPaymentFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        client_id:            initialData.client_id,
        status:               initialData.status,
        note:                 initialData.note ?? '',
        currency_type:        initialData.currency_type,
        province:             initialData.province,
        branch:               initialData.branch,
        passport_first_name:  initialData.passport_first_name,
        passport_last_name:   initialData.passport_last_name,
        phone:                initialData.phone,
        email:                initialData.email ?? '',
        home_address:         initialData.home_address ?? '',
        passport_series:      initialData.passport_series,
        passport_number:      initialData.passport_number,
        payer_full_name:      initialData.payer_full_name,
        payer_account_number: initialData.payer_account_number,
        receiver_info:        initialData.receiver_info,
        doc_sberbank_account: null, doc_school_enrollment: null,
        doc_summons: null, doc_passport_tm: null,
        doc_foreign_passport: null, doc_foreign_passport_copy: null,
        doc_exit_permission: null, doc_school_foreign_info: null,
        doc_school_departure_info: null,
        upd_doc_passport_tm: null, upd_doc_foreign_passport: null,
        upd_doc_visa: null, upd_doc_acceptance_letter: null,
        upd_doc_passport_biometric: null, upd_doc_passport_old: null,
      })
    }
  }, [mode, initialData])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = () => {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      ...form,
      status:        form.status as IntlPaymentStatus,
      currency_type: form.currency_type as CurrencyType,
    })
  }

  const title = mode === 'create'
    ? t('intlPayment.createTitle', 'Visa/Master tölegler (talyplar üçin) dörediň')
    : t('intlPayment.editTitle',   'Visa/Master tölegler (talyplar üçin) redaktirläň')

  const submitLabel = mode === 'create'
    ? t('intlPayment.createBtn', 'Visa/Master tölegler (talyplar üçin) dörediň')
    : t('intlPayment.editBtn',   'Visa/Master tölegler (talyplar üçin) redaktirläň')

  return (
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      {/* ── Status ────────────────────────────────────────────────────────── */}
      <Section title="">
        <FormInput
          type="searchable-select"
          label={t('intlPayment.client', 'Ulanyjy')}
          value={form.client_id}
          onChange={(v) => set('client_id', v)}
          options={[]} // Fetched from clients API
          placeholder="Saýlamak üçin basyň"
          error={errors.client_id}
          required
        />
        <FormInput
          type="select"
          label={t('intlPayment.status', 'Status')}
          value={form.status}
          onChange={(v) => set('status', v)}
          options={STATUS_OPTIONS}
          error={errors.status}
          required
        />
        <FormInput
          type="textarea"
          label={t('intlPayment.note', 'Bellik')}
          value={form.note}
          onChange={(v) => set('note', v)}
          placeholder="Bellik"
          rows={2}
        />
      </Section>

      {/* ── Ýüztumanyň görnüşi ───────────────────────────────────────────── */}
      <Section title={t('intlPayment.currencySection', 'Ýüztumanyň görnüşi')}>
        <FormInput
          type="select"
          label={t('intlPayment.currencyType', 'Ýüztumanyň görnüşi')}
          value={form.currency_type}
          onChange={(v) => set('currency_type', v)}
          options={CURRENCY_OPTIONS}
          error={errors.currency_type}
          required
        />
      </Section>

      {/* ── Lokasiýa ─────────────────────────────────────────────────────── */}
      <Section title={t('intlPayment.locationSection', 'Lokasiýa')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('intlPayment.province', 'Welaýat')}
            value={form.province}
            onChange={(v) => { set('province', v); set('branch', '') }}
            options={PROVINCE_OPTIONS}
            error={errors.province}
            required
          />
          <FormInput
            type="searchable-select"
            label={t('intlPayment.branch', 'Şahamça')}
            value={form.branch}
            onChange={(v) => set('branch', v)}
            options={[]} // Fetched from branches API filtered by province
            placeholder="Saýlamak üçin basyň"
            error={errors.branch}
            required
          />
        </div>
      </Section>

      {/* ── Şahsy maglumatlar ─────────────────────────────────────────────── */}
      <Section title={t('intlPayment.personalSection', 'Şahsy maglumatlar')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('intlPayment.passportLastName', 'Pasportdaky familýa')}
            value={form.passport_last_name}
            onChange={(v) => set('passport_last_name', v)}
            options={[]}
            placeholder="Pasportdaky familýa"
            error={errors.passport_last_name}
            required
          />
          <FormInput
            type="text"
            label={t('intlPayment.passportFirstName', 'Pasportdaky ady')}
            value={form.passport_first_name}
            onChange={(v) => set('passport_first_name', v)}
            placeholder="Pasportdaky ady"
            error={errors.passport_first_name}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="phone"
            label={t('intlPayment.phone', 'Telefon')}
            value={form.phone}
            onChange={(v) => set('phone', v)}
            error={errors.phone}
            required
          />
          <FormInput
            type="email"
            label={t('intlPayment.email', 'E-poçta')}
            value={form.email}
            onChange={(v) => set('email', v)}
            placeholder="E-poçta"
          />
        </div>
        <FormInput
          type="text"
          label={t('intlPayment.homeAddress', 'Häzirki ýaşyş ýeri')}
          value={form.home_address}
          onChange={(v) => set('home_address', v)}
          placeholder="Häzirki ýaşyş ýeri"
        />
      </Section>

      {/* ── Töleg upgradyjynyň maglumatlary ──────────────────────────────── */}
      <Section title={t('intlPayment.payerSection', 'Töleg upgradyjynyň maglumatlary')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            type="searchable-select"
            label={t('intlPayment.passportSeries', 'Pasport seriýasy')}
            value={form.passport_series}
            onChange={(v) => set('passport_series', v)}
            options={PASSPORT_SERIES_OPTIONS}
            error={errors.passport_series}
            required
          />
          <FormInput
            type="text"
            label={t('intlPayment.passportNumber', 'Pasport nomeri')}
            value={form.passport_number}
            onChange={(v) => set('passport_number', v)}
            placeholder="Pasport nomeri"
            error={errors.passport_number}
            required
          />
        </div>
        <FormInput
          type="text"
          label={t('intlPayment.payerFullName', 'Ady Familiýasy Atasnyň ady')}
          value={form.payer_full_name}
          onChange={(v) => set('payer_full_name', v)}
          placeholder="Ady Familiýasy Atasnyň ady"
          error={errors.payer_full_name}
          required
        />
        <FormInput
          type="text"
          label={t('intlPayment.payerAccount', 'Goşun hasaby')}
          value={form.payer_account_number}
          onChange={(v) => set('payer_account_number', v)}
          placeholder="Goşun hasaby"
          error={errors.payer_account_number}
          required
        />
      </Section>

      {/* ── Töleg kabul edijiniň maglumatlary ────────────────────────────── */}
      <Section title={t('intlPayment.receiverSection', 'Töleg kabul edijiniň maglumatlary')}>
        <FormInput
          type="textarea"
          label={t('intlPayment.receiverInfo', 'Saňa ger')}
          value={form.receiver_info}
          onChange={(v) => set('receiver_info', v)}
          placeholder="Saňa ger"
          rows={3}
          error={errors.receiver_info}
          required
        />
      </Section>

      {/* ── Kabul ediji talyp boyunca resminamalar ────────────────────────── */}
      <Section title={t('intlPayment.kabulDocsSection', 'Kabul ediji talyp boyunca resminamalar')}>
        <div className="space-y-4">
          {KABUL_DOCS.map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f)}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </Section>

      {/* ── Upgradyý boyunca resminamalar ─────────────────────────────────── */}
      <Section title={t('intlPayment.upgradDocsSection', 'Upgradyý boyunca resminamalar')}>
        <div className="space-y-4">
          {UPGRAD_DOCS.map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f)}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </Section>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/intl-payments/visa-master')}
          disabled={isSubmitting}
        >
          {t('common.cancel', 'Ýatyr')}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[240px]"
        >
          {isSubmitting ? <Spinner className="size-4" /> : submitLabel}
        </Button>
      </div>
    </div>
  )
}

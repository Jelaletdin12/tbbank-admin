import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { User, MapPin, IdCard, CreditCard, Files } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import type { StepStatus } from '@/components/stepBar'
import {
  useCreateSberPayment,
  useUpdateSberPayment,
} from '@/features/sberPayments/hooks/useSberPayments'
import {
  WELAYATLAR,
  SAHAMCALAR,
  STATUSES,
  type SberPaymentOrder,
  type SberPaymentFormData,
  type PaymentStatus,
} from '@/features/sberPayments/api/sberPaymentsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SberPaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: SberPaymentOrder | null
  orderId?: string
}

// ─── Document lists ───────────────────────────────────────────────────────────

type AcceptedDocKey =
  | 'acc_sberbank_card' | 'acc_enrollment' | 'acc_summons'
  | 'acc_passport_tm' | 'acc_zagran_passport' | 'acc_visa_page'
  | 'acc_entry_stamp' | 'acc_school_letter'

type SentDocKey =
  | 'snt_passport_tm' | 'snt_zagran_passport' | 'snt_entry_stamp'
  | 'snt_relation_doc' | 'snt_new_passport_series' | 'snt_old_passport_series'

const ACCEPTED_DOCS: { key: AcceptedDocKey; label: string }[] = [
  { key: 'acc_sberbank_card',    label: 'Talýba degişli SBERBANK kartynyň rekwizitleri' },
  { key: 'acc_enrollment',       label: 'Daşary ýurt ÝOM-da okaýandygy baradaky güwänamasy' },
  { key: 'acc_summons',          label: 'Çagyrylma hatynyn göçürmesi' },
  { key: 'acc_passport_tm',      label: 'TM içki pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'acc_zagran_passport',  label: 'Daşary ýurt (zagran) pasportynyň göçürmesi' },
  { key: 'acc_visa_page',        label: 'Daşary ýurda rugsat (wizasy) bellenen sahypasynyň göçürmesi' },
  { key: 'acc_entry_stamp',      label: 'Daşary ýurt döwletine girenliği baradaky ştamply sahypasynyň göçürmesi' },
  { key: 'acc_school_letter',    label: 'ÝOM-dan hat (daşary ýurt dilinde maglumatly)' },
]

const SENT_DOCS: { key: SentDocKey; label: string }[] = [
  { key: 'snt_passport_tm',         label: 'Ugradyjynyň TM içki pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'snt_zagran_passport',      label: 'Ugradyjynyň daşary ýurt pasportynyň asyl görnüşi we göçürmesi' },
  { key: 'snt_entry_stamp',         label: 'Ugradyjynyň daşary döwletine girenliği ştamply sahypasynyň göçürmesi' },
  { key: 'snt_relation_doc',        label: 'Ugradyjy we kabul edijiniň garyndaşlyk tassyklaýjy resminamasynyn göçürmesi' },
  { key: 'snt_new_passport_series', label: 'Ugradyjy/kabul ediji täze (2015+) pasport seriýasy maglumaty' },
  { key: 'snt_old_passport_series', label: 'Ugradyjy/kabul ediji köne pasport seriýasy baradaky güwänamasy' },
]


// ─── FormState ────────────────────────────────────────────────────────────────

interface FormState extends SberPaymentFormData {
  client_id: string
  // file fields
  acc_sberbank_card: File | null
  acc_enrollment: File | null
  acc_summons: File | null
  acc_passport_tm: File | null
  acc_zagran_passport: File | null
  acc_visa_page: File | null
  acc_entry_stamp: File | null
  acc_school_letter: File | null
  snt_passport_tm: File | null
  snt_zagran_passport: File | null
  snt_entry_stamp: File | null
  snt_relation_doc: File | null
  snt_new_passport_series: File | null
  snt_old_passport_series: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

// ─── Default state ────────────────────────────────────────────────────────────

const defaultState: FormState = {
  client_id: '',
  welayat: '',
  sahamca: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  status: 'GARASYLYYAR',
  bellik: '',
  accountNumber: '',
  passportSeries: '',
  passportNumber: '',
  fullName: '',
  acc_sberbank_card: null,
  acc_enrollment: null,
  acc_summons: null,
  acc_passport_tm: null,
  acc_zagran_passport: null,
  acc_visa_page: null,
  acc_entry_stamp: null,
  acc_school_letter: null,
  snt_passport_tm: null,
  snt_zagran_passport: null,
  snt_entry_stamp: null,
  snt_relation_doc: null,
  snt_new_passport_series: null,
  snt_old_passport_series: null,
}

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId = 'general' | 'location' | 'personal' | 'payment' | 'docs'

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: 'general',  title: 'Esasy',        subtitle: 'Status, müşderi'   },
  { id: 'location', title: 'Lokasiýa',     subtitle: 'Welaýat, şahamça' },
  { id: 'personal', title: 'Şahsy',        subtitle: 'Pasport, kontakt' },
  { id: 'payment',  title: 'Töleg',        subtitle: 'Hasap, ugradyjy'  },
  { id: 'docs',     title: 'Resminamalar', subtitle: '14 resminama'     },
]

const STEP_REQUIRED: Partial<Record<StepId, (keyof FormState)[]>> = {
  general:  ['status'],
  location: ['welayat', 'sahamca'],
  personal: ['firstName', 'lastName', 'phone', 'address'],
  payment:  ['passportSeries', 'passportNumber', 'fullName', 'accountNumber'],
}

const ERROR_LABELS: Partial<Record<keyof FormState, string>> = {
  status:        'Status hökmany',
  welayat:       'Welaýat hökmany',
  sahamca:       'Şahamça hökmany',
  firstName:     'Ady hökmany',
  lastName:      'Familiýasy hökmany',
  phone:         'Telefon hökmany',
  address:       'Salgy hökmany',
  passportSeries:'Pasport seriýasy hökmany',
  passportNumber:'Pasport nomeri hökmany',
  fullName:      'Doly ady hökmany',
  accountNumber: 'Goýum hasaby hökmany',
}

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({ cols = 2, children }: { cols?: 1 | 2; children: React.ReactNode }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {children}
    </div>
  )
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full'
  children: React.ReactNode
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 space-y-4${
        span === 'full' ? ' sm:col-span-2' : ''
      }`}
    >
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepGeneral({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="Müşderi">
        <FormInput
          type="searchable-select"
          label="Ulanyjy"
          value={form.client_id}
          onChange={(v) => set('client_id', v)}
          options={[]}
          placeholder="Saýlamak üçin basyň"
          required
        />
      </BentoCard>

      <BentoCard title="Status">
        <FormInput
          type="select"
          label="Status"
          value={form.status}
          onChange={(v) => set('status', v as PaymentStatus)}
          options={STATUSES}
          error={errors.status}
          required
        />
      </BentoCard>

      <BentoCard title="Bellik" span="full">
        <FormInput
          type="textarea"
          label="Bellik"
          value={form.bellik}
          onChange={(v) => set('bellik', v)}
          placeholder="Bellik..."
          rows={2}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepLocation({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  const branches = form.welayat ? (SAHAMCALAR[form.welayat] ?? []) : []

  return (
    <BentoGrid cols={2}>
      <BentoCard title="Welaýat">
        <FormInput
          type="select"
          label="Welaýat"
          value={form.welayat}
          onChange={(v) => { set('welayat', v); set('sahamca', '') }}
          options={WELAYATLAR.map((w) => ({ value: w, label: w }))}
          placeholder="Aşgabat"
          error={errors.welayat}
          required
        />
        <p className="text-xs text-muted-foreground">
          Welaýaty saýlasaňyz şahamçalar güncellenar.
        </p>
      </BentoCard>

      <BentoCard title="Şahamça">
        <FormInput
          type="searchable-select"
          label="Şahamça"
          value={form.sahamca}
          onChange={(v) => set('sahamca', v)}
          options={branches.map((b) => ({ value: b, label: b }))}
          placeholder="Saýlamak üçin basyň"
          disabled={!form.welayat}
          error={errors.sahamca}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPersonal({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="At-familýa">
        <FormInput
          type="text"
          label="Pasportdaky familiýa"
          value={form.lastName}
          onChange={(v) => set('lastName', v)}
          placeholder="NURYYEW"
          error={errors.lastName}
          required
        />
        <FormInput
          type="text"
          label="Pasportdaky ady"
          value={form.firstName}
          onChange={(v) => set('firstName', v)}
          placeholder="HAÝDAR"
          error={errors.firstName}
          required
        />
      </BentoCard>

      <BentoCard title="Kontakt">
        <FormInput
          type="phone"
          label="Telefon"
          value={form.phone}
          onChange={(v) => set('phone', v)}
          error={errors.phone}
          required
        />
        <FormInput
          type="email"
          label="E-poçta"
          value={form.email}
          onChange={(v) => set('email', v)}
          placeholder="email@example.com"
        />
      </BentoCard>

      <BentoCard title="Häzirki ýaşyş ýeri" span="full">
        <FormInput
          type="text"
          label="Salgy"
          value={form.address}
          onChange={(v) => set('address', v)}
          placeholder="Köçe, jaý belgisi..."
          error={errors.address}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPayment({
  form, errors, set,
}: {
  form: FormState
  errors: FormErrors
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="Pasport maglumatlary">
        <FormInput
          type="searchable-select"
          label="Pasport seriýasy"
          value={form.passportSeries}
          onChange={(v) => set('passportSeries', v)}
          options={[
            { value: 'II-MA', label: 'II-MA' },
            { value: 'II-MB', label: 'II-MB' },
            { value: 'II-MC', label: 'II-MC' },
            { value: 'II-MD', label: 'II-MD' },
          ]}
          placeholder="Saýlamak üçin basyň"
          error={errors.passportSeries}
          required
        />
        <FormInput
          type="text"
          label="Pasport nomeri"
          value={form.passportNumber}
          onChange={(v) => set('passportNumber', v)}
          placeholder="A123456"
          error={errors.passportNumber}
          required
        />
      </BentoCard>

      <BentoCard title="Ugradyjy">
        <FormInput
          type="text"
          label="Ady Familiýasy Atasynyň ady"
          value={form.fullName}
          onChange={(v) => set('fullName', v)}
          placeholder="Doly ady..."
          error={errors.fullName}
          required
        />
        <FormInput
          type="text"
          label="Goýum hasaby"
          value={form.accountNumber}
          onChange={(v) => set('accountNumber', v)}
          placeholder="1234 5678 ..."
          error={errors.accountNumber}
          required
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepDocs({
  form, set,
}: {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="Kabul ediji talyp — 8 resminama">
        <div className="space-y-3">
          {ACCEPTED_DOCS.map(({ key, label }) => (
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
      </BentoCard>

      <BentoCard title="Ugradyjy — 6 resminama">
        <div className="space-y-3">
          {SENT_DOCS.map(({ key, label }) => (
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
      </BentoCard>
    </BentoGrid>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SberPaymentForm({ mode, initialData, orderId }: SberPaymentFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateSberPayment()
  const updateMutation = useUpdateSberPayment()
  const isLoading = createMutation.isPending || updateMutation.isPending

  const [form, setForm] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    STEPS.map((_, i) => (i === 0 ? 'active' : 'idle')),
  )

  // ── Populate in edit mode ──
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm((prev) => ({
        ...prev,
        welayat:        initialData.welayat,
        sahamca:        initialData.sahamca,
        firstName:      initialData.firstName,
        lastName:       initialData.lastName,
        phone:          initialData.phone,
        email:          initialData.email,
        address:        initialData.address,
        status:         initialData.status,
        bellik:         initialData.bellik,
        accountNumber:  initialData.accountNumber,
        passportSeries: initialData.passportSeries,
        passportNumber: initialData.passportNumber,
        fullName:       initialData.fullName,
      }))
      // Let user jump freely to any step in edit mode
      setStepStatuses(STEPS.map((_, i) => (i === 0 ? 'active' : i < 4 ? 'done' : 'idle')))
    }
  }, [mode, initialData])

  // ── Field setter ──
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Step validation ──
  const validateStep = (stepId: StepId): FormErrors => {
    const fields = STEP_REQUIRED[stepId] ?? []
    const errs: FormErrors = {}
    fields.forEach((f) => {
      if (!form[f]) errs[f] = ERROR_LABELS[f] ?? 'Hökmany'
    })
    return errs
  }

  const validateAll = (): FormErrors => {
    const errs: FormErrors = {}
    Object.entries(ERROR_LABELS).forEach(([k, msg]) => {
      if (!form[k as keyof FormState]) errs[k as keyof FormState] = msg
    })
    return errs
  }

  // ── Navigation ──
  const goStep = (idx: number) => {
    if (idx < 0 || idx >= STEPS.length) return
    setStepStatuses((prev) => {
      const next = [...prev]
      if (idx > currentStep) next[currentStep] = 'done'
      next[idx] = 'active'
      if (idx < currentStep) {
        for (let i = idx + 1; i <= currentStep; i++) {
          if (next[i] !== 'done') next[i] = 'idle'
        }
      }
      return next
    })
    setErrors({})
    setCurrentStep(idx)
  }

  const handleNext = () => {
    const stepId = STEPS[currentStep].id
    const stepErrors = validateStep(stepId)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setStepStatuses((prev) => {
        const next = [...prev]; next[currentStep] = 'error'; return next
      })
      return
    }
    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      goStep(currentStep + 1)
    }
  }

  // ── Submit ──
  const handleSubmit = async () => {
    const allErrors = validateAll()
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      toast.error('Meýdanlary dolduryň')
      return
    }
    try {
      const payload: SberPaymentFormData = {
        welayat:        form.welayat,
        sahamca:        form.sahamca,
        firstName:      form.firstName,
        lastName:       form.lastName,
        phone:          form.phone,
        email:          form.email,
        address:        form.address,
        status:         form.status,
        bellik:         form.bellik,
        accountNumber:  form.accountNumber,
        passportSeries: form.passportSeries,
        passportNumber: form.passportNumber,
        fullName:       form.fullName,
      }
      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        toast.success('Töleg üstünlikli döredildi')
        navigate('/sber-payments')
      } else if (orderId) {
        await updateMutation.mutateAsync({ ...payload, id: orderId })
        toast.success('Töleg üstünlikli täzelendi')
        navigate(`/sber-payments/${orderId}`)
      }
    } catch {
      toast.error('Ýalňyşlyk ýüze çykdy')
    }
  }

  // ── StepBarCards data ──
  const stepCardItems: StepCardItem[] = STEPS.map((s, i) => ({
    id:       s.id,
    title:    s.title,
    subtitle: s.subtitle,
    status:   stepStatuses[i],
    icon:     ([User, MapPin, IdCard, CreditCard, Files] as const)[i],
  }))

  const isLastStep = currentStep === STEPS.length - 1

  const submitLabel = mode === 'create'
    ? 'Sber töleg (talyplar üçin) dörediň'
    : 'Ýatda sakla'

  return (
    <div className="mx-auto space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-foreground">
        {mode === 'create' ? 'Sber töleg dörediň' : 'Sber töleg redaktirläň'}
      </h1>

      {/* ── Step bar ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards
          steps={stepCardItems}
          onGoTo={(i) => {
            if (stepStatuses[i] !== 'idle') goStep(i)
          }}
        />
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      {STEPS[currentStep].id === 'general'  && <StepGeneral  form={form} errors={errors} set={set} />}
      {STEPS[currentStep].id === 'location' && <StepLocation form={form} errors={errors} set={set} />}
      {STEPS[currentStep].id === 'personal' && <StepPersonal form={form} errors={errors} set={set} />}
      {STEPS[currentStep].id === 'payment'  && <StepPayment  form={form} errors={errors} set={set} />}
      {STEPS[currentStep].id === 'docs'     && <StepDocs     form={form} set={set} />}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <FormActions
        isPending={isLoading}
        onCancel={() => navigate('/sber-payments')}
        onPrev={currentStep > 0 ? () => goStep(currentStep - 1) : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? handleNext : undefined}
        submitLabel={submitLabel}
        loadingLabel="Ýüklenýär..."
      />
    </div>
  )
}
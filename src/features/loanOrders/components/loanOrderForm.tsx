import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  CircleDot, CreditCard, MapPin, User, Wallet,
  FileText, Phone, Briefcase, FolderOpen, ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { FormInput } from '@/components/formInput'
import { FormActions } from '@/components/formActions'
import { StepBarCards, type StepCardItem } from '@/components/stepBarV2'
import { useCreateLoanOrder, useUpdateLoanOrder } from '@/features/loanOrders/hooks/useLoanOrders'
import type { LoanOrder } from '@/features/loanOrders/api/loanOrdersApi'
import { BRANCHES_BY_REGION } from '@/features/loanOrders/api/loanOrdersApi'
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from '@/features/loanOrders/schemas/loanOrder.schema'
import type { LoanOrderFormData } from '@/features/loanOrders/schemas/loanOrder.schema'

// ─── Static options ───────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: 'Aşgabat', label: 'Aşgabat' },
  { value: 'Ahal',    label: 'Ahal'    },
  { value: 'Balkan',  label: 'Balkan'  },
  { value: 'Daşoguz', label: 'Daşoguz' },
  { value: 'Lebap',   label: 'Lebap'   },
  { value: 'Mary',    label: 'Mary'    },
  { value: 'Arkadag', label: 'Arkadag' },
]

const EDUCATION_OPTIONS = [
  { value: 'high',            label: 'Ýokary bilim'              },
  { value: 'unfinished_high', label: 'Gutarylmadyk ýokary bilim' },
  { value: 'masters',         label: 'Magistr'                   },
  { value: 'phd',             label: 'Ylymlaryň doktory'         },
  { value: 'middle',          label: 'Orta mekdep'               },
  { value: 'school',          label: 'Orta bilim'                },
  { value: 'school_dropout',  label: 'Gutarylmadyk orta bilim'   },
]

const MARRIAGE_OPTIONS = [
  { value: 'MARRIED',  label: 'Öýlenen / Durmuşa çykan'         },
  { value: 'SINGLE',   label: 'Öýlenmedik / Durmuşa çykmadyk'   },
  { value: 'DIVORCED', label: 'Aýrylşan'                        },
  { value: 'WIDOW',    label: 'Adamsy ýa-da aýaly aradan çykan'  },
  { value: 'LEGAL',    label: 'Raýat nika'                      },
]

const STATUS_OPTIONS = [
  { value: 'GARAŞYLÝAR',        label: 'Garaşylýar'        },
  { value: 'IŞLENÝÄR',          label: 'Işlenýär'          },
  { value: 'KANAGATLANDYRYLAN', label: 'Kanagatlandyrylan' },
  { value: 'RED_EDILDI',        label: 'Red edildi'        },
]

const LOAN_TYPE_OPTIONS = [
  { value: 'consumer', label: 'Sarp ediş karzy' },
  { value: 'mortgage', label: 'Ipoteka'          },
  { value: 'car',      label: 'Awtoulag karzy'   },
  { value: 'student',  label: 'Talyplar üçin'    },
  { value: 'business', label: 'Işewürlik karzy'  },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',  label: 'I'  },
  { value: 'II', label: 'II' },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1).padStart(2, '0'),
}))

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  value: String(new Date().getFullYear() + i),
  label: String(new Date().getFullYear() + i),
}))

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof LoanOrderFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof LoanOrderFormData] = msg
  }
  return result
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string
  titleKey: string
  titleFallback: string
  subtitle: string
  icon: LucideIcon
  validate: (form: LoanOrderFormData, mode: 'create' | 'edit') => FlatErrors
}

const STEPS: StepDef[] = [
  {
    id: 'status', titleKey: 'Status', titleFallback: 'Status',
    subtitle: 'Ýagdaý we bellik', icon: CircleDot,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: 'loan', titleKey: 'Loan', titleFallback: 'Karz',
    subtitle: 'Görnüş we möçber', icon: Wallet,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: 'location', titleKey: 'Location', titleFallback: 'Lokasiýa',
    subtitle: 'Welaýat we şahamça', icon: MapPin,
    validate: (form, mode) => validateStep(2, form, mode),
  },
  {
    id: 'personal', titleKey: 'Personal data', titleFallback: 'Şahsy maglumatlar',
    subtitle: 'At, bilim, maşgala', icon: User,
    validate: (form, mode) => validateStep(3, form, mode),
  },
  {
    id: 'card', titleKey: 'Card (Salary)', titleFallback: 'Kart (Zähmet haky)',
    subtitle: 'Zähmet haky karty', icon: CreditCard,
    validate: (form, mode) => validateStep(4, form, mode),
  },
  {
    id: 'passport', titleKey: 'Passport', titleFallback: 'Pasport',
    subtitle: 'Seriýa, belgisi, senesi', icon: FileText,
    validate: (form, mode) => validateStep(5, form, mode),
  },
  {
    id: 'contact', titleKey: 'Contact data', titleFallback: 'Habarlaşmak',
    subtitle: 'Telefon we e-poçta', icon: Phone,
    validate: (form, mode) => validateStep(6, form, mode),
  },
  {
    id: 'job', titleKey: 'Job', titleFallback: 'Iş',
    subtitle: 'Kärhana we wezipe', icon: Briefcase,
    validate: (form, mode) => validateStep(7, form, mode),
  },
  {
    id: 'files', titleKey: 'Passport files', titleFallback: 'Pasport faýllar',
    subtitle: 'Pasport suratlary', icon: FolderOpen,
    validate: (form, mode) => validateStep(8, form, mode),
  },
  {
    id: 'guarantor', titleKey: '1. Guarantor', titleFallback: '1. Zamun',
    subtitle: 'Zamun maglumatlary', icon: ShieldCheck,
    validate: (form, mode) => validateStep(9, form, mode),
  },
]

// ─── Bento primitives ─────────────────────────────────────────────────────────

function BentoGrid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3 | 4
  children: React.ReactNode
}) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols]
  return <div className={`grid ${colClass} gap-4`}>{children}</div>
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string
  span?: 'full' | 2 | 3
  children: React.ReactNode
}) {
  const spanClass =
    span === 'full' ? 'sm:col-span-full' :
    span === 2      ? 'sm:col-span-2'    :
    span === 3      ? 'sm:col-span-3'    : ''

  return (
    <div className={`bg-card border border-border rounded-xl p-5 space-y-4 ${spanClass}`}>
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Shared step content props ────────────────────────────────────────────────

interface StepContentProps {
  form: LoanOrderFormData
  errors: FlatErrors
  set: <K extends keyof LoanOrderFormData>(k: K, v: LoanOrderFormData[K]) => void
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepStatus({ form, errors, set }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="select"
          label="Status"
          required
          value={form.status}
          onChange={(v) => set('status', v)}
          options={STATUS_OPTIONS}
          error={errors.status}
          placeholder="Saýlaň"
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="textarea"
          label="Bellik"
          value={form.note}
          onChange={(v) => set('note', v)}
          placeholder="Bellik..."
          rows={3}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepLoan({ form, errors, set }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="searchable-select"
          label="Karz görnüşi"
          required
          value={form.loanType}
          onChange={(v) => set('loanType', v)}
          options={LOAN_TYPE_OPTIONS}
          placeholder="Saýlamak üçin basyň"
          error={errors.loanType}
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="number"
          label="Karz möçberi"
          required
          value={form.loanAmount}
          onChange={(v) => set('loanAmount', v)}
          placeholder="0.00"
          error={errors.loanAmount}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepLocation({ form, errors, set }: StepContentProps) {
  const branchOptions = BRANCHES_BY_REGION[form.region] ?? []

  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="searchable-select"
          label="Welaýat"
          required
          value={form.region}
          onChange={(v) => { set('region', v); set('branch', '') }}
          options={REGION_OPTIONS}
          placeholder="Saýlamak üçin basyň"
          error={errors.region}
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="searchable-select"
          label="Şahamça"
          required
          value={form.branch}
          onChange={(v) => set('branch', v)}
          options={branchOptions}
          placeholder="Saýlamak üçin basyň"
          disabled={!form.region}
          error={errors.branch}
        />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPersonal({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="text" label="Ady" required value={form.firstName} onChange={(v) => set('firstName', v)} placeholder="Ady" error={errors.firstName} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label="Familiýasy" required value={form.lastName} onChange={(v) => set('lastName', v)} placeholder="Familiýasy" error={errors.lastName} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label="Atasynyň ady" value={form.patronicName} onChange={(v) => set('patronicName', v)} placeholder="Atasynyň ady" />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard >
          <FormInput type="select" label="Bilimi" required value={form.education} onChange={(v) => set('education', v)} options={EDUCATION_OPTIONS} placeholder="Saýlaň" error={errors.education} />
        </BentoCard>
        <BentoCard >
          <FormInput type="select" label="Maşgala ýagdaýy" required value={form.marriageStatus} onChange={(v) => set('marriageStatus', v)} options={MARRIAGE_OPTIONS} placeholder="Saýlaň" error={errors.marriageStatus} />
        </BentoCard>
        <BentoCard >
          <FormInput type="date" label="Doglan güni" required value={form.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} error={errors.dateOfBirth} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput type="text" label="Ýazgy edilen salgyňyz" required value={form.residence} onChange={(v) => set('residence', v)} placeholder="Ýazgy edilen salgy" error={errors.residence} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Häzirki ýaşaýyş ýeri" value={form.currentResidence} onChange={(v) => set('currentResidence', v)} placeholder="Häzirki ýaşaýyş ýeri" />
        </BentoCard>
        <BentoCard span="full">
          <FormInput type="searchable-select" label="Karz taryhy" value={form.loanHistory} onChange={(v) => set('loanHistory', v)} options={[]} placeholder="Saýlamak üçin basyň" />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepCard({ form, errors, set }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="Kart maglumatlary">
        <FormInput type="text" label="Kart belgisi" required value={form.cardNumber} onChange={(v) => set('cardNumber', v)} placeholder="Kart belgisi" error={errors.cardNumber} />
        <FormInput type="text" label="Kartdaky ady" required value={form.cardName} onChange={(v) => set('cardName', v)} placeholder="Kartdaky ady" error={errors.cardName} />
      </BentoCard>

      <BentoCard title="Kart möhleti">
        <FormInput type="searchable-select" label="Aý" required value={form.cardExpMonth} onChange={(v) => set('cardExpMonth', v)} options={MONTH_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.cardExpMonth} />
        <FormInput type="searchable-select" label="Ýyl" required value={form.cardExpYear} onChange={(v) => set('cardExpYear', v)} options={YEAR_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.cardExpYear} />
      </BentoCard>
    </BentoGrid>
  )
}

function StepPassport({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard >
          <FormInput type="searchable-select" label="Pasport seriýasy" required value={form.passportSerie} onChange={(v) => set('passportSerie', v)} options={PASSPORT_SERIES_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.passportSerie} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Pasport belgisi" required value={form.passportNumber} onChange={(v) => set('passportNumber', v)} placeholder="Pasport belgisi" error={errors.passportNumber} />
        </BentoCard>
        <BentoCard >
          <FormInput type="date" label="Pasport berlen senesi" required value={form.passportDateOfIssue} onChange={(v) => set('passportDateOfIssue', v)} error={errors.passportDateOfIssue} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput type="text" label="Kim tarapyndan berildi" required value={form.passportGivenBy} onChange={(v) => set('passportGivenBy', v)} placeholder="Kim tarapyndan berildi" error={errors.passportGivenBy} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Doglan ýeri (pasport)" value={form.bornPlace} onChange={(v) => set('bornPlace', v)} placeholder="Doglan ýeri (pasport)" />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepContact({ form, errors, set }: StepContentProps) {
  return (
    <BentoGrid cols={2}>
      <BentoCard title="Esasy">
        <FormInput type="phone" label="Telefon" required value={form.phone} onChange={(v) => set('phone', v)} placeholder="61 097 651" error={errors.phone} />
        <FormInput type="email" label="E-poçta" value={form.email} onChange={(v) => set('email', v)} placeholder="E-poçta" />
      </BentoCard>

      <BentoCard title="Goşmaça">
        <FormInput type="phone" label="Telefon goşmaça" value={form.phoneAdditional} onChange={(v) => set('phoneAdditional', v)} placeholder="61 097 651" />
        <FormInput type="phone" label="Öý telefony" value={form.homePhone} onChange={(v) => set('homePhone', v)} placeholder="61 097 651" />
      </BentoCard>
    </BentoGrid>
  )
}

function StepJob({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput type="text" label="Işleýän edaranyň/kärhananyň ady" required value={form.workCompany} onChange={(v) => set('workCompany', v)} placeholder="Kärhananyň ady" error={errors.workCompany} />
          <FormInput type="phone" label="Işgärler bölüminiň iş belgisi" value={form.workHrPhone} onChange={(v) => set('workHrPhone', v)} placeholder="61 097 651" />
        </BentoCard>

        <BentoCard >
          <FormInput type="searchable-select" label="Işleýän welaýatyňyz" value={form.workRegion} onChange={(v) => set('workRegion', v)} options={REGION_OPTIONS} placeholder="Saýlamak üçin basyň" />
          <FormInput type="searchable-select" label="Işleýän etrabyňyz" value={form.workProvince} onChange={(v) => set('workProvince', v)} options={[]} placeholder="Saýlamak üçin basyň" />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard >
          <FormInput type="text" label="Wezipe" required value={form.position} onChange={(v) => set('position', v)} placeholder="Wezipe" error={errors.position} />
        </BentoCard>
        <BentoCard>
          <FormInput type="number" label="Zähmet haky" required value={form.salary} onChange={(v) => set('salary', v)} placeholder="Zähmet haky" error={errors.salary} />
        </BentoCard>
        <BentoCard>
          <FormInput type="date" label="Işe başlan wagtyňyz" required value={form.workStartedAt} onChange={(v) => set('workStartedAt', v)} error={errors.workStartedAt} />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepFiles({
  form, errors, set, mode, initialData,
}: StepContentProps & { mode: 'create' | 'edit'; initialData?: LoanOrder }) {
  const existingFiles = mode === 'edit' && initialData
    ? [
        { url: initialData.passportPage1Url,  label: 'Pasport (sahypa 1)' },
        { url: initialData.passportPage23Url, label: 'Pasport (2-3-nji sahypa)' },
        { url: initialData.passportPage89Url, label: 'Pasport (8-9 sahypa)' },
        { url: initialData.passportPage32Url, label: 'Pasport (32-nji sahypa)' },
      ].filter((f): f is { url: string; label: string } => !!f.url)
    : []

  return (
    <div className="space-y-4">
      {existingFiles.length > 0 && (
        <BentoGrid cols={4}>
          {existingFiles.map(({ url, label }) => (
            <BentoCard key={label} title={label}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline truncate block"
              >
                Faýly gör
              </a>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (sahypa 1) (çalyşmak)' : 'Pasport (sahypa 1)'}
            required={mode === 'create'}
            accept="image/*"
            fileValue={form.passportPage1}
            onFileChange={(f) => set('passportPage1', f)}
            error={errors.passportPage1}
          />
        </BentoCard>

        <BentoCard>
          <FormInput
            type="file"
            label={mode === 'edit' ? 'Pasport (2-3-nji sahypa) (çalyşmak)' : 'Pasport (2-3-nji sahypa)'}
            required={mode === 'create'}
            accept="image/*"
            fileValue={form.passportPage23}
            onFileChange={(f) => set('passportPage23', f)}
            error={errors.passportPage23}
          />
        </BentoCard>

        <BentoCard >
          <FormInput
            type="file"
            label="Pasport (8-9 sahypa)"
            accept="image/*"
            fileValue={form.passportPage89}
            onFileChange={(f) => set('passportPage89', f)}
          />
        </BentoCard>

        <BentoCard >
          <FormInput
            type="file"
            label="Pasport (32-nji sahypa)"
            accept="image/*"
            fileValue={form.passportPage32}
            onFileChange={(f) => set('passportPage32', f)}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

function StepGuarantor({ form, errors, set }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="text" label="Zamunyň ady" required value={form.guarantor1Name} onChange={(v) => set('guarantor1Name', v)} placeholder="Zamunyň ady" error={errors.guarantor1Name} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Zamunyň familiýasy" required value={form.guarantor1Surname} onChange={(v) => set('guarantor1Surname', v)} placeholder="Zamunyň familiýasy" error={errors.guarantor1Surname} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Zamunyň atasynyň ady" value={form.guarantor1Patronic} onChange={(v) => set('guarantor1Patronic', v)} placeholder="Zamunyň atasynyň ady" />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput type="searchable-select" label="Pasport seriýasy" required value={form.guarantor1PassportSerie} onChange={(v) => set('guarantor1PassportSerie', v)} options={PASSPORT_SERIES_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.guarantor1PassportSerie} />
        </BentoCard>
        <BentoCard >
          <FormInput type="text" label="Pasport belgisi" required value={form.guarantor1PassportNumber} onChange={(v) => set('guarantor1PassportNumber', v)} placeholder="Pasport belgisi" error={errors.guarantor1PassportNumber} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard >
          <FormInput type="text" label="Kart belgisi" required value={form.guarantor1CardNumber} onChange={(v) => set('guarantor1CardNumber', v)} placeholder="Kart belgisi" error={errors.guarantor1CardNumber} />
          <FormInput type="text" label="Kartdaky ady" required value={form.guarantor1CardName} onChange={(v) => set('guarantor1CardName', v)} placeholder="Kartdaky ady" error={errors.guarantor1CardName} />
        </BentoCard>

        <BentoCard>
          <FormInput type="searchable-select" label="Möhleti (aý)" required value={form.guarantor1CardExpMonth} onChange={(v) => set('guarantor1CardExpMonth', v)} options={MONTH_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.guarantor1CardExpMonth} />
          <FormInput type="searchable-select" label="Möhleti (ýyl)" required value={form.guarantor1CardExpYear} onChange={(v) => set('guarantor1CardExpYear', v)} options={YEAR_OPTIONS} placeholder="Saýlamak üçin basyň" error={errors.guarantor1CardExpYear} />
          <FormInput type="number" label="Ortaca zähmet haky" required value={form.guarantor1Salary} onChange={(v) => set('guarantor1Salary', v)} placeholder="Ortaca zähmet haky" error={errors.guarantor1Salary} />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoanOrderFormProps {
  mode: 'create' | 'edit'
  initialData?: LoanOrder
  loanOrderId?: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoanOrderForm({ mode, initialData, loanOrderId }: LoanOrderFormProps) {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const createMutation = useCreateLoanOrder()
  const updateMutation = useUpdateLoanOrder()
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors,
  } = useForm<LoanOrderFormData>({ defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES })

  const form = watch()
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors])

  const [currentStep, setCurrentStep] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === 'edit' ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  )

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>()
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i)
    })
    return out
  }, [form, mode, visited])

  const set = useCallback(<K extends keyof LoanOrderFormData>(key: K, value: LoanOrderFormData[K]) => {
    (setValue as (name: K, val: LoanOrderFormData[K]) => void)(key, value)
    clearErrors(key)
  }, [setValue, clearErrors])

  const stepProps = useMemo(() => ({ form, errors, set }), [form, errors, set])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]))

  const handleNext = () => {
    markVisited(currentStep)
    const errs = STEPS[currentStep].validate(form, mode)
    if (Object.keys(errs).length > 0) {
      toast.error(t('common.errors.fillRequiredCorrectly', 'Dogry maglumat girizmegiňizi haýyş edýäris.'))
      return
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      markVisited(currentStep)
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGoTo = (i: number) => {
    markVisited(currentStep)
    setCurrentStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const doSubmit = () => {
    setVisited(new Set(STEPS.map((_, i) => i)))

    const allErrors: FlatErrors = {}
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode))

    if (Object.keys(allErrors).length > 0) {
      toast.error(t('common.errors.requiredFieldsMissing', 'Käbir hökmany meýdanlar doldurylan däldir.'))
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i); break
        }
      }
      return
    }

    const payload = buildPayload(getValues())

    if (mode === 'create') {
      createMutation.mutate(payload, { onSuccess: () => navigate('/loan-orders') })
    } else {
      updateMutation.mutate(
        { id: loanOrderId!, payload },
        { onSuccess: () => navigate('/loan-orders') },
      )
    }
  }

  // ── StepBar items ───────────────────────────────────────────────────────────

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive  = i === currentStep
    const hasErrors = stepsWithErrors.has(i)
    const isDone    = visited.has(i) && !hasErrors
    return {
      id:       s.id,
      title:    t(s.titleKey) || s.titleFallback,
      subtitle: s.subtitle,
      icon:     s.icon,
      status: isActive ? 'active' : hasErrors ? 'error' : isDone ? 'done' : 'idle',
    }
  })

  const isLastStep = currentStep === STEPS.length - 1

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === 'create'
            ? (t('Loan order create') || 'Karz sargyt döredüň')
            : (t('Loan order edit')   || 'Karz sargydy üýtget')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('Fill in all sections step by step') || 'Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.'}
        </p>
      </div>

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {currentStep === 0 && <StepStatus   {...stepProps} />}
      {currentStep === 1 && <StepLoan     {...stepProps} />}
      {currentStep === 2 && <StepLocation {...stepProps} />}
      {currentStep === 3 && <StepPersonal {...stepProps} />}
      {currentStep === 4 && <StepCard     {...stepProps} />}
      {currentStep === 5 && <StepPassport {...stepProps} />}
      {currentStep === 6 && <StepContact  {...stepProps} />}
      {currentStep === 7 && <StepJob      {...stepProps} />}
      {currentStep === 8 && <StepFiles    {...stepProps} mode={mode} initialData={initialData} />}
      {currentStep === 9 && <StepGuarantor {...stepProps} />}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={currentStep === 0 ? () => navigate(-1) : undefined}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? doSubmit : undefined}
        submitLabel={
          mode === 'create'
            ? (t('loanOrderMobiles.createButton') || 'Karz sargyt döredüň')
            : (t('loanOrders.saveButton')         || 'Ýatda sakla')
        }
        loadingLabel={t('Loading') || 'Ýüklenilýär...'}
        cancelLabel={t('Cancel') || 'Ýatyr'}
        prevLabel={t('Back') || 'Yza'}
        nextLabel={t('Next') || 'Indiki'}
      />
    </div>
  )
}

function mapInitial(order: LoanOrder): Partial<LoanOrderFormData> {
  return {
    status:              order.status              ?? 'GARAŞYLÝAR',
    loanType:            order.loanType            ?? '',
    region:              order.region              ?? 'Aşgabat',
    branch:              order.branch              ?? '',
    firstName:           order.firstName           ?? '',
    lastName:            order.lastName            ?? '',
    patronicName:        order.patronicName        ?? '',
    education:           order.education           ?? '',
    marriageStatus:      order.marriageStatus      ?? '',
    dateOfBirth:         order.dateOfBirth         ?? '',
    residence:           order.residence           ?? '',
    currentResidence:    order.currentResidence    ?? '',
    passportSerie:       order.passportSerie       ?? '',
    passportNumber:      order.passportNumber      ?? '',
    passportDateOfIssue: order.passportDateOfIssue ?? '',
    passportGivenBy:     order.passportGivenBy     ?? '',
    bornPlace:           order.bornPlace           ?? '',
    email:               order.email               ?? '',
    phone:               order.phone               ?? '',
    phoneAdditional:     order.phoneAdditional     ?? '',
    homePhone:           order.homePhone           ?? '',
    workCompany:         order.workCompany         ?? '',
    workHrPhone:         order.workHrPhone         ?? '',
    workRegion:          order.workRegion          ?? 'Aşgabat',
    workProvince:        order.workProvince        ?? '',
    position:            order.position            ?? '',
    salary:              order.salary != null ? String(order.salary) : '',
    workStartedAt:       order.workStartedAt       ?? '',
    note:                order.note                ?? '',
    loanAmount:          order.loanAmount != null ? String(order.loanAmount) : '',
    loanHistory:         order.loanHistory         ?? '',
    cardNumber:          order.cardNumber          ?? '',
    cardName:            order.cardName            ?? '',
    cardExpMonth:        order.cardExpMonth        ?? '',
    cardExpYear:         order.cardExpYear         ?? '',
    guarantor1Name:           order.guarantor1Name           ?? '',
    guarantor1Surname:        order.guarantor1Surname        ?? '',
    guarantor1Patronic:       order.guarantor1Patronic       ?? '',
    guarantor1PassportSerie:  order.guarantor1PassportSerie  ?? '',
    guarantor1PassportNumber: order.guarantor1PassportNumber ?? '',
    guarantor1CardNumber:     order.guarantor1CardNumber     ?? '',
    guarantor1CardName:       order.guarantor1CardName       ?? '',
    guarantor1CardExpMonth:   order.guarantor1CardExpMonth   ?? '',
    guarantor1CardExpYear:    order.guarantor1CardExpYear    ?? '',
    guarantor1Salary: order.guarantor1Salary != null ? String(order.guarantor1Salary) : '',
  }
}
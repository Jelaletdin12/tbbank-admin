import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormInput } from '@/components/formInput'
import { Button } from '@/components/ui/button'
import { useCreateLoanOrder } from '@/features/loanOrders/hooks/useLoanOrders'
import type { LoanOrderCreatePayload } from '@/features/loanOrders/api/loanOrdersApi'
import { cn } from '@/lib/utils'

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, className }: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────

const grid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-6'
const grid3 = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
const grid4 = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'

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
  { value: 'MARRIED',   label: 'Öýlenen / Durmuşa çykan'       },
  { value: 'SINGLE',    label: 'Öýlenmedik / Durmuşa çykmadyk' },
  { value: 'DIVORCED',  label: 'Aýrylşan'                      },
  { value: 'WIDOW',     label: 'Adamsy ýa-da aýaly aradan çykan'},
  { value: 'LEGAL',     label: 'Raýat nika'                    },
]

const STATUS_OPTIONS = [
  { value: 'GARAŞYLÝAR',        label: 'Garaşylýar'        },
  { value: 'IŞLENÝÄR',          label: 'Işlenýär'          },
  { value: 'KANAGATLANDYRYLAN', label: 'Kanagatlandyrylan' },
  { value: 'RED_EDILDI',        label: 'Red edildi'        },
]

const LOAN_TYPE_OPTIONS = [
  { value: 'consumer',  label: 'Sarp ediş karzy'    },
  { value: 'mortgage',  label: 'Ipoteka'             },
  { value: 'car',       label: 'Awtoulag karzy'      },
  { value: 'student',   label: 'Talyplar üçin'       },
  { value: 'business',  label: 'Işewürlik karzy'     },
]

const PASSPORT_SERIES_OPTIONS = [
  { value: 'I',  label: 'I'  },
  { value: 'II', label: 'II' },
]

// ─── Form State Types ─────────────────────────────────────────────────────────

interface FormState {
  // Status & unique
  status: string
  uniqueCode: string
  // Loan
  loanType: string
  // Location
  region: string
  branch: string
  // Personal
  firstName: string
  lastName: string
  patronicName: string
  education: string
  marriageStatus: string
  dateOfBirth: string
  residence: string
  currentResidence: string
  // Passport
  passportSerie: string
  passportNumber: string
  passportDateOfIssue: string
  passportGivenBy: string
  bornPlace: string
  // Contact
  email: string
  phone: string
  phoneAdditional: string
  homePhone: string
  // Job
  workCompany: string
  workHrPhone: string
  workRegion: string
  workProvince: string
  position: string
  salary: string
  workStartedAt: string
  // Files
  passportPage1: File | null
  passportPage23: File | null
  passportPage89: File | null
  passportPage32: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  status: 'GARAŞYLÝAR',
  uniqueCode: '',
  loanType: '',
  region: 'Aşgabat',
  branch: '',
  firstName: '',
  lastName: '',
  patronicName: '',
  education: '',
  marriageStatus: '',
  dateOfBirth: '',
  residence: '',
  currentResidence: '',
  passportSerie: '',
  passportNumber: '',
  passportDateOfIssue: '',
  passportGivenBy: '',
  bornPlace: '',
  email: '',
  phone: '',
  phoneAdditional: '',
  homePhone: '',
  workCompany: '',
  workHrPhone: '',
  workRegion: 'Aşgabat',
  workProvince: '',
  position: '',
  salary: '',
  workStartedAt: '',
  passportPage1: null,
  passportPage23: null,
  passportPage89: null,
  passportPage32: null,
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, t: (k: string) => string): FormErrors {
  const errors: FormErrors = {}
  const req = (key: keyof FormState, label: string) => {
    const val = form[key]
    if (!val || (typeof val === 'string' && !val.trim())) {
      errors[key] = `${label} — ${t('required') || 'hökmany'}`
    }
  }

  req('loanType',     t('Loan type')     || 'Karz görnüşi')
  req('region',       t('Region')        || 'Welaýat')
  req('branch',       t('Branch')        || 'Şahamça')
  req('firstName',    t('Name')          || 'Ady')
  req('lastName',     t('Surname')       || 'Familiýasy')
  req('education',    t('Education')     || 'Bilimi')
  req('marriageStatus', t('Marriage status') || 'Maşgala ýagdaýy')
  req('dateOfBirth',  t('Date of birth') || 'Doglan güni')
  req('residence',    t('Residence (passport)') || 'Ýazgy edilen salgy')
  req('passportSerie',  t('Passport serie')  || 'Pasport seriýasy')
  req('passportNumber', t('Passport number') || 'Pasport belgisi')
  req('passportDateOfIssue', t('Passport date of issue') || 'Pasport berlen senesi')
  req('passportGivenBy', t('Passport given by') || 'Kim tarapyndan berildi')
  req('phone', t('Phone') || 'Telefon')
  req('workCompany',  t('Work company name') || 'Kärhananyň ady')
  req('position',     t('Position')      || 'Wezipe')
  req('salary',       t('Salary')        || 'Zähmet haky')
  req('workStartedAt', t('Work started at') || 'Işe başlan wagty')

  if (form.phone && form.phone.replace(/\D/g, '').length < 8) {
    errors.phone = 'Telefon belgisi nädogry'
  }

  if (!form.passportPage1) errors.passportPage1 = 'Pasport (sahypa 1) hökmany'
  if (!form.passportPage23) errors.passportPage23 = 'Pasport (sahypa 2-3) hökmany'

  return errors
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoanOrderCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateLoanOrder()

  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // Generic field updater
  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear error on change
    if (submitted) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }, [submitted])

  const handleSubmit = () => {
    setSubmitted(true)
    const errs = validate(form, t)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error(t('Write a correct data please') || 'Dogry maglumat girizmegiňizi haýyş edýäris.')
      // scroll to first error
      const firstErrorKey = Object.keys(errs)[0]
      document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const payload: LoanOrderCreatePayload = {
      status:       form.status,
      loanType:     form.loanType,
      region:       form.region,
      branch:       form.branch,
      firstName:    form.firstName,
      lastName:     form.lastName,
      patronicName: form.patronicName,
      education:    form.education,
      marriageStatus: form.marriageStatus,
      dateOfBirth:  form.dateOfBirth,
      residence:    form.residence,
      currentResidence: form.currentResidence,
      passportSerie:       form.passportSerie,
      passportNumber:      form.passportNumber,
      passportDateOfIssue: form.passportDateOfIssue,
      passportGivenBy:     form.passportGivenBy,
      bornPlace:           form.bornPlace,
      email:               form.email,
      phone:               form.phone,
      phoneAdditional:     form.phoneAdditional,
      homePhone:           form.homePhone,
      workCompany:         form.workCompany,
      workHrPhone:         form.workHrPhone,
      workRegion:          form.workRegion,
      workProvince:        form.workProvince,
      position:            form.position,
      salary:              Number(form.salary),
      workStartedAt:       form.workStartedAt,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('Loan order created') || 'Karz sargydy döredildi')
        navigate('/resources/loan-orders')
      },
      onError: () => {
        toast.error(t('Server Error') || 'Serwer ýalňyşlygy')
      },
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t('Loan order') || 'Karz sargyt döredüň'}
        </h1>
      </div>

      {/* ── Status & Unique ──────────────────────────────────────────────── */}
      <Section title={t('New Loan Order') || 'Täze Karz sargyt'}>
        <div className={grid2}>
          <div id="field-status">
            <FormInput
              type="select"
              label={t('Status') || 'Status'}
              required
              value={form.status}
              onChange={(v) => set('status', v)}
              options={STATUS_OPTIONS}
              error={errors.status}
              placeholder="Saýlaň"
            />
          </div>
          <div id="field-uniqueCode">
            <FormInput
              type="text"
              label={t('Unique code') || 'Unikal belgi'}
              value={form.uniqueCode}
              onChange={(v) => set('uniqueCode', v)}
              placeholder={t('Unique code') || 'Bellik'}
              error={errors.uniqueCode}
            />
          </div>
        </div>
      </Section>

      {/* ── Loan Type ────────────────────────────────────────────────────── */}
      <Section title={t('Loan') || 'Karz'}>
        <div id="field-loanType">
          <FormInput
            type="searchable-select"
            label={t('Loan type') || 'Karz görnüşi'}
            required
            value={form.loanType}
            onChange={(v) => set('loanType', v)}
            options={LOAN_TYPE_OPTIONS}
            placeholder="Saýlamak üçin basyň"
            error={errors.loanType}
          />
        </div>
      </Section>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <Section title={t('Location') || 'Lokasiýa'}>
        <div className={grid2}>
          <div id="field-region">
            <FormInput
              type="searchable-select"
              label={t('Region') || 'Welaýat'}
              required
              value={form.region}
              onChange={(v) => set('region', v)}
              options={REGION_OPTIONS}
              placeholder="Saýlamak üçin basyň"
              error={errors.region}
            />
          </div>
          <div id="field-branch">
            <FormInput
              type="searchable-select"
              label={t('Branch') || 'Şahamça'}
              required
              value={form.branch}
              onChange={(v) => set('branch', v)}
              options={[]}
              placeholder="Saýlamak üçin basyň"
              error={errors.branch}
            />
          </div>
        </div>
      </Section>

      {/* ── Personal Data ─────────────────────────────────────────────────── */}
      <Section title={t('Personal data') || 'Şahsy maglumatlar'}>
        <div className="flex flex-col gap-6">
          <div className={grid3}>
            <div id="field-firstName">
              <FormInput
                type="text"
                label={t('Name') || 'Ady'}
                required
                value={form.firstName}
                onChange={(v) => set('firstName', v)}
                placeholder={t('Name') || 'Ady'}
                error={errors.firstName}
              />
            </div>
            <div id="field-lastName">
              <FormInput
                type="text"
                label={t('Surname') || 'Familiýasy'}
                required
                value={form.lastName}
                onChange={(v) => set('lastName', v)}
                placeholder={t('Surname') || 'Familiýasy'}
                error={errors.lastName}
              />
            </div>
            <div id="field-patronicName">
              <FormInput
                type="text"
                label={t('Patronic name') || 'Atasynyň ady'}
                value={form.patronicName}
                onChange={(v) => set('patronicName', v)}
                placeholder={t('Patronic name') || 'Atasynyň ady'}
              />
            </div>
          </div>

          <div className={grid3}>
            <div id="field-education">
              <FormInput
                type="select"
                label={t('Education') || 'Bilimi'}
                required
                value={form.education}
                onChange={(v) => set('education', v)}
                options={EDUCATION_OPTIONS}
                placeholder="Saýlaň"
                error={errors.education}
              />
            </div>
            <div id="field-marriageStatus">
              <FormInput
                type="select"
                label={t('Marriage status') || 'Maşgala ýagdaýy'}
                required
                value={form.marriageStatus}
                onChange={(v) => set('marriageStatus', v)}
                options={MARRIAGE_OPTIONS}
                placeholder="Saýlaň"
                error={errors.marriageStatus}
              />
            </div>
            <div id="field-dateOfBirth">
              <FormInput
                type="date"
                label={t('Date of birth') || 'Doglan güni'}
                required
                value={form.dateOfBirth}
                onChange={(v) => set('dateOfBirth', v)}
                error={errors.dateOfBirth}
              />
            </div>
          </div>

          <div className={grid2}>
            <div id="field-residence">
              <FormInput
                type="text"
                label={t('Residence (passport)') || 'Ýazgy edilen salgyňyz'}
                required
                value={form.residence}
                onChange={(v) => set('residence', v)}
                placeholder={t('Residence (passport)') || 'Ýazgy edilen salgyňyz'}
                error={errors.residence}
              />
            </div>
            <div id="field-currentResidence">
              <FormInput
                type="text"
                label={t('Current Residence') || 'Häzirki ýaşaýyş ýeri'}
                value={form.currentResidence}
                onChange={(v) => set('currentResidence', v)}
                placeholder={t('Current Residence') || 'Häzirki ýaşaýyş ýeri'}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Passport ──────────────────────────────────────────────────────── */}
      <Section title={t('Passport') || 'Pasport'}>
        <div className="flex flex-col gap-6">
          <div className={grid3}>
            <div id="field-passportSerie">
              <FormInput
                type="searchable-select"
                label={t('Passport serie') || 'Pasport seriýasy'}
                required
                value={form.passportSerie}
                onChange={(v) => set('passportSerie', v)}
                options={PASSPORT_SERIES_OPTIONS}
                placeholder="Saýlamak üçin basyň"
                error={errors.passportSerie}
              />
            </div>
            <div id="field-passportNumber">
              <FormInput
                type="text"
                label={t('Passport number') || 'Pasport belgisi'}
                required
                value={form.passportNumber}
                onChange={(v) => set('passportNumber', v)}
                placeholder={t('Passport number') || 'Pasport belgisi'}
                error={errors.passportNumber}
              />
            </div>
            <div id="field-passportDateOfIssue">
              <FormInput
                type="date"
                label={t('Passport date of issue') || 'Pasport berlen senesi'}
                required
                value={form.passportDateOfIssue}
                onChange={(v) => set('passportDateOfIssue', v)}
                error={errors.passportDateOfIssue}
              />
            </div>
          </div>

          <div className={grid2}>
            <div id="field-passportGivenBy">
              <FormInput
                type="text"
                label={t('Passport given by') || 'Kim tarapyndan berildi'}
                required
                value={form.passportGivenBy}
                onChange={(v) => set('passportGivenBy', v)}
                placeholder={t('Passport given by') || 'Kim tarapyndan berildi'}
                error={errors.passportGivenBy}
              />
            </div>
            <div id="field-bornPlace">
              <FormInput
                type="text"
                label={t('Born place (passport)') || 'Doglan ýeri (pasport)'}
                value={form.bornPlace}
                onChange={(v) => set('bornPlace', v)}
                placeholder={t('Born place (passport)') || 'Doglan ýeri (pasport)'}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <Section title={t('Contact data') || 'Habarlaşmak üçin maglumatlar'}>
        <div className={grid4}>
          <div id="field-email">
            <FormInput
              type="email"
              label={t('Email') || 'E-poçta'}
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="E-poçta"
            />
          </div>
          <div id="field-phone">
            <FormInput
              type="phone"
              label={t('Phone') || 'Telefon'}
              required
              value={form.phone}
              onChange={(v) => set('phone', v)}
              placeholder="61 097 651"
              error={errors.phone}
            />
          </div>
          <div id="field-phoneAdditional">
            <FormInput
              type="phone"
              label={t('Phone Additional') || 'Telefon goşmaça'}
              value={form.phoneAdditional}
              onChange={(v) => set('phoneAdditional', v)}
              placeholder="61 097 651"
            />
          </div>
          <div id="field-homePhone">
            <FormInput
              type="phone"
              label={t('Home phone') || 'Öý telefony'}
              value={form.homePhone}
              onChange={(v) => set('homePhone', v)}
              placeholder="61 097 651"
            />
          </div>
        </div>
      </Section>

      {/* ── Job ───────────────────────────────────────────────────────────── */}
      <Section title={t('Job') || 'Iş'}>
        <div className="flex flex-col gap-6">
          <div className={grid2}>
            <div id="field-workCompany">
              <FormInput
                type="text"
                label={t('Work company name') || 'Işleýän edaranyň/kärhananyň ady'}
                required
                value={form.workCompany}
                onChange={(v) => set('workCompany', v)}
                placeholder={t('Work company name') || 'Işleýän edaranyň/kärhananyň ady'}
                error={errors.workCompany}
              />
            </div>
            <div id="field-workHrPhone">
              <FormInput
                type="phone"
                label={t('HR department work number') || 'Işgärler bölüminiň iş belgisi'}
                value={form.workHrPhone}
                onChange={(v) => set('workHrPhone', v)}
                placeholder="61 097 651"
              />
            </div>
          </div>

          <div className={grid2}>
            <div id="field-workRegion">
              <FormInput
                type="searchable-select"
                label={t('Work region') || 'Işleýän welaýatyňyz'}
                value={form.workRegion}
                onChange={(v) => set('workRegion', v)}
                options={REGION_OPTIONS}
                placeholder="Saýlamak üçin basyň"
              />
            </div>
            <div id="field-workProvince">
              <FormInput
                type="searchable-select"
                label={t('Work province') || 'Işleýän etrabyňyz'}
                value={form.workProvince}
                onChange={(v) => set('workProvince', v)}
                options={[]}
                placeholder="Saýlamak üçin basyň"
              />
            </div>
          </div>

          <div className={grid3}>
            <div id="field-position">
              <FormInput
                type="text"
                label={t('Position') || 'Wezipe'}
                required
                value={form.position}
                onChange={(v) => set('position', v)}
                placeholder={t('Position') || 'Wezipe'}
                error={errors.position}
              />
            </div>
            <div id="field-salary">
              <FormInput
                type="number"
                label={t('Salary') || 'Zähmet haky'}
                required
                value={form.salary}
                onChange={(v) => set('salary', v)}
                placeholder={t('Salary') || 'Zähmet haky'}
                error={errors.salary}
              />
            </div>
            <div id="field-workStartedAt">
              <FormInput
                type="date"
                label={t('Work started at') || 'Işe başlan wagtyňyz'}
                required
                value={form.workStartedAt}
                onChange={(v) => set('workStartedAt', v)}
                error={errors.workStartedAt}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Passport Files ────────────────────────────────────────────────── */}
      <Section title={t('Passport files') || 'Pasport faýýlar'}>
        <div className={grid2}>
          <div id="field-passportPage1">
            <FormInput
              type="file"
              label={t('Passport (page 1)') || 'Pasport (sahypa 1)'}
              required
              accept="image/*"
              fileValue={form.passportPage1}
              onFileChange={(f) => set('passportPage1', f)}
              placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
              error={errors.passportPage1}
            />
          </div>
          <div id="field-passportPage23">
            <FormInput
              type="file"
              label={t('Passport (page 2-3)') || 'Pasport (2-3-nji sahypa)'}
              required
              accept="image/*"
              fileValue={form.passportPage23}
              onFileChange={(f) => set('passportPage23', f)}
              placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
              error={errors.passportPage23}
            />
          </div>
          <div id="field-passportPage89">
            <FormInput
              type="file"
              label={t('Passport (page 8-9)') || 'Pasport (8-9 sahypa)'}
              accept="image/*"
              fileValue={form.passportPage89}
              onFileChange={(f) => set('passportPage89', f)}
              placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
            />
          </div>
          <div id="field-passportPage32">
            <FormInput
              type="file"
              label={t('Passport (page 32)') || 'Pasport (32-nji sahypa)'}
              accept="image/*"
              fileValue={form.passportPage32}
              onFileChange={(f) => set('passportPage32', f)}
              placeholder="Faýl saýlaň ýa-da salmak üçin basyň"
            />
          </div>
        </div>
      </Section>

      {/* ── Footer Actions ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={createMutation.isPending}
        >
          {t('Cancel') || 'Ýatyr'}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="min-w-[160px]"
        >
          {createMutation.isPending
            ? (t('Loading') || 'Ýüklenilýär...')
            : (t('loanOrderMobiles.createButton') || 'Karz sargyt döredüň')}
        </Button>
      </div>
    </div>
  )
}
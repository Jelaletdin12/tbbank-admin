import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FileText,
  User,
  Phone,
  CreditCard,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { StepBarCards, type StepCardItem } from "@/components/stepBarV2";
import {
  useCreateLoanOrderMobile,
  useUpdateLoanOrderMobile,
} from "@/features/loanOrderMobiles/hooks/useLoanOrderMobiles";
import type {
  LoanOrderMobile,
} from "@/features/loanOrderMobiles/api/loanOrderMobilesApi";
import { BRANCHES_BY_REGION_MOBILE } from "@/features/loanOrderMobiles/api/loanOrderMobilesApi";
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from "@/features/loanOrderMobiles/schemas/loanOrderMobile.schema";
import type { LoanOrderMobileFormData } from "@/features/loanOrderMobiles/schemas/loanOrderMobile.schema";

// ─── Static options ───────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  { value: "Aşgabat", label: "Aşgabat" },
  { value: "Ahal",    label: "Ahal"    },
  { value: "Balkan",  label: "Balkan"  },
  { value: "Daşoguz", label: "Daşoguz" },
  { value: "Lebap",   label: "Lebap"   },
  { value: "Mary",    label: "Mary"    },
  { value: "Arkadag", label: "Arkadag" },
];

const EDUCATION_OPTIONS = [
  { value: "high",            label: "Ýokary bilim"              },
  { value: "unfinished_high", label: "Gutarylmadyk ýokary bilim" },
  { value: "masters",         label: "Magistr"                   },
  { value: "phd",             label: "Ylymlaryň doktory"         },
  { value: "middle",          label: "Orta mekdep"               },
  { value: "school",          label: "Orta bilim"                },
  { value: "school_dropout",  label: "Gutarylmadyk orta bilim"   },
];

const MARRIAGE_OPTIONS = [
  { value: "MARRIED",  label: "Öýlenen / Durmuşa çykan"        },
  { value: "SINGLE",   label: "Öýlenmedik / Durmuşa çykmadyk"  },
  { value: "DIVORCED", label: "Aýrylşan"                       },
  { value: "WIDOW",    label: "Adamsy ýa-da aýaly aradan çykan" },
  { value: "LEGAL",    label: "Raýat nika"                     },
];

const STATUS_OPTIONS = [
  { value: "GARAŞYLÝAR",        label: "Garaşylýar"        },
  { value: "IŞLENÝÄR",          label: "Işlenýär"          },
  { value: "KANAGATLANDYRYLAN", label: "Kanagatlandyrylan" },
  { value: "RED_EDILDI",        label: "Red edildi"        },
];

const LOAN_TYPE_OPTIONS = [
  { value: "consumer", label: "Sarp ediş karzy" },
  { value: "mortgage", label: "Ipoteka"          },
  { value: "car",      label: "Awtoulag karzy"   },
  { value: "student",  label: "Talyplar üçin"    },
  { value: "business", label: "Işewürlik karzy"  },
];

const PASSPORT_SERIES_OPTIONS = [
  { value: "I",  label: "I"  },
  { value: "II", label: "II" },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}));

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  value: String(new Date().getFullYear() + i),
  label: String(new Date().getFullYear() + i),
}));

// ─── BentoGrid / BentoCard ────────────────────────────────────────────────────

function BentoGrid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];
  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

function BentoCard({
  title,
  span,
  children,
}: {
  title?: string;
  span?: "full" | 2 | 3;
  children: React.ReactNode;
}) {
  const spanClass =
    span === "full" ? "sm:col-span-full" :
    span === 2      ? "sm:col-span-2"    :
    span === 3      ? "sm:col-span-3"    : "";

  return (
    <div className={`bg-card border border-border rounded-xl p-5 space-y-4 ${spanClass}`}>
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof LoanOrderMobileFormData, string>>

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {}
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message
    if (msg) result[key as keyof LoanOrderMobileFormData] = msg
  }
  return result
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string;
  titleKey: string;
  titleFallback: string;
  subtitleKey: string;
  subtitleFallback: string;
  icon: LucideIcon;
  validate: (form: LoanOrderMobileFormData, mode: "create" | "edit") => FlatErrors;
}

const STEPS: StepDef[] = [
  {
    id: "loan",
    titleKey: "loanOrderMobileForm.steps.loan.title", titleFallback: "Karz",
    subtitleKey: "loanOrderMobileForm.steps.loan.subtitle", subtitleFallback: "Görnüş, möçber & lokasiýa",
    icon: FileText,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: "personal",
    titleKey: "loanOrderMobileForm.steps.personal.title", titleFallback: "Şahsy & Pasport",
    subtitleKey: "loanOrderMobileForm.steps.personal.subtitle", subtitleFallback: "Şahsyýet & pasport",
    icon: User,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: "contact",
    titleKey: "loanOrderMobileForm.steps.contact.title", titleFallback: "Habarlaşmak & Iş",
    subtitleKey: "loanOrderMobileForm.steps.contact.subtitle", subtitleFallback: "Telefon & iş",
    icon: Phone,
    validate: (form, mode) => validateStep(2, form, mode),
  },
  {
    id: "card",
    titleKey: "loanOrderMobileForm.steps.card.title", titleFallback: "Kart & Zamun",
    subtitleKey: "loanOrderMobileForm.steps.card.subtitle", subtitleFallback: "Töleg & zamun",
    icon: CreditCard,
    validate: (form, mode) => validateStep(3, form, mode),
  },
  {
    id: "files",
    titleKey: "loanOrderMobileForm.steps.files.title", titleFallback: "Faýllar & Status",
    subtitleKey: "loanOrderMobileForm.steps.files.subtitle", subtitleFallback: "Resminamalar",
    icon: Upload,
    validate: (form, mode) => validateStep(4, form, mode),
  },
];

// ─── Shared step content props ────────────────────────────────────────────────

interface StepContentProps {
  form: LoanOrderMobileFormData;
  errors: FlatErrors;
  set: <K extends keyof LoanOrderMobileFormData>(k: K, v: LoanOrderMobileFormData[K]) => void;
  t: TFunction;
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepLoan({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t('Loan type') || 'Karz görnüşi'}
            required
            value={form.loanType}
            onChange={(v) => set("loanType", v)}
            options={LOAN_TYPE_OPTIONS}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            error={errors.loanType}
          />
        </BentoCard>

        <BentoCard>
          <FormInput
            type="number"
            label={t('loanOrderForm.labels.loanAmount') || 'Karz möçberi'}
            required
            value={form.loanAmount}
            onChange={(v) => set("loanAmount", v)}
            placeholder={t('loanOrderForm.placeholders.amount') || '0.00'}
            error={errors.loanAmount}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t('Region') || 'Welaýat'}
            required
            value={form.region}
            onChange={(v) => { set("region", v); set("branch", ""); }}
            options={REGION_OPTIONS}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            error={errors.region}
          />
        </BentoCard>

        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t('Branch') || 'Şahamça'}
            required
            value={form.branch}
            onChange={(v) => set("branch", v)}
            options={BRANCHES_BY_REGION_MOBILE[form.region] ?? []}
            placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'}
            disabled={!form.region}
            error={errors.branch}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepPersonal({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="text" label={t('Name') || 'Ady'} required value={form.firstName} onChange={(v) => set("firstName", v)} placeholder={t('Name') || 'Ady'} error={errors.firstName} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Surname') || 'Familiýasy'} required value={form.lastName} onChange={(v) => set("lastName", v)} placeholder={t('Surname') || 'Familiýasy'} error={errors.lastName} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Patronic name') || 'Atasynyň ady'} value={form.patronicName} onChange={(v) => set("patronicName", v)} placeholder={t('Patronic name') || 'Atasynyň ady'} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="select" label={t('Education') || 'Bilimi'} required value={form.education} onChange={(v) => set("education", v)} options={EDUCATION_OPTIONS} placeholder={t('loanOrderForm.placeholders.select') || 'Saýlaň'} error={errors.education} />
        </BentoCard>
        <BentoCard>
          <FormInput type="select" label={t('Marriage status') || 'Maşgala ýagdaýy'} required value={form.marriageStatus} onChange={(v) => set("marriageStatus", v)} options={MARRIAGE_OPTIONS} placeholder={t('loanOrderForm.placeholders.select') || 'Saýlaň'} error={errors.marriageStatus} />
        </BentoCard>
        <BentoCard>
          <FormInput type="date" label={t('Date of birth') || 'Doglan güni'} required value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} error={errors.dateOfBirth} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput type="text" label={t('Residence (passport)') || 'Ýazgy edilen salgyňyz'} required value={form.residence} onChange={(v) => set("residence", v)} placeholder={t('loanOrderForm.placeholders.residence') || 'Ýazgy edilen salgy'} error={errors.residence} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Current Residence') || 'Häzirki ýaşaýyş ýeri'} value={form.currentResidence} onChange={(v) => set("currentResidence", v)} placeholder={t('loanOrderForm.placeholders.currentResidence') || 'Häzirki ýaşaýyş ýeri'} />
        </BentoCard>
        <BentoCard span="full">
          <FormInput type="searchable-select" label={t('Loan history') || 'Karz taryhy'} value={form.loanHistory} onChange={(v) => set("loanHistory", v)} options={[]} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="searchable-select" label={t('Passport serie') || 'Pasport seriýasy'} required value={form.passportSerie} onChange={(v) => set("passportSerie", v)} options={PASSPORT_SERIES_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.passportSerie} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Passport id') || 'Pasport belgisi'} required value={form.passportNumber} onChange={(v) => set("passportNumber", v)} placeholder={t('Passport id') || 'Pasport belgisi'} error={errors.passportNumber} />
        </BentoCard>
        <BentoCard>
          <FormInput type="date" label={t('Passport date of issue') || 'Pasport berlen senesi'} required value={form.passportDateOfIssue} onChange={(v) => set("passportDateOfIssue", v)} error={errors.passportDateOfIssue} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput type="text" label={t('Passport given by') || 'Kim tarapyndan berildi'} required value={form.passportGivenBy} onChange={(v) => set("passportGivenBy", v)} placeholder={t('Passport given by') || 'Kim tarapyndan berildi'} error={errors.passportGivenBy} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Born place (passport)') || 'Doglan ýeri (pasport)'} value={form.bornPlace} onChange={(v) => set("bornPlace", v)} placeholder={t('Born place (passport)') || 'Doglan ýeri (pasport)'} />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepContact({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard title={t('loanOrderForm.titles.contactMain') || 'Esasy'}>
          <FormInput type="phone" label={t('Phone') || 'Telefon'} required value={form.phone} onChange={(v) => set("phone", v)} placeholder={t('loanOrderForm.placeholders.phone') || '61 097 651'} error={errors.phone} />
          <FormInput type="email" label={t('Email') || 'E-poçta'} value={form.email} onChange={(v) => set("email", v)} placeholder={t('Email') || 'E-poçta'} />
        </BentoCard>
        <BentoCard title={t('loanOrderForm.titles.contactAdditional') || 'Goşmaça'}>
          <FormInput type="phone" label={t('Phone Additional') || 'Telefon goşmaça'} value={form.phoneAdditional} onChange={(v) => set("phoneAdditional", v)} placeholder={t('loanOrderForm.placeholders.phone') || '61 097 651'} />
          <FormInput type="phone" label={t('Home phone') || 'Öý telefony'} value={form.homePhone} onChange={(v) => set("homePhone", v)} placeholder={t('loanOrderForm.placeholders.phone') || '61 097 651'} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput type="text" label={t('Work company name') || 'Işleýän edaranyň/kärhananyň ady'} required value={form.workCompany} onChange={(v) => set("workCompany", v)} placeholder={t('loanOrderForm.placeholders.companyName') || 'Kärhananyň ady'} error={errors.workCompany} />
          <FormInput type="phone" label={t('HR department work number') || 'Işgärler bölüminiň iş belgisi'} value={form.workHrPhone} onChange={(v) => set("workHrPhone", v)} placeholder={t('loanOrderForm.placeholders.phone') || '61 097 651'} />
        </BentoCard>
        <BentoCard>
          <FormInput type="searchable-select" label={t('Work region') || 'Işleýän welaýatyňyz'} value={form.workRegion} onChange={(v) => set("workRegion", v)} options={REGION_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} />
          <FormInput type="searchable-select" label={t('Work province') || 'Işleýän etrabyňyz'} value={form.workProvince} onChange={(v) => set("workProvince", v)} options={[]} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="text" label={t('Position') || 'Wezipe'} required value={form.position} onChange={(v) => set("position", v)} placeholder={t('Position') || 'Wezipe'} error={errors.position} />
        </BentoCard>
        <BentoCard>
          <FormInput type="number" label={t('Salary') || 'Zähmet haky'} required value={form.salary} onChange={(v) => set("salary", v)} placeholder={t('Salary') || 'Zähmet haky'} error={errors.salary} />
        </BentoCard>
        <BentoCard>
          <FormInput type="date" label={t('Work started at') || 'Işe başlan wagtyňyz'} required value={form.workStartedAt} onChange={(v) => set("workStartedAt", v)} error={errors.workStartedAt} />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepCard({ form, errors, set, t }: StepContentProps) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard title={t('loanOrderForm.titles.cardInfo') || 'Kart maglumatlary'}>
          <FormInput type="text" label={t('Card number') || 'Kart belgisi'} required value={form.cardNumber} onChange={(v) => set("cardNumber", v)} placeholder={t('Card number') || 'Kart belgisi'} error={errors.cardNumber} />
          <FormInput type="text" label={t('Name on card') || 'Kartdaky ady'} required value={form.cardName} onChange={(v) => set("cardName", v)} placeholder={t('Name on card') || 'Kartdaky ady'} error={errors.cardName} />
        </BentoCard>
        <BentoCard title={t('loanOrderForm.titles.cardExpiry') || 'Kart möhleti'}>
          <FormInput type="searchable-select" label={t('loanOrderForm.labels.cardExpMonth') || 'Aý'} required value={form.cardExpMonth} onChange={(v) => set("cardExpMonth", v)} options={MONTH_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.cardExpMonth} />
          <FormInput type="searchable-select" label={t('loanOrderForm.labels.cardExpYear') || 'Ýyl'} required value={form.cardExpYear} onChange={(v) => set("cardExpYear", v)} options={YEAR_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.cardExpYear} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput type="text" label={t('Guarantor name') || 'Zamunyň ady'} required value={form.guarantor1Name} onChange={(v) => set("guarantor1Name", v)} placeholder={t('Guarantor name') || 'Zamunyň ady'} error={errors.guarantor1Name} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Guarantor Surname') || 'Zamunyň familiýasy'} required value={form.guarantor1Surname} onChange={(v) => set("guarantor1Surname", v)} placeholder={t('Guarantor Surname') || 'Zamunyň familiýasy'} error={errors.guarantor1Surname} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Guarantor Patronic name') || 'Zamunyň atasynyň ady'} value={form.guarantor1Patronic} onChange={(v) => set("guarantor1Patronic", v)} placeholder={t('Guarantor Patronic name') || 'Zamunyň atasynyň ady'} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput type="searchable-select" label={t('Passport serie') || 'Pasport seriýasy'} required value={form.guarantor1PassportSerie} onChange={(v) => set("guarantor1PassportSerie", v)} options={PASSPORT_SERIES_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.guarantor1PassportSerie} />
        </BentoCard>
        <BentoCard>
          <FormInput type="text" label={t('Passport id') || 'Pasport belgisi'} required value={form.guarantor1PassportNumber} onChange={(v) => set("guarantor1PassportNumber", v)} placeholder={t('Passport id') || 'Pasport belgisi'} error={errors.guarantor1PassportNumber} />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard title={t('loanOrderForm.guarantorCardInfo') || 'Zamunyň kart maglumatlary'}>
          <FormInput type="text" label={t('Card number') || 'Kart belgisi'} required value={form.guarantor1CardNumber} onChange={(v) => set("guarantor1CardNumber", v)} placeholder={t('Card number') || 'Kart belgisi'} error={errors.guarantor1CardNumber} />
          <FormInput type="text" label={t('Name on card') || 'Kartdaky ady'} required value={form.guarantor1CardName} onChange={(v) => set("guarantor1CardName", v)} placeholder={t('Name on card') || 'Kartdaky ady'} error={errors.guarantor1CardName} />
        </BentoCard>
        <BentoCard title={t('loanOrderForm.guarantorCardExpiry') || 'Zamunyň kart möhleti'}>
          <FormInput type="searchable-select" label={t('Expiration month') || 'Aý'} required value={form.guarantor1CardExpMonth} onChange={(v) => set("guarantor1CardExpMonth", v)} options={MONTH_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.guarantor1CardExpMonth} />
          <FormInput type="searchable-select" label={t('Expiration year') || 'Ýyl'} required value={form.guarantor1CardExpYear} onChange={(v) => set("guarantor1CardExpYear", v)} options={YEAR_OPTIONS} placeholder={t('loanOrderForm.placeholders.searchableSelect') || 'Saýlamak üçin basyň'} error={errors.guarantor1CardExpYear} />
          <FormInput type="number" label={t('loanOrderForm.labels.guarantor1Salary') || 'Ortaca zähmet haky'} required value={form.guarantor1Salary} onChange={(v) => set("guarantor1Salary", v)} placeholder={t('loanOrderForm.labels.guarantor1Salary') || 'Ortaca zähmet haky'} error={errors.guarantor1Salary} />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepFiles({
  form, errors, set, t, mode, initialData,
}: StepContentProps & { mode: "create" | "edit"; initialData?: LoanOrderMobile }) {
  const existingFiles =
    mode === "edit" && initialData
      ? [
          { url: initialData.passportPage1Url,  label: t('Passport (page 1)') || "Pasport (sahypa 1)"      },
          { url: initialData.passportPage23Url, label: t('Passport (page 2-3)') || "Pasport (2-3-nji sahypa)" },
          { url: initialData.passportPage89Url, label: t('Passport (page 8-9)') || "Pasport (8-9 sahypa)"     },
          { url: initialData.passportPage32Url, label: t('Passport (page 32)') || "Pasport (32-nji sahypa)"  },
        ].filter((f): f is { url: string; label: string } => !!f.url)
      : [];

  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput type="select" label={t('loanOrderForm.labels.status') || 'Status'} required value={form.status} onChange={(v) => set("status", v)} options={STATUS_OPTIONS} placeholder={t('loanOrderForm.placeholders.select') || 'Saýlaň'} error={errors.status} />
        </BentoCard>
        <BentoCard>
          <FormInput type="textarea" label={t('Note') || 'Bellik'} value={form.note} onChange={(v) => set("note", v)} placeholder={t('loanOrderForm.placeholders.note') || 'Bellik...'} rows={3} />
        </BentoCard>
      </BentoGrid>

      {existingFiles.length > 0 && (
        <BentoGrid cols={4}>
          {existingFiles.map(({ url, label }) => (
            <BentoCard key={label} title={label}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate block">
                {t('loanOrderForm.fileLabels.viewFile') || 'Faýly gör'}
              </a>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === "edit" ? (t('loanOrderForm.fileLabels.replacePage1') || 'Pasport (sahypa 1) (çalyşmak)') : (t('Passport (page 1)') || 'Pasport (sahypa 1)')}
            required={mode === "create"}
            accept="image/*"
            fileValue={form.passportPage1}
            onFileChange={(f) => set("passportPage1", f)}
            error={errors.passportPage1}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={mode === "edit" ? (t('loanOrderForm.fileLabels.replacePage23') || 'Pasport (2-3-nji sahypa) (çalyşmak)') : (t('Passport (page 2-3)') || 'Pasport (2-3-nji sahypa)')}
            required={mode === "create"}
            accept="image/*"
            fileValue={form.passportPage23}
            onFileChange={(f) => set("passportPage23", f)}
            error={errors.passportPage23}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={t('Passport (page 8-9)') || 'Pasport (8-9 sahypa)'}
            accept="image/*"
            fileValue={form.passportPage89}
            onFileChange={(f) => set("passportPage89", f)}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={t('Passport (page 32)') || 'Pasport (32-nji sahypa)'}
            accept="image/*"
            fileValue={form.passportPage32}
            onFileChange={(f) => set("passportPage32", f)}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoanOrderMobileFormProps {
  mode: "create" | "edit";
  initialData?: LoanOrderMobile;
  loanOrderId?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoanOrderMobileForm({ mode, initialData, loanOrderId }: LoanOrderMobileFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const createMutation = useCreateLoanOrderMobile();
  const updateMutation = useUpdateLoanOrderMobile();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    watch, setValue, getValues, formState: { errors: rhfErrors }, clearErrors, setError,
  } = useForm<LoanOrderMobileFormData>({ defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES });

  const form = watch();
  const [currentStep, setCurrentStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(
    () => mode === "edit" ? new Set(STEPS.map((_, i) => i)) : new Set<number>(),
  );
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>();
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i);
    });
    return out;
  }, [form, mode, visited, i18n.language]);

  const set = useCallback(<K extends keyof LoanOrderMobileFormData>(key: K, value: LoanOrderMobileFormData[K]) => {
    (setValue as (name: K, val: LoanOrderMobileFormData[K]) => void)(key, value);
    clearErrors(key);
  }, [setValue, clearErrors]);

  const allSubmittedErrors = useMemo(() => {
    const result: FlatErrors = {};
    for (const stepIdx of submittedSteps) {
      Object.assign(result, STEPS[stepIdx].validate(form, mode));
    }
    return result;
  }, [form, mode, submittedSteps, i18n.language]);
  const errors = useMemo(() => {
    const fromRHF = flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>)
    return { ...fromRHF, ...allSubmittedErrors }
  }, [rhfErrors, allSubmittedErrors]);

  const stepProps = useMemo(() => ({ form, errors, set, t }), [form, errors, set, t]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) =>
    setVisited((prev) => new Set([...prev, i]));

  const markSubmitted = (i: number) =>
    setSubmittedSteps((prev) => new Set([...prev, i]));

  const handleNext = () => {
    markVisited(currentStep);
    markSubmitted(currentStep);
    const errs = STEPS[currentStep].validate(form, mode);
    if (Object.keys(errs).length > 0) {
      Object.entries(errs).forEach(([key, msg]) => {
        setError(key as keyof LoanOrderMobileFormData, { type: "manual", message: msg });
      });
      toast.error(t("common.errors.fillRequiredCorrectly", "Dogry maglumat girizmegiňizi haýyş edýäris."));
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      markVisited(currentStep);
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoTo = (i: number) => {
    markVisited(currentStep);
    setCurrentStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const doSubmit = () => {
    setVisited(new Set(STEPS.map((_, i) => i)));
    setSubmittedSteps(new Set(STEPS.map((_, i) => i)));

    const allErrors: FlatErrors = {};
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode));

    if (Object.keys(allErrors).length > 0) {
      Object.entries(allErrors).forEach(([key, msg]) => {
        setError(key as keyof LoanOrderMobileFormData, { type: "manual", message: msg });
      });
      toast.error(t("common.errors.requiredFieldsMissing", "Käbir hökmany meýdanlar doldurylan däldir."));
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    const payload = buildPayload(getValues());

    if (mode === "create") {
      createMutation.mutate(payload, { onSuccess: () => navigate("/loan-order-mobiles") });
    } else {
      updateMutation.mutate(
        { id: loanOrderId!, payload },
        { onSuccess: () => navigate("/loan-order-mobiles") },
      );
    }
  };

  // ── StepBar items ───────────────────────────────────────────────────────────

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive  = i === currentStep;
    const hasErrors = stepsWithErrors.has(i);
    const isDone    = visited.has(i) && !hasErrors;
    return {
      id:       s.id,
      title:    t(s.titleKey) || s.titleFallback,
      subtitle: t(s.subtitleKey) || s.subtitleFallback,
      icon:     s.icon,
      status: isActive ? "active" : hasErrors ? "error" : isDone ? "done" : "idle",
    };
  });

  const isLastStep  = currentStep === STEPS.length - 1;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "create"
            ? (t("loanOrderMobiles.createTitle") || "Karz sargyt döredüň")
            : (t("loanOrderMobiles.editTitle")   || "Karz sargydy üýtget")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "create"
            ? (t("loanOrderMobiles.createDescription") || "Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.")
            : (t("loanOrderMobiles.editDescription")   || "Ähli meýdanlary dolduryp, ädim-ädim öň geçiň.")}
        </p>
      </div>

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {currentStep === 0 && <StepLoan    {...stepProps} />}
      {currentStep === 1 && <StepPersonal {...stepProps} />}
      {currentStep === 2 && <StepContact  {...stepProps} />}
      {currentStep === 3 && <StepCard     {...stepProps} />}
      {currentStep === 4 && <StepFiles    {...stepProps} mode={mode} initialData={initialData} />}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={currentStep === 0 ? () => navigate(-1) : undefined}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? doSubmit : undefined}
        submitLabel={
          mode === "create"
            ? (t("loanOrderMobiles.createButton") || "Karz sargyt döredüň")
            : (t("loanOrders.saveButton")         || "Ýatda sakla")
        }
        loadingLabel={t("Loading") || "Ýüklenilýär..."}
        cancelLabel={t("Cancel") || "Ýatyr"}
        prevLabel={t("common.prev") || "Yza"}
        nextLabel={t("common.next") || "Indiki"}
      />
    </div>
  );
}

function mapInitial(order: LoanOrderMobile): Partial<LoanOrderMobileFormData> {
  return {
    status:              order.status              ?? "GARAŞYLÝAR",
    loanType:            order.loanType            ?? "",
    region:              order.region              ?? "Aşgabat",
    branch:              order.branch              ?? "",
    firstName:           order.firstName           ?? "",
    lastName:            order.lastName            ?? "",
    patronicName:        order.patronicName        ?? "",
    education:           order.education           ?? "",
    marriageStatus:      order.marriageStatus      ?? "",
    dateOfBirth:         order.dateOfBirth         ?? "",
    residence:           order.residence           ?? "",
    currentResidence:    order.currentResidence    ?? "",
    passportSerie:       order.passportSerie       ?? "",
    passportNumber:      order.passportNumber      ?? "",
    passportDateOfIssue: order.passportDateOfIssue ?? "",
    passportGivenBy:     order.passportGivenBy     ?? "",
    bornPlace:           order.bornPlace           ?? "",
    email:               order.email               ?? "",
    phone:               order.phone               ?? "",
    phoneAdditional:     order.phoneAdditional     ?? "",
    homePhone:           order.homePhone           ?? "",
    workCompany:         order.workCompany         ?? "",
    workHrPhone:         order.workHrPhone         ?? "",
    workRegion:          order.workRegion          ?? "Aşgabat",
    workProvince:        order.workProvince        ?? "",
    position:            order.position            ?? "",
    salary:              order.salary != null ? String(order.salary) : "",
    workStartedAt:       order.workStartedAt       ?? "",
    note:                order.note                ?? "",
    loanAmount:          order.loanAmount != null ? String(order.loanAmount) : "",
    loanHistory:         order.loanHistory         ?? "",
    cardNumber:          order.cardNumber          ?? "",
    cardName:            order.cardName            ?? "",
    cardExpMonth:        order.cardExpMonth        ?? "",
    cardExpYear:         order.cardExpYear         ?? "",
    guarantor1Name:           order.guarantor1Name           ?? "",
    guarantor1Surname:        order.guarantor1Surname        ?? "",
    guarantor1Patronic:       order.guarantor1Patronic       ?? "",
    guarantor1PassportSerie:  order.guarantor1PassportSerie  ?? "",
    guarantor1PassportNumber: order.guarantor1PassportNumber ?? "",
    guarantor1CardNumber:     order.guarantor1CardNumber     ?? "",
    guarantor1CardName:       order.guarantor1CardName       ?? "",
    guarantor1CardExpMonth:   order.guarantor1CardExpMonth   ?? "",
    guarantor1CardExpYear:    order.guarantor1CardExpYear    ?? "",
    guarantor1Salary: order.guarantor1Salary != null ? String(order.guarantor1Salary) : "",
  };
}
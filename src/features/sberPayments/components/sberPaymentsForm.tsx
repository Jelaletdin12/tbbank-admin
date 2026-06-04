import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, MapPin, IdCard, CreditCard, Files } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { StepBarCards, type StepCardItem } from "@/components/stepBarV2";
import { BentoGrid, BentoCard } from "@/components/bento";
import { useCreateSberPayment, useUpdateSberPayment } from "@/features/sberPayments/hooks/useSberPayments";
import { WELAYATLAR, SAHAMCALAR, STATUSES, type SberPaymentOrder, type PaymentStatus } from "@/features/sberPayments/api/sberPaymentsApi";
import {
  validateStep,
  DEFAULT_FORM_VALUES,
  buildPayload,
  type SberPaymentFormData,
} from "@/features/sberPayments/schemas/sberPayment.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SberPaymentFormProps {
  mode: "create" | "edit";
  initialData?: SberPaymentOrder | null;
}

type FlatErrors = Partial<Record<keyof SberPaymentFormData, string>>;

// ─── Flatten RHF errors ──────────────────────────────────────────────────────

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof SberPaymentFormData] = msg;
  }
  return result;
}

// ─── Document lists ───────────────────────────────────────────────────────────

type AcceptedDocKey =
  | "acc_sberbank_card"
  | "acc_enrollment"
  | "acc_summons"
  | "acc_passport_tm"
  | "acc_zagran_passport"
  | "acc_visa_page"
  | "acc_entry_stamp"
  | "acc_school_letter";

type SentDocKey =
  | "snt_passport_tm"
  | "snt_zagran_passport"
  | "snt_entry_stamp"
  | "snt_relation_doc"
  | "snt_new_passport_series"
  | "snt_old_passport_series";

const ACCEPTED_DOCS = (t: (key: string, fallback?: string) => string): { key: AcceptedDocKey; label: string }[] => [
  { key: "acc_sberbank_card", label: t("sberPayments.documents.sberbankCard", "Talýba degişli SBERBANK kartynyň rekwizitleri") },
  { key: "acc_enrollment", label: t("sberPayments.documents.enrollment", "Daşary ýurt ÝOM-da okaýandygy baradaky güwänamasy") },
  { key: "acc_summons", label: t("sberPayments.documents.summons", "Çagyrylma hatynyn göçürmesi") },
  { key: "acc_passport_tm", label: t("sberPayments.documents.passportTm", "TM içki pasportynyň asyl görnüşi we göçürmesi") },
  { key: "acc_zagran_passport", label: t("sberPayments.documents.zagranPassport", "Daşary ýurt (zagran) pasportynyň göçürmesi") },
  { key: "acc_visa_page", label: t("sberPayments.documents.visaPage", "Daşary ýurda rugsat (wizasy) bellenen sahypasynyň göçürmesi") },
  {
    key: "acc_entry_stamp",
    label: t("sberPayments.documents.entryStamp", "Daşary ýurt döwletine girenliği baradaky ştamply sahypasynyň göçürmesi"),
  },
  { key: "acc_school_letter", label: t("sberPayments.documents.schoolLetter", "ÝOM-dan hat (daşary ýurt dilinde maglumatly)") },
];

const SENT_DOCS = (t: (key: string, fallback?: string) => string): { key: SentDocKey; label: string }[] => [
  {
    key: "snt_passport_tm",
    label: t("sberPayments.documents.sentPassportTm", "Ugradyjynyň TM içki pasportynyň asyl görnüşi we göçürmesi"),
  },
  {
    key: "snt_zagran_passport",
    label: t("sberPayments.documents.sentZagranPassport", "Ugradyjynyň daşary ýurt pasportynyň asyl görnüşi we göçürmesi"),
  },
  {
    key: "snt_entry_stamp",
    label: t("sberPayments.documents.sentEntryStamp", "Ugradyjynyň daşary döwletine girenliği ştamply sahypasynyň göçürmesi"),
  },
  {
    key: "snt_relation_doc",
    label: t("sberPayments.documents.sentRelationDoc", "Ugradyjy we kabul edijiniň garyndaşlyk tassyklaýjy resminamasynyn göçürmesi"),
  },
  {
    key: "snt_new_passport_series",
    label: t("sberPayments.documents.sentNewPassportSeries", "Ugradyjy/kabul ediji täze (2015+) pasport seriýasy maglumaty"),
  },
  {
    key: "snt_old_passport_series",
    label: t("sberPayments.documents.sentOldPassportSeries", "Ugradyjy/kabul ediji köne pasport seriýasy baradaky güwänamasy"),
  },
];

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepGeneral({
  form,
  errors,
  set,
  t,
}: {
  form: SberPaymentFormData;
  errors: FlatErrors;
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="searchable-select"
          label={t("sberPayments.fields.client_id", "Ulanyjy")}
          value={form.client_id}
          onChange={(v) => set("client_id", v)}
          options={[]}
          placeholder={t("sberPayments.placeholders.select", "Saýlamak üçin basyň")}
          required
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="select"
          label={t("sberPayments.fields.status", "Status")}
          value={form.status}
          onChange={(v) => set("status", v as PaymentStatus)}
          options={STATUSES}
          error={errors.status}
          required
        />
      </BentoCard>

      <BentoCard span="full">
        <FormInput
          type="textarea"
          label={t("sberPayments.fields.bellik", "Bellik")}
          value={form.bellik}
          onChange={(v) => set("bellik", v)}
          placeholder={t("sberPayments.placeholders.bellik", "Bellik...")}
          rows={2}
        />
      </BentoCard>
    </BentoGrid>
  );
}

function StepLocation({
  form,
  errors,
  set,
  t,
}: {
  form: SberPaymentFormData;
  errors: FlatErrors;
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void;
  t: (key: string, fallback?: string) => string;
}) {
  const branches = form.welayat ? (SAHAMCALAR[form.welayat] ?? []) : [];

  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="select"
          label={t("sberPayments.fields.welayat", "Welaýat")}
          value={form.welayat}
          onChange={(v) => {
            set("welayat", v);
            set("sahamca", "");
          }}
          options={WELAYATLAR.map((w) => ({ value: w, label: w }))}
          placeholder={t("sberPayments.placeholders.welayat", "Aşgabat")}
          error={errors.welayat}
          required
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="searchable-select"
          label={t("sberPayments.fields.sahamca", "Şahamça")}
          value={form.sahamca}
          onChange={(v) => set("sahamca", v)}
          options={branches.map((b) => ({ value: b, label: b }))}
          placeholder={t("sberPayments.placeholders.select", "Saýlamak üçin basyň")}
          disabled={!form.welayat}
          error={errors.sahamca}
          required
        />
      </BentoCard>
    </BentoGrid>
  );
}

function StepPersonal({
  form,
  errors,
  set,
  t,
}: {
  form: SberPaymentFormData;
  errors: FlatErrors;
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="text"
          label={t("sberPayments.fields.lastName", "Pasportdaky familiýa")}
          value={form.lastName}
          onChange={(v) => set("lastName", v)}
          placeholder={t("sberPayments.placeholders.lastName", "NURYYEW")}
          error={errors.lastName}
          required
        />
        <FormInput
          type="text"
          label={t("sberPayments.fields.firstName", "Pasportdaky ady")}
          value={form.firstName}
          onChange={(v) => set("firstName", v)}
          placeholder={t("sberPayments.placeholders.firstName", "HAÝDAR")}
          error={errors.firstName}
          required
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="phone"
          label={t("sberPayments.fields.phone", "Telefon")}
          value={form.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
          required
        />
        <FormInput
          type="email"
          label={t("sberPayments.fields.email", "E-poçta")}
          value={form.email}
          onChange={(v) => set("email", v)}
          placeholder={t("sberPayments.placeholders.email", "email@example.com")}
        />
      </BentoCard>

      <BentoCard span="full">
        <FormInput
          type="text"
          label={t("sberPayments.fields.address", "Salgy")}
          value={form.address}
          onChange={(v) => set("address", v)}
          placeholder={t("sberPayments.placeholders.address", "Köçe, jaý belgisi...")}
          error={errors.address}
          required
        />
      </BentoCard>
    </BentoGrid>
  );
}

function StepPayment({
  form,
  errors,
  set,
  t,
}: {
  form: SberPaymentFormData;
  errors: FlatErrors;
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <FormInput
          type="searchable-select"
          label={t("sberPayments.fields.passportSeries", "Pasport seriýasy")}
          value={form.passportSeries}
          onChange={(v) => set("passportSeries", v)}
          options={[
            { value: "II-MA", label: "II-MA" },
            { value: "II-MB", label: "II-MB" },
            { value: "II-MC", label: "II-MC" },
            { value: "II-MD", label: "II-MD" },
          ]}
          placeholder={t("sberPayments.placeholders.select", "Saýlamak üçin basyň")}
          error={errors.passportSeries}
          required
        />
        <FormInput
          type="text"
          label={t("sberPayments.fields.passportNumber", "Pasport nomeri")}
          value={form.passportNumber}
          onChange={(v) => set("passportNumber", v)}
          placeholder={t("sberPayments.placeholders.passportNumber", "A123456")}
          error={errors.passportNumber}
          required
        />
      </BentoCard>

      <BentoCard>
        <FormInput
          type="text"
          label={t("sberPayments.fields.fullName", "Ady Familiýasy Atasynyň ady")}
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
          placeholder={t("sberPayments.placeholders.fullName", "Doly ady...")}
          error={errors.fullName}
          required
        />
        <FormInput
          type="text"
          label={t("sberPayments.fields.accountNumber", "Goýum hasaby")}
          value={form.accountNumber}
          onChange={(v) => set("accountNumber", v)}
          placeholder={t("sberPayments.placeholders.accountNumber", "1234 5678 ...")}
          error={errors.accountNumber}
          required
        />
      </BentoCard>
    </BentoGrid>
  );
}

function StepDocs({
  form,
  set,
  t,
}: {
  form: SberPaymentFormData;
  set: <K extends keyof SberPaymentFormData>(k: K, v: SberPaymentFormData[K]) => void;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <BentoGrid cols={2}>
      <BentoCard>
        <div className="space-y-3">
          {ACCEPTED_DOCS(t).map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f as SberPaymentFormData[typeof key])}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </BentoCard>

      <BentoCard>
        <div className="space-y-3">
          {SENT_DOCS(t).map(({ key, label }) => (
            <FormInput
              key={key}
              type="file"
              label={label}
              onFileChange={(f) => set(key, f as SberPaymentFormData[typeof key])}
              fileValue={form[key] as File | null}
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </BentoCard>
    </BentoGrid>
  );
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string;
  titleKey: string;
  titleFallback: string;
  subtitleKey: string;
  subtitleFallback: string;
  icon: LucideIcon;
  validate: (form: SberPaymentFormData, mode: "create" | "edit", t: (key: string, fallback?: string) => string) => FlatErrors;
}

const STEPS: StepDef[] = [
  {
    id: "general",
    titleKey: "sberPayments.steps.general.title",
    titleFallback: "Esasy",
    subtitleKey: "sberPayments.steps.general.subtitle",
    subtitleFallback: "Status, müşderi",
    icon: User,
    validate: (f, m, t) => validateStep(0, f, m, t),
  },
  {
    id: "location",
    titleKey: "sberPayments.steps.location.title",
    titleFallback: "Lokasiýa",
    subtitleKey: "sberPayments.steps.location.subtitle",
    subtitleFallback: "Welaýat, şahamça",
    icon: MapPin,
    validate: (f, m, t) => validateStep(1, f, m, t),
  },
  {
    id: "personal",
    titleKey: "sberPayments.steps.personal.title",
    titleFallback: "Şahsy",
    subtitleKey: "sberPayments.steps.personal.subtitle",
    subtitleFallback: "Pasport, kontakt",
    icon: IdCard,
    validate: (f, m, t) => validateStep(2, f, m, t),
  },
  {
    id: "payment",
    titleKey: "sberPayments.steps.payment.title",
    titleFallback: "Töleg",
    subtitleKey: "sberPayments.steps.payment.subtitle",
    subtitleFallback: "Hasap, ugradyjy",
    icon: CreditCard,
    validate: (f, m, t) => validateStep(3, f, m, t),
  },
  {
    id: "docs",
    titleKey: "sberPayments.steps.docs.title",
    titleFallback: "Resminamalar",
    subtitleKey: "sberPayments.steps.docs.subtitle",
    subtitleFallback: "14 resminama",
    icon: Files,
    validate: () => ({}),
  },
];

// ─── Initial data mapper ──────────────────────────────────────────────────────

function mapInitialData(data: SberPaymentOrder): Partial<SberPaymentFormData> {
  return {
    welayat: data.welayat,
    sahamca: data.sahamca,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    status: data.status,
    bellik: data.bellik,
    accountNumber: data.accountNumber,
    passportSeries: data.passportSeries,
    passportNumber: data.passportNumber,
    fullName: data.fullName,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SberPaymentForm({ mode, initialData }: SberPaymentFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback((key, fallback) => _t(key, fallback ?? key) as string, [_t]);
  const navigate = useNavigate();
  const createMutation = useCreateSberPayment();
  const updateMutation = useUpdateSberPayment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    setError,
  } = useForm<SberPaymentFormData>({
    defaultValues: mode === "edit" && initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitialData(initialData) } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const [currentStep, setCurrentStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => (mode === "edit" ? new Set(STEPS.map((_, i) => i)) : new Set<number>()));
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>();
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode, t)).length > 0) out.add(i);
    });
    return out;
  }, [form, mode, visited, i18n.language, t]);

  const set = useCallback(
    <K extends keyof SberPaymentFormData>(key: K, value: SberPaymentFormData[K]) => {
      (setValue as (name: K, val: SberPaymentFormData[K]) => void)(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  const allSubmittedErrors = useMemo(() => {
    const result: FlatErrors = {};
    for (const stepIdx of submittedSteps) {
      Object.assign(result, STEPS[stepIdx].validate(form, mode, t));
    }
    return result;
  }, [form, mode, submittedSteps, i18n.language, t]);

  const errors = useMemo(() => {
    const fromRHF = flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>);
    return { ...fromRHF, ...allSubmittedErrors };
  }, [rhfErrors, allSubmittedErrors]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) => setVisited((prev) => new Set([...prev, i]));

  const markSubmitted = (i: number) => setSubmittedSteps((prev) => new Set([...prev, i]));

  const handleNext = () => {
    markVisited(currentStep);
    markSubmitted(currentStep);
    const errs = STEPS[currentStep].validate(form, mode, t);
    if (Object.keys(errs).length > 0) {
      Object.entries(errs).forEach(([key, msg]) => {
        setError(key as keyof SberPaymentFormData, { type: "manual", message: msg });
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
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode, t));

    if (Object.keys(allErrors).length > 0) {
      Object.entries(allErrors).forEach(([key, msg]) => {
        setError(key as keyof SberPaymentFormData, { type: "manual", message: msg });
      });
      toast.error(t("common.errors.requiredFieldsMissing", "Käbir hökmany meýdanlar doldurylan däldir."));
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode, t)).length > 0) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    const payload = buildPayload(getValues());

    if (mode === "create") {
      createMutation.mutate(payload, { onSuccess: () => navigate("/sber-payments") });
    } else if (initialData) {
      updateMutation.mutate({ ...payload, id: initialData.id }, { onSuccess: () => navigate("/sber-payments") });
    }
  };

  // ── StepBarCards data ──

  const stepBarItems: StepCardItem[] = STEPS.map((s, i) => {
    const isActive = i === currentStep;
    const hasErrors = stepsWithErrors.has(i);
    const isDone = visited.has(i) && !hasErrors;
    return {
      id: s.id,
      title: t(s.titleKey) || s.titleFallback,
      subtitle: t(s.subtitleKey) || s.subtitleFallback,
      icon: s.icon,
      status: isActive ? "active" : hasErrors ? "error" : isDone ? "done" : "idle",
    };
  });

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="mx-auto space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-foreground">
        {mode === "create"
          ? t("sberPayments.formTitle.create", "Sber töleg dörediň")
          : t("sberPayments.formTitle.edit", "Sber töleg redaktirläň")}
      </h1>

      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {STEPS[currentStep].id === "general" && <StepGeneral form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === "location" && <StepLocation form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === "personal" && <StepPersonal form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === "payment" && <StepPayment form={form} errors={errors} set={set} t={t} />}
      {STEPS[currentStep].id === "docs" && <StepDocs form={form} set={set} t={t} />}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={() => navigate("/sber-payments")}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? doSubmit : undefined}
        submitLabel={
          mode === "create"
            ? t("sberPayments.buttons.create", "Sber töleg (talyplar üçin) dörediň")
            : t("sberPayments.buttons.update", "Ýatda sakla")
        }
        loadingLabel={t("sberPayments.buttons.loading", "Ýüklenýär...")}
      />
    </div>
  );
}

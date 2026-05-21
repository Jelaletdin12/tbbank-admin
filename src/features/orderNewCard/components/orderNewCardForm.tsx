import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { CreditCard, User, FileText, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { StepBarCards, type StepCardItem } from "@/components/stepBarV2";
import { BentoGrid, BentoCard } from "@/components/bento";
import type { SelectOption } from "@/components/formInput";
import type { CardOrder, CardOrderStatus, CreateCardOrderPayload } from "../api/orderNewCardApi";
import {
  useCardIssuanceReasons,
  useCardTypes,
  useProvinces,
  useBranches,
  useCreateCardOrder,
  useUpdateCardOrder,
} from "../hooks/useOrderNewCard";
import { validateStep, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/orderNewCard.schema";
import type { OrderNewCardFormData } from "../schemas/orderNewCard.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardOrderFormProps {
  mode: "create" | "edit";
  initialData?: CardOrder;
}

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof OrderNewCardFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof OrderNewCardFormData] = msg;
  }
  return result;
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string;
  titleKey: string;
  titleFallback: string;
  subtitleKey: string;
  subtitleFallback: string;
  icon: LucideIcon;
  validate: (form: OrderNewCardFormData, mode: "create" | "edit") => FlatErrors;
}

const STEPS: StepDef[] = [
  {
    id: "card",
    titleKey: "cardOrder.step.card",
    titleFallback: "Kart",
    subtitleKey: "orderNewCardForm.steps.card.subtitle",
    subtitleFallback: "Görnüş & lokasiýa",
    icon: CreditCard,
    validate: (form, mode) => validateStep(0, form, mode),
  },
  {
    id: "personal",
    titleKey: "cardOrder.step.personal",
    titleFallback: "Şahsy",
    subtitleKey: "orderNewCardForm.steps.personal.subtitle",
    subtitleFallback: "Maglumatlar",
    icon: User,
    validate: (form, mode) => validateStep(1, form, mode),
  },
  {
    id: "passport",
    titleKey: "cardOrder.step.passport",
    titleFallback: "Pasport",
    subtitleKey: "orderNewCardForm.steps.passport.subtitle",
    subtitleFallback: "Resmi maglumat",
    icon: FileText,
    validate: (form, mode) => validateStep(2, form, mode),
  },
  {
    id: "files",
    titleKey: "cardOrder.step.files",
    titleFallback: "Faýllar",
    subtitleKey: "orderNewCardForm.steps.files.subtitle",
    subtitleFallback: "Ýüklemek & Tassyklamak",
    icon: Upload,
    validate: (form, mode) => validateStep(3, form, mode),
  },
];

// ─── Shared step content props ────────────────────────────────────────────────

interface StepContentProps {
  form: OrderNewCardFormData;
  errors: FlatErrors;
  set: <K extends keyof OrderNewCardFormData>(k: K, v: OrderNewCardFormData[K]) => void;
  t: TFunction;
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepCard({
  form,
  errors,
  set,
  t,
  statusOptions,
  issuanceReasonOptions,
  cardTypeOptions,
  provinceOptions,
  branchOptions,
}: StepContentProps & {
  statusOptions: SelectOption[];
  issuanceReasonOptions: SelectOption[];
  cardTypeOptions: SelectOption[];
  provinceOptions: SelectOption[];
  branchOptions: SelectOption[];
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label={t("loanOrderForm.labels.status") || "Status"}
            required
            value={form.status}
            onChange={(v) => set("status", v as CardOrderStatus)}
            options={statusOptions}
            placeholder={t("loanOrderForm.placeholders.select") || "Saýlaň"}
            error={errors.status}
          />
          <FormInput
            type="textarea"
            label={t("Note") || "Bellik"}
            value={form.note}
            onChange={(v) => set("note", v)}
            placeholder={t("loanOrderForm.placeholders.note") || "Bellik..."}
            rows={3}
          />
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-2">
            <input
              id="isPaid"
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => set("isPaid", e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <label
              htmlFor="isPaid"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
            >
              {t("orderNewCardForm.isPaid") || "Tölenen"}
            </label>
          </div>
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t("Reason for issuing the card") || "Kartyň çykarylmagynyň sebäbi"}
            required
            value={form.issuanceReasonId}
            onChange={(v) => set("issuanceReasonId", v)}
            options={issuanceReasonOptions}
            placeholder={t("loanOrderForm.placeholders.searchableSelect") || "Saýlamak üçin basyň"}
            error={errors.issuanceReasonId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t("Card type") || "Kart görnüşi"}
            required
            value={form.cardTypeId}
            onChange={(v) => set("cardTypeId", v)}
            options={cardTypeOptions}
            placeholder={t("loanOrderForm.placeholders.searchableSelect") || "Saýlamak üçin basyň"}
            error={errors.cardTypeId}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="select"
            label={t("Region") || "Welaýat"}
            required
            value={form.provinceId}
            onChange={(v) => {
              set("provinceId", v);
              set("branchId", "");
            }}
            options={provinceOptions}
            placeholder={t("loanOrderForm.placeholders.select") || "Saýlaň"}
            error={errors.provinceId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t("Branch") || "Şahamça"}
            required
            value={form.branchId}
            onChange={(v) => set("branchId", v)}
            options={branchOptions}
            disabled={!form.provinceId}
            placeholder={t("loanOrderForm.placeholders.searchableSelect") || "Saýlamak üçin basyň"}
            error={errors.branchId}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepPersonal({
  form,
  errors,
  set,
  t,
  citizenshipOptions,
}: StepContentProps & {
  citizenshipOptions: SelectOption[];
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Name") || "Ady"}
            required
            value={form.firstName}
            onChange={(v) => set("firstName", v)}
            placeholder={t("Name") || "Ady"}
            error={errors.firstName}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Surname") || "Familiýasy"}
            required
            value={form.lastName}
            onChange={(v) => set("lastName", v)}
            placeholder={t("Surname") || "Familiýasy"}
            error={errors.lastName}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Patronic name") || "Atasynyň ady"}
            value={form.middleName}
            onChange={(v) => set("middleName", v)}
            placeholder={t("Patronic name") || "Atasynyň ady"}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Old surname (if changed)") || "Köne familiýaňyz (eger üýtgän bolsa)"}
            value={form.formerLastName}
            onChange={(v) => set("formerLastName", v)}
            placeholder={t("orderNewCardForm.placeholders.formerLastName") || "Köne familiýaňyz"}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="date"
            label={t("Date of birth") || "Doglan güni"}
            required
            value={form.birthDate}
            onChange={(v) => set("birthDate", v)}
            error={errors.birthDate}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="phone"
            label={t("Phone") || "Telefon"}
            required
            value={form.phone}
            onChange={(v) => set("phone", v)}
            error={errors.phone}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="phone"
            label={t("Phone Additional") || "Telefon goşmaça"}
            value={form.phoneExtra}
            onChange={(v) => set("phoneExtra", v)}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="select"
            label={t("Citizenship") || "Raýatlyk"}
            required
            value={form.citizenship}
            onChange={(v) => set("citizenship", v)}
            options={citizenshipOptions}
            error={errors.citizenship}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("orderNewCardForm.labels.registeredAddress") || "Ýazgy edilen salgyňyz"}
            required
            value={form.registeredAddress}
            onChange={(v) => set("registeredAddress", v)}
            placeholder={t("orderNewCardForm.labels.registeredAddress") || "Ýazgy edilen salgyňyz"}
            error={errors.registeredAddress}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("orderNewCardForm.labels.currentAddress") || "Häzirki ýaşaýyş ýeri"}
            required
            value={form.currentAddress}
            onChange={(v) => set("currentAddress", v)}
            placeholder={t("orderNewCardForm.labels.currentAddress") || "Häzirki ýaşaýyş ýeri"}
            error={errors.currentAddress}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={1}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("orderNewCardForm.labels.workplace") || "Işleýän ýeriňiz we wezipäňiz"}
            required
            value={form.workplace}
            onChange={(v) => set("workplace", v)}
            placeholder={t("orderNewCardForm.labels.workplace") || "Işleýän ýeriňiz we wezipäňiz"}
            error={errors.workplace}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepPassport({
  form,
  errors,
  set,
  t,
  passportSeriesOptions,
}: StepContentProps & {
  passportSeriesOptions: SelectOption[];
}) {
  return (
    <div className="space-y-4">
      <BentoGrid cols={3}>
        <BentoCard>
          <FormInput
            type="select"
            label={t("Passport serie") || "Pasport seriýasy"}
            required
            value={form.passportSeriesId}
            onChange={(v) => set("passportSeriesId", v)}
            options={passportSeriesOptions}
            placeholder={t("loanOrderForm.placeholders.select") || "Saýlaň"}
            error={errors.passportSeriesId}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Passport id") || "Pasport belgisi"}
            required
            value={form.passportNumber}
            onChange={(v) => set("passportNumber", v)}
            placeholder={t("Passport id") || "Pasport belgisi"}
            error={errors.passportNumber}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="date"
            label={t("Passport date of issue") || "Pasport berlen senesi"}
            required
            value={form.passportIssueDate}
            onChange={(v) => set("passportIssueDate", v)}
            error={errors.passportIssueDate}
          />
        </BentoCard>
      </BentoGrid>

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Passport given by") || "Kim tarapyndan berildi"}
            required
            value={form.passportIssuedBy}
            onChange={(v) => set("passportIssuedBy", v)}
            placeholder={t("Passport given by") || "Kim tarapyndan berildi"}
            error={errors.passportIssuedBy}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("Born place (passport)") || "Doglan ýeri (pasport)"}
            required
            value={form.passportBirthPlace}
            onChange={(v) => set("passportBirthPlace", v)}
            placeholder={t("Born place (passport)") || "Doglan ýeri (pasport)"}
            error={errors.passportBirthPlace}
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

function StepFiles({ form, errors, set, t, mode, initialData }: StepContentProps & { mode: "create" | "edit"; initialData?: CardOrder }) {
  const existingFiles =
    mode === "edit" && initialData
      ? [
          { url: initialData.passportFiles.page1, label: t("Passport (page 1)") || "Pasport (sahypa 1)" },
          { url: initialData.passportFiles.page23, label: t("Passport (page 2-3)") || "Pasport (2-3-nji sahypa)" },
          { url: initialData.passportFiles.page89, label: t("Passport (page 8-9)") || "Pasport (8-9 sahypa)" },
          { url: initialData.passportFiles.page32, label: t("Passport (page 32)") || "Pasport (32-nji sahypa)" },
        ].filter((f): f is { url: string; label: string } => !!f.url)
      : [];

  return (
    <div className="space-y-4">
      {existingFiles.length > 0 && (
        <BentoGrid cols={4}>
          {existingFiles.map(({ url, label }) => (
            <BentoCard key={label} title={label}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate block">
                {t("loanOrderForm.fileLabels.viewFile") || "Faýly gör"}
              </a>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="file"
            label={
              mode === "edit"
                ? t("loanOrderForm.fileLabels.replacePage1") || "Pasport (sahypa 1) (çalyşmak)"
                : t("Passport (page 1)") || "Pasport (sahypa 1)"
            }
            required={mode === "create"}
            accept="image/*,.pdf"
            fileValue={form.passportPage1}
            onFileChange={(f) => set("passportPage1", f)}
            error={errors.passportPage1}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={
              mode === "edit"
                ? t("loanOrderForm.fileLabels.replacePage23") || "Pasport (2-3-nji sahypa) (çalyşmak)"
                : t("Passport (page 2-3)") || "Pasport (2-3-nji sahypa)"
            }
            required={mode === "create"}
            accept="image/*,.pdf"
            fileValue={form.passportPage23}
            onFileChange={(f) => set("passportPage23", f)}
            error={errors.passportPage23}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={t("Passport (page 8-9)") || "Pasport (8-9 sahypa)"}
            required={mode === "create"}
            accept="image/*,.pdf"
            fileValue={form.passportPage89}
            onFileChange={(f) => set("passportPage89", f)}
            error={errors.passportPage89}
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="file"
            label={t("Passport (page 32)") || "Pasport (32-nji sahypa)"}
            required={mode === "create"}
            accept="image/*,.pdf"
            fileValue={form.passportPage32}
            onFileChange={(f) => set("passportPage32", f)}
            error={errors.passportPage32}
          />
        </BentoCard>
      </BentoGrid>

      {mode === "create" && (
        <BentoGrid cols={1}>
          <BentoCard>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${errors.termsAccepted ? "bg-destructive/10 border border-destructive/30" : "bg-primary/5 border border-primary/20"}`}
              onClick={() => set("termsAccepted", !form.termsAccepted)}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors
                  ${form.termsAccepted ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
              >
                {form.termsAccepted && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${errors.termsAccepted ? "text-destructive" : "text-primary"}`}>
                {t("I accept terms of contract") || "Şertnama bilen razylaşýaryn (Okamak üçin bas)"}
              </span>
            </div>
          </BentoCard>
        </BentoGrid>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardOrderForm({ mode, initialData }: CardOrderFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createMutation = useCreateCardOrder();
  const updateMutation = useUpdateCardOrder(initialData?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    setError,
  } = useForm<OrderNewCardFormData>({
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const [currentStep, setCurrentStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => (mode === "edit" ? new Set(STEPS.map((_, i) => i)) : new Set<number>()));
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());

  // ── Lookup data ────────────────────────────────────────────────────────────

  const { data: reasons = [] } = useCardIssuanceReasons();
  const { data: cardTypes = [] } = useCardTypes();
  const { data: provinces = [] } = useProvinces();
  const { data: branches = [] } = useBranches(form.provinceId ? Number(form.provinceId) : undefined);

  const toOptions = (arr: { id: number; name: string }[]): SelectOption[] => arr.map((x) => ({ value: String(x.id), label: x.name }));

  const statusOptions: SelectOption[] = [
    { value: "PENDING", label: t("cardOrder.status.pending", "Garaşylýar") },
    { value: "APPROVED", label: t("cardOrder.status.approved", "Tassyklandy") },
    { value: "REJECTED", label: t("cardOrder.status.rejected", "Ýatyryldy") },
  ];

  const citizenshipOptions: SelectOption[] = [
    { value: "Turkmenistan", label: t("citizenship.tm", "Turkmenistan") },
    { value: "Russia", label: t("citizenship.ru", "Russiýa") },
    { value: "Other", label: t("citizenship.other", "Beýlekiler") },
  ];

  const passportSeriesOptions: SelectOption[] = [
    { value: "1", label: "I" },
    { value: "2", label: "II" },
    { value: "3", label: "III" },
  ];

  // ── Computed step error state ──────────────────────────────────────────────

  const stepsWithErrors = useMemo(() => {
    const out = new Set<number>();
    visited.forEach((i) => {
      if (Object.keys(STEPS[i].validate(form, mode)).length > 0) out.add(i);
    });
    return out;
  }, [form, mode, visited]);

  // ── set helper ─────────────────────────────────────────────────────────────

  const set = useCallback(
    <K extends keyof OrderNewCardFormData>(key: K, value: OrderNewCardFormData[K]) => {
      (setValue as (name: K, val: OrderNewCardFormData[K]) => void)(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  const currentStepErrors = useMemo(
    () => (submittedSteps.has(currentStep) ? STEPS[currentStep].validate(form, mode) : {}),
    [currentStep, form, mode, submittedSteps],
  );
  const errors = useMemo(() => {
    const fromRHF = flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>);
    return { ...fromRHF, ...currentStepErrors };
  }, [rhfErrors, currentStepErrors]);

  const stepProps = useMemo(() => ({ form, errors, set, t }), [form, errors, set, t]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const markVisited = (i: number) => setVisited((prev) => new Set([...prev, i]));

  const markSubmitted = (i: number) => setSubmittedSteps((prev) => new Set([...prev, i]));

  const handleNext = () => {
    markVisited(currentStep);
    markSubmitted(currentStep);
    const errs = STEPS[currentStep].validate(form, mode);
    if (Object.keys(errs).length > 0) {
      Object.entries(errs).forEach(([key, msg]) => {
        setError(key as keyof OrderNewCardFormData, { type: "manual", message: msg });
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

  // ── Submit ─────────────────────────────────────────────────────────────────

  const doSubmit = async () => {
    setVisited(new Set(STEPS.map((_, i) => i)));
    setSubmittedSteps(new Set(STEPS.map((_, i) => i)));

    const allErrors: FlatErrors = {};
    for (const step of STEPS) Object.assign(allErrors, step.validate(form, mode));

    if (Object.keys(allErrors).length > 0) {
      Object.entries(allErrors).forEach(([key, msg]) => {
        setError(key as keyof OrderNewCardFormData, { type: "manual", message: msg });
      });
      toast.error(t("validation.fixErrors", "Käbir hökmany meýdanlar doldurylan däldir."));
      for (let i = 0; i < STEPS.length; i++) {
        if (Object.keys(STEPS[i].validate(form, mode)).length > 0) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    const payload = buildPayload(getValues());

    try {
      if (mode === "edit") {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload as CreateCardOrderPayload);
      }
      navigate("/order-new-card");
    } catch {
      // errors handled in hooks via toast
    }
  };

  // ── StepBar items ───────────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">
        {mode === "create" ? t("cardOrder.createTitle") || "Täze karz orderi" : t("cardOrder.editTitle") || "Karz orderini üýtget"}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {mode === "create"
          ? t("loanOrders.createDescription") || "Ähli meýdanlary dolduryp, ädim-ädim öň geçiň."
          : t("loanOrders.editDescription") || "Ähli meýdanlary dolduryp, ädim-ädim öň geçiň."}
      </p>
      {/* Step bar */}
      <div className="bg-card border border-border rounded-xl p-3 overflow-x-auto">
        <StepBarCards steps={stepBarItems} onGoTo={handleGoTo} />
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <StepCard
          {...stepProps}
          statusOptions={statusOptions}
          issuanceReasonOptions={toOptions(reasons)}
          cardTypeOptions={toOptions(cardTypes)}
          provinceOptions={toOptions(provinces)}
          branchOptions={toOptions(branches)}
        />
      )}
      {currentStep === 1 && <StepPersonal {...stepProps} citizenshipOptions={citizenshipOptions} />}
      {currentStep === 2 && <StepPassport {...stepProps} passportSeriesOptions={passportSeriesOptions} />}
      {currentStep === 3 && <StepFiles {...stepProps} mode={mode} initialData={initialData} />}

      {/* Actions */}
      <FormActions
        isPending={isPending}
        onCancel={currentStep === 0 ? () => navigate("/order-new-card") : undefined}
        onPrev={currentStep > 0 ? handleBack : undefined}
        onNext={!isLastStep ? handleNext : undefined}
        showSubmit={isLastStep}
        onSubmit={isLastStep ? doSubmit : undefined}
        submitLabel={mode === "create" ? t("cardOrder.submit") || "Kart sargyt dörediň" : t("common.save") || "Ýatda sakla"}
        loadingLabel={t("common.saving") || "Ýüklenilýär..."}
        cancelLabel={t("common.cancel") || "Ýatyr"}
        prevLabel={t("common.prev") || "Yza"}
        nextLabel={t("common.next") || "Indiki"}
      />
    </div>
  );
}

function mapInitial(data: CardOrder): Partial<OrderNewCardFormData> {
  return {
    isPaid: data.isPaid,
    status: data.status,
    note: data.note ?? "",
    issuanceReasonId: String(data.issuanceReasonId),
    cardTypeId: String(data.cardTypeId),
    provinceId: String(data.provinceId),
    branchId: String(data.branchId),
    firstName: data.firstName,
    lastName: data.lastName,
    middleName: data.middleName ?? "",
    formerLastName: data.formerLastName ?? "",
    birthDate: data.birthDate,
    phone: data.phone,
    phoneExtra: data.phoneExtra ?? "",
    citizenship: data.citizenship,
    registeredAddress: data.registeredAddress,
    currentAddress: data.currentAddress,
    workplace: data.workplace,
    passportSeriesId: String(data.passportSeriesId),
    passportNumber: data.passportNumber,
    passportIssueDate: data.passportIssueDate,
    passportIssuedBy: data.passportIssuedBy,
    passportBirthPlace: data.passportBirthPlace,
  };
}

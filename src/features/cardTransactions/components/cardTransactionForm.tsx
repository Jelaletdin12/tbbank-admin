import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import type { CardTransaction } from "../api/cardTransactionsApi";
import { useCreateCardTransaction, useUpdateCardTransaction } from "../hooks/useCardTransactions";
import { cardTransactionFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/cardTransaction.schema";
import type { CardTransactionFormData } from "../schemas/cardTransaction.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardTransactionFormProps {
  mode: "create" | "edit";
  initialData?: CardTransaction;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSPORT_SERIES_OPTIONS = [
  { value: "I-LB", label: "I-LB" },
  { value: "II-LB", label: "II-LB" },
  { value: "III-LB", label: "III-LB" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const val = String(i + 1).padStart(2, "0");
  return { value: val, label: val };
});

const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = String(new Date().getFullYear() + i);
  return { value: year, label: year };
});

// ─── Form errors helper ───────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof CardTransactionFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof CardTransactionFormData] = msg;
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardTransactionForm({ mode, initialData }: CardTransactionFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    setError,
  } = useForm<CardTransactionFormData>({
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...initialData } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  const createMutation = useCreateCardTransaction();
  const updateMutation = useUpdateCardTransaction(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const setField = (field: keyof CardTransactionFormData) => (value: string) => {
    setValue(field, value);
    clearErrors(field);
  };

  const errMsg = (msg: string | undefined) => (!msg ? undefined : msg.startsWith("validation.") ? t(msg, msg) : msg);

  const handleSubmit = async () => {
    const result = cardTransactionFormSchema.safeParse(getValues());
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CardTransactionFormData;
        setError(key, { message: issue.message });
      }
      return;
    }

    if (mode === "create") {
      await createMutation.mutateAsync(buildPayload(result.data));
      navigate("/card-transactions");
    } else {
      await updateMutation.mutateAsync(buildPayload(result.data));
      navigate(`/card-transactions/${initialData!.id}`);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      navigate("/card-transactions");
    } else {
      navigate(`/card-transactions/${initialData!.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create"
          ? t("cardTransaction.createTitle", "Kart herekedi dörediň")
          : t("cardTransaction.editTitle", "Kart herekedi üýtgetmek")}
      </h1>
      <BentoGrid cols={1}>
        <BentoCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passport Series */}
            <FormInput
              type="searchable-select"
              label={t("Passport series", "Pasport seriýasy")}
              value={form.passport_series}
              onChange={setField("passport_series")}
              options={PASSPORT_SERIES_OPTIONS}
              placeholder={t("Select to choose", "Saýlamak üçin basyň")}
              error={errMsg(errors.passport_series)}
              required
            />

            {/* Passport Number */}
            <FormInput
              type="text"
              label={t("Passport number", "Pasport belgisi")}
              value={form.passport_number}
              onChange={setField("passport_number")}
              placeholder={t("Passport number", "Pasport belgisi")}
              error={errMsg(errors.passport_number)}
              required
            />

            {/* Card Number */}
            <FormInput
              type="text"
              label={t("Card number", "Kart belgisi")}
              value={form.card_number}
              onChange={setField("card_number")}
              placeholder={t("Card number", "Kart belgisi")}
              error={errMsg(errors.card_number)}
              required
            />

            {/* Expiry Month + Year side by side */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                type="select"
                label={t("Card expiry month", "Kart Möhleti (aý)")}
                value={form.card_expiry_month}
                onChange={setField("card_expiry_month")}
                options={MONTH_OPTIONS}
                placeholder={t("Select to choose", "Saýlamak üçin basyň")}
                error={errMsg(errors.card_expiry_month)}
                required
              />

              <FormInput
                type="select"
                label={t("Card expiry year", "Kart Möhleti (ýyl)")}
                value={form.card_expiry_year}
                onChange={setField("card_expiry_year")}
                options={YEAR_OPTIONS}
                placeholder={t("Select to choose", "Saýlamak üçin basyň")}
                error={errMsg(errors.card_expiry_year)}
                required
              />
            </div>
          </div>

          <FormActions
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            cancelVariant="ghost"
            cancelLabel={t("Cancel", "Ýatyr")}
            loadingLabel={t("Saving...", "Saklanýar...")}
            submitLabel={
              mode === "create" ? t("Create card transaction", "Kart herekedi dörediň") : t("Save changes", "Üýtgetmeleri sakla")
            }
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

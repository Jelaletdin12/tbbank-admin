// features/currencyRates/components/CurrencyRateForm.tsx

import { useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import { CURRENCY_OPTIONS, type CurrencyRate } from "../api/currencyRatesApi";
import { useCreateCurrencyRate, useUpdateCurrencyRate } from "../hooks/useCurrencyRates";
import { createCurrencyRateFormSchema, DEFAULT_FORM_VALUES, buildPayload, type CurrencyRateFormData } from "../schemas/currencyRate.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrencyRateFormProps {
  mode: "create" | "edit";
  initialData?: CurrencyRate;
}

type FlatErrors = Partial<Record<keyof CurrencyRateFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof CurrencyRateFormData] = msg;
  }
  return result;
}

// ─── CurrencyRateForm ─────────────────────────────────────────────────────────

export function CurrencyRateForm({ mode, initialData }: CurrencyRateFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  const createMutation = useCreateCurrencyRate();
  const updateMutation = useUpdateCurrencyRate(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = useMemo(() => createCurrencyRateFormSchema(t), [t, i18n.language]);

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<CurrencyRateFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          currencyFrom: initialData.currencyFrom,
          currencyTo: initialData.currencyTo,
          value: String(initialData.value),
        }
      : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const setField = useCallback(
    (key: keyof CurrencyRateFormData) => (value: string) => {
      setValue(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const payload = buildPayload(getValues());

    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      navigate("/resources/currency-rates");
    } else {
      await updateMutation.mutateAsync(payload);
      navigate(`/resources/currency-rates/${initialData!.id}`);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      navigate("/resources/currency-rates");
    } else {
      navigate(`/resources/currency-rates/${initialData!.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create"
          ? t("currencyRates.createTitle", "Walýuta kursy dörediň")
          : t("currencyRates.editTitle", "Walýuta kursy üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t("currencyRates.fields.currencyFrom", "Currency from")}
            value={form.currencyFrom}
            onChange={setField("currencyFrom")}
            options={CURRENCY_OPTIONS}
            placeholder={t("common.selectPlaceholder", "Saýlamak üçin basyň")}
            error={errors.currencyFrom}
            disabled={isPending}
            required
          />
          <p className="text-xs text-muted-foreground -mt-3">{t("currencyRates.hints.oneUnit", "1 möçberi")}</p>
        </BentoCard>
        <BentoCard>
          <FormInput
            type="searchable-select"
            label={t("currencyRates.fields.currencyTo", "Currency to")}
            value={form.currencyTo}
            onChange={setField("currencyTo")}
            options={CURRENCY_OPTIONS}
            placeholder={t("common.selectPlaceholder", "Saýlamak üçin basyň")}
            error={errors.currencyTo}
            disabled={isPending}
            required
          />
        </BentoCard>
      </BentoGrid>
      <BentoGrid cols={1}>
        <BentoCard>
          <FormInput
            type="number"
            label={t("currencyRates.fields.value", "Value")}
            value={form.value}
            onChange={setField("value")}
            placeholder={t("currencyRates.fields.value", "Value")}
            error={errors.value}
            disabled={isPending}
            required
          />
          <p className="text-xs text-muted-foreground italic -mt-3">
            {t("currencyRates.hints.decimalNote", 'Bitin däl sanlary "." bilen ýazmaly')}
          </p>
          <FormActions
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            cancelVariant="ghost"
            submitLabel={
              mode === "create"
                ? t("currencyRates.actions.create", "Walýuta kursy dörediň")
                : t("currencyRates.actions.update", "Ýatda sakla")
            }
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

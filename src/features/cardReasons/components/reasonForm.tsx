import { useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { FormActions } from "@/components/formActions";
import { FormInput } from "@/components/formInput";
import { MultiLangInput } from "@/components/multiLangInput";
import { BentoGrid, BentoCard } from "@/components/bento";
import type { CardReason } from "../api/cardReasonsApi";
import { useCreateCardReason, useUpdateCardReason } from "../hooks/useCardReasons";
import { createCardReasonFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/cardReason.schema";
import type { CardReasonFormData } from "../schemas/cardReason.schema";

// ─── Form errors helper ──────────────────────────────────────────────────────

type FlatErrors = Partial<Record<keyof CardReasonFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof CardReasonFormData] = msg;
  }
  return result;
}

// ─── CardReasonForm ─────────────────────────────────────────────────────────────

interface CardReasonFormProps {
  mode: "create" | "edit";
  initialData?: CardReason;
}

function mapInitial(data: CardReason): CardReasonFormData {
  return {
    nameTk: data.name.tk,
    nameRu: data.name.ru,
    nameEn: data.name.en,
    value: String(data.value),
    description: data.description ?? "",
    isActive: data.isActive,
  };
}

export function CardReasonForm({ mode, initialData }: CardReasonFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );
  const navigate = useNavigate();

  const createMutation = useCreateCardReason();
  const updateMutation = useUpdateCardReason();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = useMemo(() => createCardReasonFormSchema(t), [t, i18n.language]);

  const {
    watch,
    setValue,
    getValues,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
  } = useForm<CardReasonFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  const set = useCallback(
    <K extends keyof CardReasonFormData>(key: K, value: CardReasonFormData[K]) => {
      (setValue as (name: K, val: CardReasonFormData[K]) => void)(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  // ── Re-validate on language change ──
  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const values = getValues();
    const payload = buildPayload(values);

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/resources/card-states"),
      });
    } else if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...payload }, { onSuccess: () => navigate("/resources/card-states") });
    }
  };

  const nameFields = {
    tk: { value: form.nameTk, onChange: (v: string) => set("nameTk", v), error: errors.nameTk },
    ru: { value: form.nameRu, onChange: (v: string) => set("nameRu", v), error: errors.nameRu },
    en: { value: form.nameEn, onChange: (v: string) => set("nameEn", v), error: errors.nameEn },
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create" ? t("cardReasons.createTitle", "Sebäp dörediň") : t("cardReasons.editTitle", "Sebäp üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard span="full">
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            {t("cardReasons.fields.name", "Ady")}
            <span className="text-destructive ml-0.5">*</span>
          </p>
          <MultiLangInput fields={nameFields} placeholder={t("cardReasons.fields.name", "Ady")} disabled={isPending} />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="number"
            label={t("cardReasons.fields.value", "Baha")}
            value={form.value}
            onChange={(v) => set("value", v)}
            placeholder={t("cardReasons.fields.value", "Baha")}
            error={errors.value}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("cardReasons.fields.description", "Bellikler")}
            value={form.description}
            onChange={(v) => set("description", v)}
            placeholder={t("cardReasons.fields.description", "Bellikler")}
          />
        </BentoCard>
        <BentoCard>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm font-semibold text-muted-foreground">{t("cardReasons.fields.isActive", "Işjeň")}</span>
            <Checkbox checked={form.isActive} onCheckedChange={(checked) => set("isActive", !!checked)} />
          </div>
        </BentoCard>
      </BentoGrid>
      <FormActions
        isPending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/resources/card-states")}
        cancelVariant="ghost"
        submitLabel={
          mode === "create"
            ? t("cardReasons.actions.create", "Kartyň çykarylmagynyň sebäbini döretdiň")
            : t("cardReasons.actions.update", "Täzelemek")
        }
      />
    </div>
  );
}

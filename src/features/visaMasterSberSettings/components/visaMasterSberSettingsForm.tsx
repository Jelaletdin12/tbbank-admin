import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/formInput";
import { FormActions } from "@/components/formActions";
import { BentoGrid, BentoCard } from "@/components/bento";
import type { VisaMasterSetting } from "../api/visaMasterSberSettingsApi";
import { useCreateVisaMasterSetting, useUpdateVisaMasterSetting } from "../hooks/useVisaMasterSettings";
import { createVisaMasterSettingFormSchema, DEFAULT_FORM_VALUES, buildPayload } from "../schemas/visaMasterSberSetting.schema";
import type { VisaMasterSettingFormData } from "../schemas/visaMasterSberSetting.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisaMasterSettingFormProps {
  mode: "create" | "edit";
  initialData?: VisaMasterSetting;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapInitial(data: VisaMasterSetting): VisaMasterSettingFormData {
  return {
    kod: data.kod,
    ady: data.ady,
    yazgy: data.yazgy,
  };
}

type FlatErrors = Partial<Record<keyof VisaMasterSettingFormData, string>>;

function flattenErrors(errors: Record<string, { message?: string } | undefined>): FlatErrors {
  const result: FlatErrors = {};
  for (const key of Object.keys(errors)) {
    const msg = errors[key]?.message;
    if (msg) result[key as keyof VisaMasterSettingFormData] = msg;
  }
  return result;
}

// ─── VisaMasterSettingForm ────────────────────────────────────────────────────

export function VisaMasterSettingForm({ mode, initialData }: VisaMasterSettingFormProps) {
  const { t: _t, i18n } = useTranslation();
  const t: (key: string, fallback?: string) => string = useCallback(
    (key, fallback) => _t(key, fallback ?? key) as string,
    [_t, i18n.language],
  );

  const errMsg = (msg: string | undefined) => (!msg ? undefined : msg.startsWith("validation.") ? t(msg, msg) : msg);
  const navigate = useNavigate();

  const createMutation = useCreateVisaMasterSetting();
  const updateMutation = useUpdateVisaMasterSetting(initialData?.id ?? 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = useMemo(
    () => createVisaMasterSettingFormSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const {
    watch,
    setValue,
    formState: { errors: rhfErrors },
    clearErrors,
    trigger,
    getValues,
  } = useForm<VisaMasterSettingFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...mapInitial(initialData) } : DEFAULT_FORM_VALUES,
  });

  const form = watch();
  const errors = useMemo(() => flattenErrors(rhfErrors as Record<string, { message?: string } | undefined>), [rhfErrors]);

  useEffect(() => {
    if (Object.keys(rhfErrors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const set = useCallback(
    (key: keyof VisaMasterSettingFormData) => (value: string) => {
      setValue(key, value);
      clearErrors(key);
    },
    [setValue, clearErrors],
  );

  const handleSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error(t("common.errors.fillRequiredCorrectly", "Dogry maglumat girizmegiňizi haýyş edýäris."));
      return;
    }

    const payload = buildPayload(getValues());

    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      navigate("/resources/visa-master-settings");
    } else {
      await updateMutation.mutateAsync(payload);
      navigate("/resources/visa-master-settings");
    }
  }, [mode, createMutation, updateMutation, navigate, trigger, getValues, t]);

  const handleCancel = () => navigate("/resources/visa-master-settings");

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">
        {mode === "create"
          ? t("visaMasterSettings.createTitle", "Visa/Master, Sber sazlamalar dörediň")
          : t("visaMasterSettings.editTitle", "Visa/Master, Sber sazlamalar üýtgetmek")}
      </h1>
      <BentoGrid cols={2}>
        <BentoCard>
          <FormInput
            type="text"
            label={t("visaMasterSettings.fields.kod", "Kod")}
            value={form.kod}
            onChange={set("kod")}
            placeholder={t("visaMasterSettings.fields.kod", "Kod")}
            error={errMsg(errors.kod)}
            disabled={isPending}
            required
          />
        </BentoCard>
        <BentoCard>
          <FormInput
            type="text"
            label={t("visaMasterSettings.fields.ady", "Ady")}
            value={form.ady}
            onChange={set("ady")}
            placeholder={t("visaMasterSettings.fields.ady", "Ady")}
            error={errMsg(errors.ady)}
            disabled={isPending}
            required
          />
        </BentoCard>
      </BentoGrid>
      <BentoGrid cols={1}>
        <BentoCard>
          <FormInput
            type="textarea"
            label={t("visaMasterSettings.fields.yazgy", "Yazgy")}
            value={form.yazgy}
            onChange={set("yazgy")}
            placeholder={t("visaMasterSettings.fields.yazgy", "Yazgy")}
            error={errMsg(errors.yazgy)}
            disabled={isPending}
            rows={3}
            required
          />
          <FormActions
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            cancelVariant="ghost"
            submitLabel={
              mode === "create"
                ? t("visaMasterSettings.actions.create", "Visa/Master, Sber sazlamalar dörediň")
                : t("visaMasterSettings.actions.update", "Ýatda sakla")
            }
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
